import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Dealer,
  DealerDocument,
} from '../schemas/master/company-specific/dealer.schema';

@Injectable()
export class DealerRepository {
  constructor(
    @InjectModel(Dealer.name)
    private readonly dealerModel: Model<DealerDocument>,
  ) {}

  create(dealer: Partial<Dealer>) {
    return this.dealerModel.create(dealer);
  }

  findById(id: string) {
    return this.dealerModel.findById(id).exec();
  }

  findByClientId(clientId: string, isActive: boolean) {
    return this.dealerModel
      .find({ clientId: new Types.ObjectId(clientId), isActive })
      .sort({ dealerName: 1 })
      .exec();
  }

  findByUniqueIdentifier(clientId: string, code: string) {
    return this.dealerModel
      .findOne({ clientId: new Types.ObjectId(clientId), code })
      .exec();
  }

  findByUniqueIdentifierExcludingId(id: string, clientId: string, code: string) {
    return this.dealerModel
      .findOne({
        _id: { $ne: id },
        clientId: new Types.ObjectId(clientId),
        code,
      })
      .exec();
  }

  updateById(id: string, update: Partial<Dealer>) {
    return this.dealerModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }
}