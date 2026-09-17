import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { ChangeMaterialActiveStatusDto } from '../../dto/master/change-material-active-status.dto';
import { CreateMaterialDto } from '../../dto/master/create-material.dto';
import { GetMaterialsQueryDto } from '../../dto/master/get-materials-query.dto';
import { UpdateMaterialDto } from '../../dto/master/update-material.dto';
import { MaterialRepository } from '../../repositories/material.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class MaterialService {
  constructor(
    private readonly materialRepository: MaterialRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAll(actor: Actor, query: GetMaterialsQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.materialRepository.findAll(query.companyId, query.active);
  }

  async create(actor: Actor, dto: CreateMaterialDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    return this.materialRepository.create({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
    });
  }

  async update(actor: Actor, id: string, dto: UpdateMaterialDto) {
    const material = await this.materialRepository.findById(id);

    if (!material) {
      throw new NotFoundException({
        message: 'Material not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      material.companyId.toString(),
    );

    const updated = await this.materialRepository.updateById(id, dto);

    if (!updated) {
      throw new NotFoundException({
        message: 'Material not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }

  async changeActiveStatus(
    actor: Actor,
    id: string,
    dto: ChangeMaterialActiveStatusDto,
  ) {
    const material = await this.materialRepository.findById(id);

    if (!material) {
      throw new NotFoundException({
        message: 'Material not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      material.companyId.toString(),
    );

    const updated = await this.materialRepository.updateActiveStatus(
      id,
      dto.isActive,
    );

    if (!updated) {
      throw new NotFoundException({
        message: 'Material not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}
