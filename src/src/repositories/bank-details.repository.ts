import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HolderType } from '../common/enums/bank-details.enum';
import {
  BankDetails,
  BankDetailsDocument,
} from '../schemas/fleet/bank-details.schema';

@Injectable()
export class BankDetailsRepository {
  constructor(
    @InjectModel(BankDetails.name)
    private readonly bankDetailsModel: Model<BankDetailsDocument>,
  ) {}

  create(bankDetails: Partial<BankDetails>) {
    return this.bankDetailsModel.create(bankDetails);
  }

  findByHolderAndAccount(
    holderId: string,
    holderType: HolderType,
    bankName: string,
    accountNumber: string,
  ) {
    return this.bankDetailsModel
      .findOne({
        holderId: new Types.ObjectId(holderId),
        holderType,
        bankName,
        accountNumber,
      })
      .exec();
  }

  findByHolder(holderId: string, holderType: HolderType) {
    return this.bankDetailsModel
      .find({
        holderId: new Types.ObjectId(holderId),
        holderType,
      })
      .exec();
  }

  deactivateByHolder(holderId: string, holderType: HolderType) {
    return this.bankDetailsModel
      .updateMany(
        { holderId: new Types.ObjectId(holderId), holderType },
        { $set: { isActive: false } },
      )
      .exec();
  }

  activateById(id: string) {
    return this.bankDetailsModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive: true } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  deactivateById(id: string) {
    return this.bankDetailsModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
