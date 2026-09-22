import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PendingPayment,
  PendingPaymentDocument,
} from '../schemas/payment/pending-payment.schema';

@Injectable()
export class PendingPaymentRepository {
  constructor(
    @InjectModel(PendingPayment.name)
    private readonly pendingPaymentModel: Model<PendingPaymentDocument>,
  ) {}

  create(pendingPayment: Partial<PendingPayment>) {
    return this.pendingPaymentModel.create(pendingPayment);
  }
}
