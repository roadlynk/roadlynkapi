import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateBunkDto } from '../../dto/master/create-bunk.dto';
import { GetBunksQueryDto } from '../../dto/master/get-bunks-query.dto';
import { BunkRepository } from '../../repositories/bunk.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class BunkService {
  constructor(
    private readonly bunkRepository: BunkRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async create(actor: Actor, dto: CreateBunkDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.bunkRepository.findByCombination(
      dto.companyId,
      dto.consignorId,
      dto.consignorBranchId,
    );

    if (existing) {
      return this.bunkRepository.updateById(existing._id.toString(), {
        bunkName: dto.bunkName,
      });
    }

    return this.bunkRepository.create({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
      consignorId: new Types.ObjectId(dto.consignorId),
      consignorBranchId: new Types.ObjectId(dto.consignorBranchId),
    });
  }

  async getByFilters(actor: Actor, query: GetBunksQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    const filters: Record<string, Types.ObjectId> = {
      companyId: new Types.ObjectId(query.companyId),
    };

    for (const field of [
      'consignorId',
      'consignorBranchId',
    ] as const) {
      if (query[field]) {
        filters[field] = new Types.ObjectId(query[field]);
      }
    }

    return this.bunkRepository.findByFilters(filters);
  }
}
