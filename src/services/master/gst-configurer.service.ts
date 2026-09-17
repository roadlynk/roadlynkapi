import { Injectable, NotFoundException } from '@nestjs/common';
import { errorCode } from '../../common/error.index';
import { CreateGstConfigurerDto } from '../../dto/master/create-gst-configurer.dto';
import { UpdateGstConfigurerDto } from '../../dto/master/update-gst-configurer.dto';
import { GstConfigurerRepository } from '../../repositories/gst-configurer.repository';

@Injectable()
export class GstConfigurerService {
  constructor(
    private readonly gstConfigurerRepository: GstConfigurerRepository,
  ) {}

  getAll() {
    return this.gstConfigurerRepository.findAll();
  }

  async create(dto: CreateGstConfigurerDto) {
    const count = await this.gstConfigurerRepository.count();

    return this.gstConfigurerRepository.create({
      ...dto,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      isActive: count === 0,
    });
  }

  async update(id: string, dto: UpdateGstConfigurerDto) {
    const updated = await this.gstConfigurerRepository.updateById(id, {
      ...dto,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'GST configurer not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }

  async getActivePercentage() {
    const active = await this.gstConfigurerRepository.findActive();

    if (!active) {
      throw new NotFoundException({
        message: 'Active GST percentage not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return active.percentage;
  }

  async changeActiveStatus(id: string) {
    const configurer = await this.gstConfigurerRepository.updateById(id, {
      isActive: false,
    });

    if (!configurer) {
      throw new NotFoundException({
        message: 'GST configurer not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.gstConfigurerRepository.deactivateAll();
    const active = await this.gstConfigurerRepository.activateById(id);

    if (!active) {
      throw new NotFoundException({
        message: 'GST configurer not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return active;
  }
}
