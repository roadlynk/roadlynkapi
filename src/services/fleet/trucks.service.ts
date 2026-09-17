import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ActionResourceType } from '../../common/enums/action-resource-type.enum';
import { errorCode } from '../../common/error.index';
import { CreateTruckDto } from '../../dto/fleet/create-truck.dto';
import { ChangeTruckActiveStatusDto } from '../../dto/fleet/change-truck-active-status.dto';
import { GetTrucksByOwnerQueryDto } from '../../dto/fleet/get-trucks-by-owner-query.dto';
import { GetTrucksQueryDto } from '../../dto/fleet/get-trucks-query.dto';
import { UpdateTruckDto } from '../../dto/fleet/update-truck.dto';
import { ActionRepository } from '../../repositories/action.repository';
import { OwnerRepository } from '../../repositories/owner.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

const MAX_TDS_TRUCK_NUMBERS = 10;

@Injectable()
export class TrucksService {
  constructor(
    private readonly truckRepository: TruckRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly actionRepository: ActionRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAllByCompany(actor: Actor, query: GetTrucksQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.truckRepository.findAllByCompanyWithOwner(
      query.companyId,
      query.active,
    );
  }

  async getAllByOwner(actor: Actor, query: GetTrucksByOwnerQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.truckRepository.findAllByOwnerAndActiveStatus(
      query.companyId,
      query.ownerId,
      query.active,
    );
  }

  async getById(actor: Actor, truckId: string) {
    const truck = await this.truckRepository.findById(truckId);

    if (!truck) {
      throw new NotFoundException({
        message: 'Truck not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      truck.companyId.toString(),
    );

    return this.truckRepository.findByIdWithOwner(truckId);
  }

  async create(actor: Actor, dto: CreateTruckDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.truckRepository.findByUniqueIdentifier(
      dto.companyId,
      dto.truckNumber,
      dto.chasisNumber,
    );

    if (existing) {
      throw new ConflictException({
        message:
          'Truck with the same truck number or chasis number already exists for this company',
        error_code: errorCode.truck.duplicateTruckIdentifier,
      });
    }

    await this.checkTdsTruckNumber(actor, dto.truckNumber, dto.ownerId);

    try {
      return await this.truckRepository.create({
        ...dto,
        companyId: new Types.ObjectId(dto.companyId),
        ownerId: new Types.ObjectId(dto.ownerId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Truck with the same truck number or chasis number already exists for this company',
          error_code: errorCode.truck.duplicateTruckIdentifier,
        });
      }

      throw error;
    }
  }

  async update(actor: Actor, truckId: string, dto: UpdateTruckDto) {
    const truck = await this.truckRepository.findById(truckId);

    if (!truck) {
      throw new NotFoundException({
        message: 'Truck not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    const companyId = truck.companyId.toString();

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    if (dto.truckNumber || dto.chasisNumber) {
      const existing = await this.truckRepository.findByUniqueIdentifierExcludingId(
        truckId,
        companyId,
        dto.truckNumber,
        dto.chasisNumber,
      );

      if (existing) {
        throw new ConflictException({
          message:
            'Truck with the same truck number or chasis number already exists for this company',
          error_code: errorCode.truck.duplicateTruckIdentifier,
        });
      }
    }

    if (dto.ownerId && dto.ownerId !== truck.ownerId.toString()) {
      await this.checkTdsTruckNumber(
        actor,
        dto.truckNumber ?? truck.truckNumber,
        dto.ownerId,
      );
    }

    try {
      const updated = await this.truckRepository.updateById(truckId, {
        ...dto,
        ownerId: dto.ownerId ? new Types.ObjectId(dto.ownerId) : undefined,
      });

      if (!updated) {
        throw new NotFoundException({
          message: 'Truck not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Truck with the same truck number or chasis number already exists for this company',
          error_code: errorCode.truck.duplicateTruckIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    dto: ChangeTruckActiveStatusDto,
  ) {
    const trucks = await this.truckRepository.findByIds(dto.truckIds);

    if (trucks.length !== dto.truckIds.length) {
      throw new NotFoundException({
        message: 'One or more trucks were not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await Promise.all(
      trucks.map((truck) =>
        this.authorizationService.isAuthorisedtoAccessCompany(
          actor,
          truck.companyId.toString(),
        ),
      ),
    );

    const trucksToUpdate = dto.isActive
      ? (
          await Promise.all(
            trucks.map(async (truck) => ({
              truck,
              owner: await this.ownerRepository.findById(
                truck.ownerId.toString(),
              ),
            })),
          )
        )
          .filter(({ owner }) => owner?.isActive)
          .map(({ truck }) => truck)
      : trucks;

    return Promise.all(
      trucksToUpdate.map((truck) =>
        this.truckRepository.updateById(truck.id, { isActive: dto.isActive }),
      ),
    );
  }

  async checkTdsTruckNumber(
    actor: Actor,
    truckNumber: string,
    ownerId: string,
  ) {
    const owner = await this.ownerRepository.findById(ownerId);

    if (!owner) {
      throw new NotFoundException({
        message: 'Owner not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      owner.companyId.toString(),
    );

    const tdsTruckNumber = owner.tdsTruckNumber ?? [];

    if (tdsTruckNumber.includes(truckNumber)) {
      return true;
    }

    if (tdsTruckNumber.length >= MAX_TDS_TRUCK_NUMBERS) {
      throw new BadRequestException({
        message:
          'TRUCK limit crossed 10, change the TDS of the owner before onboarding the truck',
        error_code: errorCode.truck.tdsTruckLimitExceeded,
      });
    }

    if (owner.tdsCertificateUrl) {
      await this.actionRepository.create({
        companyId: owner.companyId,
        resourceType: ActionResourceType.OWNER,
        resourceId: new Types.ObjectId(ownerId),
        text: `Get updated TDS by including the new lorry number ${truckNumber} from the owener ${owner.name}`,
      });
    }

    await this.ownerRepository.updateById(ownerId, {
      tdsTruckNumber: [...tdsTruckNumber, truckNumber],
    });

    return true;
  }
}
