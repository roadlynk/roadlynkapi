import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateOwnerDto } from '../../dto/fleet/create-owner.dto';
import { ChangeOwnerActiveStatusDto } from '../../dto/fleet/change-owner-active-status.dto';
import { GetOwnersQueryDto } from '../../dto/fleet/get-owners-query.dto';
import { UpdateOwnerDto } from '../../dto/fleet/update-owner.dto';
import { OwnerRepository } from '../../repositories/owner.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class OwnersService {
  constructor(
    private readonly ownerRepository: OwnerRepository,
    private readonly truckRepository: TruckRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAllByCompany(actor: Actor, query: GetOwnersQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.ownerRepository.findAllByCompanyAndActiveStatus(
      query.companyId,
      query.active,
    );
  }

  async create(actor: Actor, dto: CreateOwnerDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    this.validateNoDuplicateTdsTruckNumber(dto.tdsTruckNumber);

    const existing = await this.ownerRepository.findByUniqueIdentifier(
      dto.companyId,
      dto.panNumber,
      dto.phoneNumber,
      dto.email,
      dto.aadharNumber,
    );

    if (existing) {
      throw new ConflictException({
        message:
          'Owner with the same PAN, phone number, email, or Aadhar number already exists for this company',
        error_code: errorCode.owner.duplicateOwnerIdentifier,
      });
    }

    try {
      return await this.ownerRepository.create({
        ...dto,
        companyId: new Types.ObjectId(dto.companyId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Owner with the same PAN, phone number, email, or Aadhar number already exists for this company',
          error_code: errorCode.owner.duplicateOwnerIdentifier,
        });
      }

      throw error;
    }
  }

  async getById(actor: Actor, ownerId: string) {
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

    return owner;
  }

  async update(actor: Actor, ownerId: string, dto: UpdateOwnerDto) {
    const owner = await this.ownerRepository.findById(ownerId);

    if (!owner) {
      throw new NotFoundException({
        message: 'Owner not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    const companyId = owner.companyId.toString();

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    this.validateNoDuplicateTdsTruckNumber(dto.tdsTruckNumber);

    if (dto.panNumber || dto.phoneNumber || dto.email || dto.aadharNumber) {
      const existing = await this.ownerRepository.findByUniqueIdentifierExcludingId(
        ownerId,
        companyId,
        dto.panNumber,
        dto.phoneNumber,
        dto.email,
        dto.aadharNumber,
      );

      if (existing) {
        throw new ConflictException({
          message:
            'Owner with the same PAN, phone number, email, or Aadhar number already exists for this company',
          error_code: errorCode.owner.duplicateOwnerIdentifier,
        });
      }
    }

    try {
      const updated = await this.ownerRepository.updateById(ownerId, dto);

      if (!updated) {
        throw new NotFoundException({
          message: 'Owner not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Owner with the same PAN, phone number, email, or Aadhar number already exists for this company',
          error_code: errorCode.owner.duplicateOwnerIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    ownerId: string,
    dto: ChangeOwnerActiveStatusDto,
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

    if (!dto.isActive) {
      const activeTrucks =
        await this.truckRepository.findAllByOwnerAndActiveStatus(
          owner.companyId.toString(),
          ownerId,
          true,
        );

      if (activeTrucks.length) {
        throw new BadRequestException({
          message:
            'Owner cannot be deactivated while they have active trucks',
          error_code: errorCode.apiCommon.badRequest,
        });
      }
    }

    const updated = await this.ownerRepository.updateById(ownerId, {
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'Owner not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }

  private validateNoDuplicateTdsTruckNumber(tdsTruckNumber?: string[]) {
    if (!tdsTruckNumber?.length) {
      return;
    }

    const uniqueValues = new Set(tdsTruckNumber);

    if (uniqueValues.size !== tdsTruckNumber.length) {
      throw new BadRequestException({
        message: 'tdsTruckNumber must not contain duplicate values',
        error_code: errorCode.owner.duplicateTdsTruckNumber,
      });
    }
  }
}

