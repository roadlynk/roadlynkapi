import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CashAccount,
  CashAccountDocument,
} from '../schemas/payment/cash-account.schema';

@Injectable()
export class CashAccountRepository {
  constructor(
    @InjectModel(CashAccount.name)
    private readonly cashAccountModel: Model<CashAccountDocument>,
  ) {}

  create(cashAccount: Partial<CashAccount>) {
    return this.cashAccountModel.create(cashAccount);
  }

  findAllByCompany(companyId: string, isActive: boolean) {
    return this.cashAccountModel
      .find({ companyId: new Types.ObjectId(companyId), isActive })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    return this.cashAccountModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<CashAccount>) {
    return this.cashAccountModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  updateActiveStatus(id: string, isActive: boolean) {
    return this.cashAccountModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
