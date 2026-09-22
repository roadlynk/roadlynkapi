import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateBunkAssignDto } from '../../dto/master/create-bunk-assign.dto';
import { GetBunkAssignsQueryDto } from '../../dto/master/get-bunk-assigns-query.dto';
import { BunkAssignRepository } from '../../repositories/bunk-assign.repository';
import { BunkRepository } from '../../repositories/bunk.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class BunkAssignService {
  constructor(
    private readonly bunkRepository: BunkAssignRepository,
    private readonly bunkNameRepository: BunkRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAllBunkNames(companyId?: string) {
    return this.bunkNameRepository.findAll(companyId);
  }

  async create(actor: Actor, dto: CreateBunkAssignDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const bunkIdValue = dto.bunkId;

    if (!bunkIdValue) {
      throw new Error('Bunk is required');
    }

    const existing = await this.bunkRepository.findByCombination(
      dto.companyId,
      dto.consignorId,
      dto.consignorBranchId,
    );

    const bunkId = new Types.ObjectId(bunkIdValue);

    if (existing) {
      return this.bunkRepository.updateById(existing._id.toString(), {
        bunkId,
      });
    }

    return this.bunkRepository.create({
      companyId: new Types.ObjectId(dto.companyId),
      consignorId: new Types.ObjectId(dto.consignorId),
      consignorBranchId: new Types.ObjectId(dto.consignorBranchId),
      bunkId,
    });
  }

  async getByFilters(actor: Actor, query: GetBunkAssignsQueryDto) {
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

    const assignments = await this.bunkRepository.findByFilters(filters);

    const enriched = await Promise.all(
      assignments.map(async (assignment) => {
        const bunk = await this.bunkNameRepository.findById(
          assignment.bunkId.toString(),
        );

        return {
          ...assignment.toObject(),
          bunk,
        };
      }),
    );

    return enriched;
  }
}
