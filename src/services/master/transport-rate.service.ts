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
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class TransportRateService {
  constructor(
    private readonly transportRateRepository: TransportRateRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
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
      await this.transportRateRepository.deactivateByIds(
        activeRates.map((rate) => rate._id),
        new Date(),
      );
    }

    return this.transportRateRepository.create({
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
  ) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const transportRate =
      await this.transportRateRepository.findOneActiveByCombination(
        dto.companyId,
        dto.consignorId,
        dto.consignorBranchId,
        dto.consigneeId,
        dto.dealerId,
        dto.materialId,
      );

    if (!transportRate) {
      throw new NotFoundException('Active transport rate not found');
    }

    const tonnageRate = this.findTonnageRate(
      transportRate.tonnageRate,
      dto.loadCapacity,
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
    loadCapacity: number,
  ) {
    const matchedRates = tonnageRate.filter(
      (rate) =>
        loadCapacity >= rate.fromLimit && loadCapacity <= rate.toLimit,
    );

    if (matchedRates.length === 0) {
      throw new BadRequestException(
        'No transport rate found for the specified load capacity',
      );
    }

    return matchedRates[0].transportRate;
  }
}
