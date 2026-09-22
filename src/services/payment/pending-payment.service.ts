import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreatePendingPaymentDto } from '../../dto/payment/create-pending-payment.dto';
import { PendingPaymentRepository } from '../../repositories/pending-payment.repository';

@Injectable()
export class PendingPaymentService {
  constructor(
    private readonly pendingPaymentRepository: PendingPaymentRepository,
  ) {}

  create(dto: CreatePendingPaymentDto) {
    return this.pendingPaymentRepository.create({
      date: new Date(dto.date),
      amount: dto.amount,
      fromResource: {
        resourceType: dto.resourceType,
        id: new Types.ObjectId(dto.resourceId),
      },
      receiver: {
        type: dto.receiverType,
        id: new Types.ObjectId(dto.receiverId),
        bankId: new Types.ObjectId(dto.receiverBankId),
      },
    });
  }
}
