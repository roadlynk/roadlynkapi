import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateDeliveryChallanDto } from '../../dto/trip/create-delivery-challan.dto';
import { GetDeliveryChallansQueryDto } from '../../dto/trip/get-delivery-challans-query.dto';
import { UpdateDeliveryChallanDto } from '../../dto/trip/update-delivery-challan.dto';
import { CompanyRepository } from '../../repositories/company.repository';
import { DeliveryChallanRepository } from '../../repositories/delivery-challan.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class DeliveryChallanService {
  constructor(
    private readonly deliveryChallanRepository: DeliveryChallanRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
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
}
