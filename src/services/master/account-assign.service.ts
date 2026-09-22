import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateAccountAssignDto } from '../../dto/master/create-account-assign.dto';
import { GetAccountAssignsQueryDto } from '../../dto/master/get-account-assigns-query.dto';
import { AccountAssignRepository } from '../../repositories/account-assign.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class AccountAssignService {
  constructor(
    private readonly accountAssignRepository: AccountAssignRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async create(actor: Actor, dto: CreateAccountAssignDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.accountAssignRepository.findByCombination(
      dto.companyId,
      dto.consignorId,
      dto.consignorBranchId,
    );

    if (existing) {
      return this.accountAssignRepository.updateById(existing._id.toString(), {
        accountId: new Types.ObjectId(dto.accountId),
      });
    }

    return this.accountAssignRepository.create({
      companyId: new Types.ObjectId(dto.companyId),
      consignorId: new Types.ObjectId(dto.consignorId),
      consignorBranchId: new Types.ObjectId(dto.consignorBranchId),
      accountId: new Types.ObjectId(dto.accountId),
    });
  }

  async getByFilters(actor: Actor, query: GetAccountAssignsQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    const filters: Record<string, Types.ObjectId> = {
      companyId: new Types.ObjectId(query.companyId),
    };

    for (const field of ['consignorId', 'consignorBranchId'] as const) {
      if (query[field]) {
        filters[field] = new Types.ObjectId(query[field]);
      }
    }

    if (query.accountId) {
      filters.accountId = new Types.ObjectId(query.accountId);
    }

    return this.accountAssignRepository.findByFilters(filters);
  }
}
