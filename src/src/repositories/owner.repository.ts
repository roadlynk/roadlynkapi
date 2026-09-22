import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Owner, OwnerDocument } from '../schemas/fleet/owner.schema';

@Injectable()
export class OwnerRepository {
  constructor(
    @InjectModel(Owner.name)
    private readonly ownerModel: Model<OwnerDocument>,
  ) {}

  create(owner: Partial<Owner>) {
    return this.ownerModel.create(owner);
  }

  findById(id: string) {
    return this.ownerModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<Owner>) {
    return this.ownerModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByUniqueIdentifierExcludingId(
    id: string,
    companyId: string,
    panNumber?: string,
    phoneNumber?: string,
    email?: string,
    aadharNumber?: string,
  ) {
    const orConditions: Record<string, string>[] = [];

    if (panNumber) orConditions.push({ panNumber });
    if (phoneNumber) orConditions.push({ phoneNumber });
    if (email) orConditions.push({ email });
    if (aadharNumber) orConditions.push({ aadharNumber });

    if (!orConditions.length) {
      return null;
    }

    return this.ownerModel
      .findOne({
        _id: { $ne: id },
        companyId,
        $or: orConditions,
      })
      .exec();
  }

  findByUniqueIdentifier(
    companyId: string,
    panNumber: string,
    phoneNumber: string,
    email: string,
    aadharNumber: string,
  ) {
    return this.ownerModel
      .findOne({
        companyId,
        $or: [{ panNumber }, { phoneNumber }, { email }, { aadharNumber }],
      })
      .exec();
  }

  findAllByCompanyAndActiveStatus(companyId: string, isActive: boolean) {
    return this.ownerModel
      .find({ companyId: new Types.ObjectId(companyId), isActive })
      .sort({ createdAt: -1 })
      .exec();
  }
}
