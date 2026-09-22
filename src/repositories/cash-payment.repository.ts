import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CashPayment,
  CashPaymentDocument,
} from '../schemas/payment/cash-payment.schema';

@Injectable()
export class CashPaymentRepository {
  constructor(
    @InjectModel(CashPayment.name)
    private readonly cashPaymentModel: Model<CashPaymentDocument>,
  ) {}

  create(cashPayment: Partial<CashPayment>) {
    return this.cashPaymentModel.create(cashPayment);
  }
}
