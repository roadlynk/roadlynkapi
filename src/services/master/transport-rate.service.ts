import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CalculateTransportRateDto } from '../../dto/master/calculate-transport-rate.dto';
import { CreateTransportRateDto } from '../../dto/master/create-transport-rate.dto';
import { GetTransportRatesQueryDto } from '../../dto/master/get-transport-rates-query.dto';
import { TransportRateRepository } from '../../repositories/transport-rate.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import { DeliveryChallanService } from '../trip/delivery-challan.service';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class TransportRateService {
  constructor(
    private readonly transportRateRepository: TransportRateRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
    private readonly deliveryChallanService: DeliveryChallanService,
    private readonly truckRepository: TruckRepository,
  ) {}

  async create(actor: Actor, dto: CreateTransportRateDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const activeRates = await this.transportRateRepository.findActiveByCombination(
      dto.companyId,
      dto.consignorId,
      dto.consignorBranchId,
      dto.consigneeId,
      dto.dealerId,
      dto.materialId,
    );

    if (activeRates.length > 0) {
      const deactivationEffectiveTo = new Date(dto.effectiveFrom);
      deactivationEffectiveTo.setDate(deactivationEffectiveTo.getDate() - 1);

      await this.transportRateRepository.deactivateByIds(
        activeRates.map((rate) => rate._id),
        deactivationEffectiveTo,
      );
    }

    const createdRate = await this.transportRateRepository.create({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      consignorId: new Types.ObjectId(dto.consignorId),
      consignorBranchId: new Types.ObjectId(dto.consignorBranchId),
      consigneeId: new Types.ObjectId(dto.consigneeId),
      dealerId: new Types.ObjectId(dto.dealerId),
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: null,
      materialId: new Types.ObjectId(dto.materialId),
      isActive: true,
    });

    const allDCRecordsToUpdate = await this.deliveryChallanService.getAllByCombination(
      actor,
      dto.companyId,
      dto.consignorId,
      dto.consignorBranchId,
      dto.consigneeId,
      dto.dealerId,
      dto.materialId,
      dto.effectiveFrom,
    );

    const trucks = await this.truckRepository.findByIds(
      allDCRecordsToUpdate.map((dc) => dc.truckDetails.truckId.toString()),
    );
    const truckCapacityById = new Map(
      trucks.map((truck) => [truck._id.toString(), truck.capacity]),
    );

    const updatedDcNumbers: string[] = [];

    for (const dc of allDCRecordsToUpdate) {
      const truckCapacity = truckCapacityById.get(
        dc.truckDetails.truckId.toString(),
      );

      const result = await this.getTransportRateAndLocation(actor, {
        companyId: dto.companyId,
        consignorId: dto.consignorId,
        consignorBranchId: dto.consignorBranchId,
        consigneeId: dto.consigneeId,
        dealerId: dto.dealerId,
        materialId: dto.materialId,
        loadCapacity: dc.material.loadingQuantity,
        truckCapacity: truckCapacity as number,
      });

      const totalTransportRate =
        result.finalTransportRate +
        (dc.rate.transportIncentive ?? 0) -
        (dc.rate.biddingAmount ?? 0);

      await this.deliveryChallanService.updateRateDetails(
        dc._id.toString(),
        result.finalTransportRate,
        totalTransportRate,
        result.calculatedDistance,
        result.companyDistance,
      );

      updatedDcNumbers.push(dc.dcNumber);
    }

    return { createdRate, updatedDcNumbers };
  }

  async getByFilters(actor: Actor, query: GetTransportRatesQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    const filters: Record<string, Types.ObjectId | boolean> = {
      companyId: new Types.ObjectId(query.companyId),
    };

    for (const field of [
      'consignorId',
      'consignorBranchId',
      'consigneeId',
      'dealerId',
      'materialId',
    ] as const) {
      if (query[field]) {
        filters[field] = new Types.ObjectId(query[field]);
      }
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }

    return this.transportRateRepository.findByFilters(filters);
  }

  async getTransportRateAndLocation(
    actor: Actor,
    dto: CalculateTransportRateDto,
    companyDate?: Date | string,
  ) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const effectiveDate = companyDate ?? dto.companyDate ?? new Date();

    const transportRate =
      await this.transportRateRepository.findOneActiveByCombination(
        dto.companyId,
        dto.consignorId,
        dto.consignorBranchId,
        dto.consigneeId,
        dto.dealerId,
        dto.materialId,
        effectiveDate,
      );

    if (!transportRate) {
      throw new NotFoundException('Active transport rate not found');
    }

    const tonnageRate = this.findTonnageRate(
      transportRate.tonnageRate,
      dto.truckCapacity,
    );
    let finalTransportRate;
    if((dto.loadCapacity - dto.truckCapacity) <= 0){
      finalTransportRate = tonnageRate[0];
    } else if ((dto.loadCapacity - dto.truckCapacity) === 1) {
      finalTransportRate = tonnageRate[1];
    } else {
      finalTransportRate = tonnageRate[2];
    }

    if (finalTransportRate === undefined) {
      throw new BadRequestException(
        'Selected tonnage rate does not have a transport rate for this load capacity',
      );
    }

    return {
      finalTransportRate,
      calculatedDistance: transportRate.calculatedDistance,
      companyDistance: transportRate.companyDistance,
    };
  }

  private findTonnageRate(
    tonnageRate: Array<{
      fromLimit: number;
      toLimit: number;
      transportRate: number[];
    }>,
    truckCapacity: number,
  ) {
    const matchedRates = tonnageRate.filter(
      (rate) =>
        truckCapacity >= rate.fromLimit && truckCapacity <= rate.toLimit,
    );

    if (matchedRates.length === 0) {
      throw new BadRequestException(
        'No transport rate found for the specified load capacity',
      );
    }

    return matchedRates[0].transportRate;
  }
}
