import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeliveryChallan,
  DeliveryChallanDocument,
} from '../schemas/trip/delivery-challan.schema';

@Injectable()
export class DeliveryChallanRepository {
  constructor(
    @InjectModel(DeliveryChallan.name)
    private readonly deliveryChallanModel: Model<DeliveryChallanDocument>,
  ) {}

  create(deliveryChallan: Partial<DeliveryChallan>) {
    return this.deliveryChallanModel.create(deliveryChallan);
  }

  findById(id: string) {
    return this.deliveryChallanModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<DeliveryChallan>) {
    return this.deliveryChallanModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  async findAllPaginatedByCompany(
    companyId: string,
    isActive: boolean,
    page: number,
    limit: number,
  ) {
    const filter = {
      companyId: new Types.ObjectId(companyId),
      isActive,
    };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.deliveryChallanModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.deliveryChallanModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
