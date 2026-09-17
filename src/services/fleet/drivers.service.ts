import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { ChangeDriverActiveStatusDto } from '../../dto/fleet/change-driver-active-status.dto';
import { CreateDriverDto } from '../../dto/fleet/create-driver.dto';
import { GetDriversQueryDto } from '../../dto/fleet/get-drivers-query.dto';
import { UpdateDriverDto } from '../../dto/fleet/update-driver.dto';
import { DriverRepository } from '../../repositories/driver.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class DriversService {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAllByCompany(actor: Actor, query: GetDriversQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.driverRepository.findAllByCompanyAndActiveStatus(
      query.companyId,
      query.active,
    );
  }

  async create(actor: Actor, dto: CreateDriverDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.driverRepository.findByUniqueIdentifier(
      dto.companyId,
      dto.licenceNumber,
      dto.mobileNumber,
    );

    if (existing) {
      throw new ConflictException({
        message:
          'Driver with the same licence number or mobile number already exists for this company',
        error_code: errorCode.driver.duplicateDriverIdentifier,
      });
    }

    try {
      return await this.driverRepository.create({
        ...dto,
        licenceExpiryDate: new Date(dto.licenceExpiryDate),
        companyId: new Types.ObjectId(dto.companyId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Driver with the same licence number or mobile number already exists for this company',
          error_code: errorCode.driver.duplicateDriverIdentifier,
        });
      }

      throw error;
    }
  }

  async getById(actor: Actor, driverId: string) {
    const driver = await this.driverRepository.findById(driverId);

    if (!driver) {
      throw new NotFoundException({
        message: 'Driver not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      driver.companyId.toString(),
    );

    return driver;
  }

  async update(actor: Actor, driverId: string, dto: UpdateDriverDto) {
    console.log('Updating driver with ID:', driverId);
    const driver = await this.driverRepository.findById(driverId);

    if (!driver) {
      throw new NotFoundException({
        message: 'Driver not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    const companyId = driver.companyId.toString();

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    if (dto.licenceNumber || dto.mobileNumber) {
      const existing = await this.driverRepository.findByUniqueIdentifierExcludingId(
        driverId,
        companyId,
        dto.licenceNumber,
        dto.mobileNumber,
      );

      if (existing) {
        throw new ConflictException({
          message:
            'Driver with the same licence number or mobile number already exists for this company',
          error_code: errorCode.driver.duplicateDriverIdentifier,
        });
      }
    }

    try {
      const updated = await this.driverRepository.updateById(driverId, {
        ...dto,
        licenceExpiryDate: dto.licenceExpiryDate
          ? new Date(dto.licenceExpiryDate)
          : undefined,
      });

      if (!updated) {
        throw new NotFoundException({
          message: 'Driver not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Driver with the same licence number or mobile number already exists for this company',
          error_code: errorCode.driver.duplicateDriverIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    driverId: string,
    dto: ChangeDriverActiveStatusDto,
  ) {
    const driver = await this.driverRepository.findById(driverId);

    if (!driver) {
      throw new NotFoundException({
        message: 'Driver not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      driver.companyId.toString(),
    );

    const updated = await this.driverRepository.updateById(driverId, {
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'Driver not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}
