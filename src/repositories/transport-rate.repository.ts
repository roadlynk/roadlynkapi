import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TransportRate,
  TransportRateDocument,
} from '../schemas/master/company-specific/transportRate.schema';

@Injectable()
export class TransportRateRepository {
  constructor(
    @InjectModel(TransportRate.name)
    private readonly transportRateModel: Model<TransportRateDocument>,
  ) {}

  findActiveByCombination(
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
    consigneeId: string,
    dealerId: string,
    materialId: string,
  ) {
    return this.transportRateModel
      .find({
        companyId: new Types.ObjectId(companyId),
        consignorId: new Types.ObjectId(consignorId),
        consignorBranchId: new Types.ObjectId(consignorBranchId),
        consigneeId: new Types.ObjectId(consigneeId),
        dealerId: new Types.ObjectId(dealerId),
        materialId: new Types.ObjectId(materialId),
        isActive: true,
      })
      .exec();
  }

  findOneActiveByCombination(
    companyId: string,
    consignorId: string,
    consignorBranchId: string,
    consigneeId: string,
    dealerId: string,
    materialId: string,
  ) {
    return this.transportRateModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        consignorId: new Types.ObjectId(consignorId),
        consignorBranchId: new Types.ObjectId(consignorBranchId),
        consigneeId: new Types.ObjectId(consigneeId),
        dealerId: new Types.ObjectId(dealerId),
        materialId: new Types.ObjectId(materialId),
        isActive: true,
      })
      .exec();
  }

  deactivateByIds(ids: Types.ObjectId[], effectiveTo: Date) {
    return this.transportRateModel
      .updateMany(
        { _id: { $in: ids } },
        { $set: { effectiveTo, isActive: false } },
      )
      .exec();
  }

  create(transportRate: Partial<TransportRate>) {
    return this.transportRateModel.create(transportRate);
  }

  updateById(id: string, update: Partial<TransportRate>) {
    return this.transportRateModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByFilters(filters: Record<string, Types.ObjectId | boolean>) {
    return this.transportRateModel.find(filters).sort({ createdAt: -1 }).exec();
  }
}
