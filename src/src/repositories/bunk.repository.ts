import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bunk, BunkDocument } from '../schemas/master/company-specific/bunk.schema';

@Injectable()
export class BunkRepository {
  constructor(
    @InjectModel(Bunk.name)
    private readonly bunkModel: Model<BunkDocument>,
  ) {}

  findByCombination(
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
  ) {
    return this.bunkModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        consignorId: new Types.ObjectId(consignorId),
        consignorBranchId: new Types.ObjectId(consignorBranchId),
      })
      .exec();
  }

  create(bunk: Partial<Bunk>) {
    return this.bunkModel.create(bunk);
  }

  updateById(id: string, update: Partial<Bunk>) {
    return this.bunkModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByFilters(filters: Record<string, Types.ObjectId>) {
    return this.bunkModel.find(filters).sort({ createdAt: -1 }).exec();
  }
}
