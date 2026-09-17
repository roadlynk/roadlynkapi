import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Driver, DriverDocument } from '../schemas/fleet/driver.schema';

@Injectable()
export class DriverRepository {
  constructor(
    @InjectModel(Driver.name)
    private readonly driverModel: Model<DriverDocument>,
  ) {}

  create(driver: Partial<Driver>) {
    return this.driverModel.create(driver);
  }

  findById(id: string) {
    return this.driverModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<Driver>) {
    return this.driverModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByUniqueIdentifierExcludingId(
    id: string,
    companyId: string,
    licenceNumber?: string,
    mobileNumber?: string,
  ) {
    const orConditions: Record<string, string>[] = [];

    if (licenceNumber) orConditions.push({ licenceNumber });
    if (mobileNumber) orConditions.push({ mobileNumber });

    if (!orConditions.length) {
      return null;
    }

    return this.driverModel
      .findOne({
        _id: { $ne: id },
        companyId,
        $or: orConditions,
      })
      .exec();
  }

  findByUniqueIdentifier(
    companyId: string,
    licenceNumber: string,
    mobileNumber: string,
  ) {
    return this.driverModel
      .findOne({
        companyId,
        $or: [{ licenceNumber }, { mobileNumber }],
      })
      .exec();
  }

  findAllByCompanyAndActiveStatus(companyId: string, isActive: boolean) {
    return this.driverModel
      .find({ companyId: new Types.ObjectId(companyId), isActive })
      .sort({ createdAt: -1 })
      .exec();
  }
}
