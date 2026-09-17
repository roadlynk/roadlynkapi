import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Truck, TruckDocument } from '../schemas/fleet/truck.schema';

@Injectable()
export class TruckRepository {
  constructor(
    @InjectModel(Truck.name)
    private readonly truckModel: Model<TruckDocument>,
  ) {}

  create(truck: Partial<Truck>) {
    return this.truckModel.create(truck);
  }

  findById(id: string) {
    return this.truckModel.findById(id).exec();
  }

  findByIds(ids: string[]) {
    return this.truckModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .exec();
  }

  updateById(id: string, update: Partial<Truck>) {
    return this.truckModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByUniqueIdentifierExcludingId(
    id: string,
    companyId: string,
    truckNumber?: string,
    chasisNumber?: string,
  ) {
    const orConditions: Record<string, string>[] = [];

    if (truckNumber) orConditions.push({ truckNumber });
    if (chasisNumber) orConditions.push({ chasisNumber });

    if (!orConditions.length) {
      return null;
    }

    return this.truckModel
      .findOne({
        _id: { $ne: id },
        companyId,
        $or: orConditions,
      })
      .exec();
  }

  async findByIdWithOwner(id: string) {
    const result = await this.truckModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'owners',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      ])
      .exec();

    return result[0] ?? null;
  }

  updateActiveStatusByOwner(ownerId: string, isActive: boolean) {
    return this.truckModel
      .updateMany(
        { ownerId: new Types.ObjectId(ownerId) },
        { $set: { isActive } },
      )
      .exec();
  }

  findAllByOwnerAndActiveStatus(
    companyId: string,
    ownerId: string,
    isActive: boolean,
  ) {
    return this.truckModel
      .find({
        companyId: new Types.ObjectId(companyId),
        ownerId: new Types.ObjectId(ownerId),
        isActive,
      })
      .sort({ truckNumber: 1 })
      .exec();
  }

  findByUniqueIdentifier(
    companyId: string,
    truckNumber: string,
    chasisNumber: string,
  ) {
    return this.truckModel
      .findOne({
        companyId,
        $or: [{ truckNumber }, { chasisNumber }],
      })
      .exec();
  }

  findAllByCompanyWithOwner(companyId: string, isActive: boolean) {
    return this.truckModel
      .aggregate([
        {
          $match: {
            companyId: new Types.ObjectId(companyId),
            isActive,
          },
        },
        {
          $lookup: {
            from: 'owners',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        { $sort: { truckNumber: 1 } },
      ])
      .exec();
  }
}
