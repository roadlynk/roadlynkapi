import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BunkAssign,
  BunkAssignDocument,
} from '../schemas/master/company-specific/bunk-assign.schema';

@Injectable()
export class BunkAssignRepository {
  constructor(
    @InjectModel(BunkAssign.name)
    private readonly bunkAssignModel: Model<BunkAssignDocument>,
  ) {}

  findByCombination(
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
  ) {
    return this.bunkAssignModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        consignorId: new Types.ObjectId(consignorId),
        consignorBranchId: new Types.ObjectId(consignorBranchId),
      })
      .exec();
  }

  create(bunk: Partial<BunkAssign>) {
    return this.bunkAssignModel.create(bunk);
  }

  updateById(id: string, update: Partial<BunkAssign>) {
    return this.bunkAssignModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByFilters(filters: Record<string, Types.ObjectId>) {
    return this.bunkAssignModel.find(filters).sort({ createdAt: -1 }).exec();
  }
}
