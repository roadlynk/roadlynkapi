import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { Types } from 'mongoose';
import { join } from 'path';
import { errorCode } from '../../common/error.index';
import { AddressType } from '../../common/enums/address-type.enum';
import { CreateDeliveryChallanDto } from '../../dto/trip/create-delivery-challan.dto';
import { FilterDeliveryChallansDto } from '../../dto/trip/filter-delivery-challans.dto';
import { GetDeliveryChallansQueryDto } from '../../dto/trip/get-delivery-challans-query.dto';
import { UpdateDeliveryChallanDto } from '../../dto/trip/update-delivery-challan.dto';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { CompanyRepository } from '../../repositories/company.repository';
import { DealerRepository } from '../../repositories/dealer.repository';
import { DeliveryChallanRepository } from '../../repositories/delivery-challan.repository';
import { DriverRepository } from '../../repositories/driver.repository';
import { MaterialRepository } from '../../repositories/material.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import {
  ClientBranchDocument,
} from '../../schemas/master/company-specific/client-branch.schema';
import { DealerDocument } from '../../schemas/master/company-specific/dealer.schema';
import { PdfService } from '../common/pdf.service';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

const DC_PDF_TEMPLATE_PATH = join(
  __dirname,
  '../../templates/delivery-challan/dc.template.html',
);

@Injectable()
export class DeliveryChallanService {
  constructor(
    private readonly deliveryChallanRepository: DeliveryChallanRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly clientRepository: ClientRepository,
    private readonly clientBranchRepository: ClientBranchRepository,
    private readonly truckRepository: TruckRepository,
    private readonly driverRepository: DriverRepository,
    private readonly dealerRepository: DealerRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
    private readonly pdfService: PdfService,
  ) {}

  async getAll(actor: Actor, query: GetDeliveryChallansQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.deliveryChallanRepository.findAllPaginatedByCompany(
      query.companyId,
      query.active ?? true,
      query.page,
      query.limit,
    );
  }

  async getByFilters(actor: Actor, dto: FilterDeliveryChallansDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    return this.deliveryChallanRepository.findByFilters(
      this.buildFilterQuery(dto),
    );
  }

  async exportToExcel(actor: Actor, dto: FilterDeliveryChallansDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const deliveryChallans = await this.deliveryChallanRepository.findByFilters(
      this.buildFilterQuery(dto),
    );

    const truckIds = new Set<string>();
    const materialIds = new Set<string>();
    const dealerIds = new Set<string>();
    const consigneeIds = new Set<string>();
    const consigneeBranchIds = new Set<string>();

    for (const dc of deliveryChallans) {
      truckIds.add(dc.truckDetails.truckId.toString());
      materialIds.add(dc.material.materialId.toString());
      dealerIds.add(dc.dealerDetails.invoiceDealerId.toString());
      dealerIds.add(dc.dealerDetails.shipToDealerId.toString());
      consigneeIds.add(dc.consignment.consigneeId.toString());
      consigneeBranchIds.add(dc.consignment.consigneeBranchId.toString());
    }

    const [trucks, materials, dealers, consignees, consigneeBranches] =
      await Promise.all([
        this.truckRepository.findByIds([...truckIds]),
        this.materialRepository.findByIds([...materialIds]),
        this.dealerRepository.findByIds([...dealerIds]),
        this.clientRepository.findByIds([...consigneeIds]),
        this.clientBranchRepository.findByIds([...consigneeBranchIds]),
      ]);

    const truckById = new Map(trucks.map((truck) => [truck._id.toString(), truck]));
    const materialById = new Map(
      materials.map((material) => [material._id.toString(), material]),
    );
    const dealerById = new Map(dealers.map((dealer) => [dealer._id.toString(), dealer]));
    const consigneeById = new Map(
      consignees.map((consignee) => [consignee._id.toString(), consignee]),
    );
    const consigneeBranchById = new Map(
      consigneeBranches.map((branch) => [branch._id.toString(), branch]),
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Delivery Challans');

    worksheet.columns = [
      { header: 'DC Number', key: 'dcNumber', width: 18 },
      { header: 'DC Date', key: 'dcDate', width: 14 },
      { header: 'Company Invoice', key: 'companyInvoice', width: 18 },
      { header: 'Shipment Number', key: 'shipmentNumber', width: 18 },
      { header: 'Truck Number', key: 'truckNumber', width: 14 },
      { header: 'Truck Capacity', key: 'truckCapacity', width: 14 },
      { header: 'Material', key: 'material', width: 18 },
      { header: 'Delivery Category', key: 'deliveryCategory', width: 18 },
      { header: 'Consignee Name', key: 'consigneeName', width: 20 },
      { header: 'Consignee Branch Name', key: 'consigneeBranchName', width: 22 },
      { header: 'Invoice Dealer Name', key: 'invoiceDealerName', width: 20 },
      { header: 'Invoice Dealer Code', key: 'invoiceDealerCode', width: 18 },
      { header: 'Ship To Dealer Name', key: 'shipToDealerName', width: 20 },
      { header: 'Ship To Dealer Code', key: 'shipToDealerCode', width: 18 },
      { header: 'Load Quantity', key: 'loadQuantity', width: 14 },
      { header: 'Total Advance', key: 'totalAdvance', width: 14 },
      { header: 'Total Transport Rate', key: 'totalTransportRate', width: 18 },
    ];

    for (const dc of deliveryChallans) {
      const truck = truckById.get(dc.truckDetails.truckId.toString());
      const material = materialById.get(dc.material.materialId.toString());
      const invoiceDealer = dealerById.get(
        dc.dealerDetails.invoiceDealerId.toString(),
      );
      const shipToDealer = dealerById.get(
        dc.dealerDetails.shipToDealerId.toString(),
      );
      const consignee = consigneeById.get(dc.consignment.consigneeId.toString());
      const consigneeBranch = consigneeBranchById.get(
        dc.consignment.consigneeBranchId.toString(),
      );

      worksheet.addRow({
        dcNumber: dc.dcNumber,
        dcDate: dc.dcDate?.toLocaleDateString() ?? '',
        companyInvoice: dc.companyDetails.invoice,
        shipmentNumber: dc.companyDetails.shipmentNumber,
        truckNumber: truck?.truckNumber ?? '',
        truckCapacity: truck?.capacity ?? '',
        material: material?.material ?? '',
        deliveryCategory: dc.material.deliveryCategory ?? '',
        consigneeName: consignee?.name ?? '',
        consigneeBranchName: consigneeBranch?.branchName ?? '',
        invoiceDealerName: invoiceDealer?.dealerName ?? '',
        invoiceDealerCode: invoiceDealer?.code ?? '',
        shipToDealerName: shipToDealer?.dealerName ?? '',
        shipToDealerCode: shipToDealer?.code ?? '',
        loadQuantity: dc.material.loadingQuantity,
        totalAdvance: dc.advance.totalAdvance ?? 0,
        totalTransportRate: dc.rate.totalTransportRate ?? 0,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildFilterQuery(dto: FilterDeliveryChallansDto) {
    const filters: Record<string, unknown> = {
      companyId: new Types.ObjectId(dto.companyId),
    };

    if (dto.consignment) {
      const { consignorId, consignorBranchId, consigneeId, consigneeBranchId } =
        dto.consignment;

      if (consignorId) {
        filters['consignment.consignorId'] = new Types.ObjectId(consignorId);
      }
      if (consignorBranchId) {
        filters['consignment.consignorBranchId'] = new Types.ObjectId(
          consignorBranchId,
        );
      }
      if (consigneeId) {
        filters['consignment.consigneeId'] = new Types.ObjectId(consigneeId);
      }
      if (consigneeBranchId) {
        filters['consignment.consigneeBranchId'] = new Types.ObjectId(
          consigneeBranchId,
        );
      }
    }

    if (dto.dealerDetails) {
      const { invoiceDealerId, shipToDealerId } = dto.dealerDetails;

      if (invoiceDealerId) {
        filters['dealerDetails.invoiceDealerId'] = new Types.ObjectId(
          invoiceDealerId,
        );
      }
      if (shipToDealerId) {
        filters['dealerDetails.shipToDealerId'] = new Types.ObjectId(
          shipToDealerId,
        );
      }
    }

    if (dto.material) {
      const { materialId, deliveryCategory, dynamicFields } = dto.material;

      if (materialId) {
        filters['material.materialId'] = new Types.ObjectId(materialId);
      }
      if (deliveryCategory) {
        filters['material.deliveryCategory'] = deliveryCategory;
      }
      if (dynamicFields) {
        for (const [key, value] of Object.entries(dynamicFields)) {
          filters[`material.dynamicFields.${key}`] = value;
        }
      }
    }

    if (dto.truckDetails) {
      const { truckId, driverId } = dto.truckDetails;

      if (truckId) {
        filters['truckDetails.truckId'] = new Types.ObjectId(truckId);
      }
      if (driverId) {
        filters['truckDetails.driverId'] = new Types.ObjectId(driverId);
      }
    }

    if (dto.companyDetails) {
      const { invoice, shipmentNumber, fromDate, toDate } = dto.companyDetails;

      if (invoice) {
        filters['companyDetails.invoice'] = invoice;
      }
      if (shipmentNumber) {
        filters['companyDetails.shipmentNumber'] = shipmentNumber;
      }
      if (fromDate || toDate) {
        filters['companyDetails.date'] = {
          ...(fromDate ? { $gte: new Date(fromDate) } : {}),
          ...(toDate ? { $lte: new Date(toDate) } : {}),
        };
      }
    }

    if (dto.dcDateFrom || dto.dcDateTo) {
      filters.dcDate = {
        ...(dto.dcDateFrom ? { $gte: new Date(dto.dcDateFrom) } : {}),
        ...(dto.dcDateTo ? { $lte: new Date(dto.dcDateTo) } : {}),
      };
    }

    if (dto.isActive !== undefined) {
      filters.isActive = dto.isActive;
    }

    return filters;
  }

  updateRateDetails(
    deliveryChallanId: string,
    transportRate: number,
    totalTransportRate: number,
  ) {
    return this.deliveryChallanRepository.updateRateDetails(
      deliveryChallanId,
      transportRate,
      totalTransportRate,
    );
  }

  async getAllByCombination(
    actor: Actor,
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
    consigneeId: string,
    dealerId: string,
    materialId: string,
    effectiveFrom: string,
  ) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    return this.deliveryChallanRepository.findAllByCombination(
      companyId,
      consignorId,
      consignorBranchId,
      consigneeId,
      dealerId,
      materialId,
      new Date(effectiveFrom),
    );
  }

  async create(actor: Actor, dto: CreateDeliveryChallanDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const company = await this.companyRepository.findById(dto.companyId);

    if (!company) {
      throw new NotFoundException({
        message: 'Company not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    const payload = {
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      consignment: {
        ...dto.consignment,
        consignorId: new Types.ObjectId(dto.consignment.consignorId),
        consignorBranchId: new Types.ObjectId(dto.consignment.consignorBranchId),
        consigneeId: new Types.ObjectId(dto.consignment.consigneeId),
        consigneeBranchId: new Types.ObjectId(dto.consignment.consigneeBranchId),
      },
      truckDetails: {
        truckId: new Types.ObjectId(dto.truckDetails.truckId),
        driverId: new Types.ObjectId(dto.truckDetails.driverId),
      },
      dealerDetails: {
        ...dto.dealerDetails,
        invoiceDealerId: new Types.ObjectId(dto.dealerDetails.invoiceDealerId),
        shipToDealerId: new Types.ObjectId(dto.dealerDetails.shipToDealerId),
      },
      material: {
        ...dto.material,
        materialId: new Types.ObjectId(dto.material.materialId),
      },
    };

    // Atomic $inc guarantees each concurrent request gets a unique sequence.
    const sequence = await this.companyRepository.incrementDcSequence(dto.companyId);
    const dcNumber = `${company.companyCode}-DC-${String(sequence).padStart(5, '0')}`;

    try {
      return await this.deliveryChallanRepository.create({
        ...payload,
        sequence,
        dcNumber,
      } as any);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'A delivery challan with the same DC number already exists',
          error_code: errorCode.deliveryChallan.duplicateDcNumber,
        });
      }

      throw error;
    }
  }

  async update(
    actor: Actor,
    deliveryChallanId: string,
    dto: UpdateDeliveryChallanDto,
  ) {
    const deliveryChallan =
      await this.deliveryChallanRepository.findById(deliveryChallanId);

    if (!deliveryChallan) {
      throw new NotFoundException({
        message: 'Delivery challan not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      deliveryChallan.companyId.toString(),
    );

    const update: Record<string, unknown> = { ...dto };

    if (dto.dcDate) update.dcDate = new Date(dto.dcDate);
    if (dto.consignment) {
      update.consignment = {
        ...dto.consignment,
        consignorId: new Types.ObjectId(dto.consignment.consignorId),
        consignorBranchId: new Types.ObjectId(dto.consignment.consignorBranchId),
        consigneeId: new Types.ObjectId(dto.consignment.consigneeId),
        consigneeBranchId: new Types.ObjectId(dto.consignment.consigneeBranchId),
      };
    }
    if (dto.truckDetails) {
      update.truckDetails = {
        truckId: new Types.ObjectId(dto.truckDetails.truckId),
        driverId: new Types.ObjectId(dto.truckDetails.driverId),
      };
    }
    if (dto.dealerDetails) {
      update.dealerDetails = {
        ...dto.dealerDetails,
        invoiceDealerId: new Types.ObjectId(dto.dealerDetails.invoiceDealerId),
        shipToDealerId: new Types.ObjectId(dto.dealerDetails.shipToDealerId),
      };
    }
    if (dto.material) {
      update.material = {
        ...dto.material,
        materialId: new Types.ObjectId(dto.material.materialId),
      };
    }

    const updated = await this.deliveryChallanRepository.updateById(
      deliveryChallanId,
      update,
    );

    if (!updated) {
      throw new NotFoundException({
        message: 'Delivery challan not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }

  async getPdf(actor: Actor, deliveryChallanId: string) {
    const deliveryChallan =
      await this.deliveryChallanRepository.findById(deliveryChallanId);

    if (!deliveryChallan) {
      throw new NotFoundException({
        message: 'Delivery challan not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      deliveryChallan.companyId.toString(),
    );

    const [consignor, consignorBranch, consignee, truck, driver, shipToDealer] =
      await Promise.all([
        this.clientRepository.findById(
          deliveryChallan.consignment.consignorId.toString(),
        ),
        this.clientBranchRepository.findById(
          deliveryChallan.consignment.consignorBranchId.toString(),
        ),
        this.clientRepository.findById(
          deliveryChallan.consignment.consigneeId.toString(),
        ),
        this.truckRepository.findById(
          deliveryChallan.truckDetails.truckId.toString(),
        ),
        this.driverRepository.findById(
          deliveryChallan.truckDetails.driverId.toString(),
        ),
        this.dealerRepository.findById(
          deliveryChallan.dealerDetails.shipToDealerId.toString(),
        ),
      ]);

    const pdfBuffer = await this.pdfService.generateFromTemplate(
      DC_PDF_TEMPLATE_PATH,
      {
        dcNumber: deliveryChallan.dcNumber,
        dcDateAndTime: deliveryChallan.dcDate?.toLocaleString() ?? '',
        consignorName: consignor?.name ?? '',
        consignorBranchName: consignorBranch?.branchName ?? '',
        consignorBranchAddress: this.getBranchAddress(consignorBranch),
        consigneeName: consignee?.name ?? '',
        shipToAddress: this.getDealerAddressLabel(shipToDealer),
        truckNumber: truck?.truckNumber ?? '',
        loadingQuantity: deliveryChallan.material.loadingQuantity,
        companyKms: deliveryChallan.distance.companyDistance ?? 0,
        companyInvoiceNo: deliveryChallan.companyDetails.invoice,
        companyShipmentNo: deliveryChallan.companyDetails.shipmentNumber,
        transportRate: deliveryChallan.rate.transportRate,
        cashAdvance: deliveryChallan.advance.cashAdvance ?? 0,
        dieselAdvance: deliveryChallan.advance.dieselAdvance ?? 0,
        odometerKilometers: deliveryChallan.distance.odometerDistance ?? 0,
        driverName: driver?.name ?? '',
        driverContact: driver?.mobileNumber ?? '',
      },
    );

    return { dcNumber: deliveryChallan.dcNumber, pdfBuffer };
  }

  private getDealerAddressLabel(dealer: DealerDocument | null) {
    if (!dealer) return '';

    const fullAddress =
      dealer.address?.type === AddressType.PINCODE
        ? (dealer.address.pincodeAddress?.fullAddress ?? '')
        : (dealer.address.coordinatesAddress?.fullAddress ?? '');

    return [dealer.dealerName, fullAddress].filter(Boolean).join(', ');
  }

  private getBranchAddress(branch: ClientBranchDocument | null) {
    if (!branch) return '';

    return branch.address?.type === AddressType.PINCODE
      ? (branch.address.pincodeAddress?.fullAddress ?? '')
      : (branch.address.coordinatesAddress?.fullAddress ?? '');
  }
}
