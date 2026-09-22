import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AccountAssign,
  AccountAssignDocument,
} from '../schemas/master/company-specific/account-assign.schema';

@Injectable()
export class AccountAssignRepository {
  constructor(
    @InjectModel(AccountAssign.name)
    private readonly accountAssignModel: Model<AccountAssignDocument>,
  ) {}

  findByCombination(
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
  ) {
    return this.accountAssignModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        consignorId: new Types.ObjectId(consignorId),
        consignorBranchId: new Types.ObjectId(consignorBranchId),
      })
      .exec();
  }

  create(account: Partial<AccountAssign>) {
    return this.accountAssignModel.create(account);
  }

  updateById(id: string, update: Partial<AccountAssign>) {
    return this.accountAssignModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByFilters(filters: Record<string, Types.ObjectId>) {
    return this.accountAssignModel
      .find(filters)
      .populate('accountId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
