import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateCashPaymentDto } from '../../dto/payment/create-cash-payment.dto';
import { CashPaymentRepository } from '../../repositories/cash-payment.repository';

@Injectable()
export class CashPaymentService {
  constructor(
    private readonly cashPaymentRepository: CashPaymentRepository,
  ) {}

  create(dto: CreateCashPaymentDto) {
    return this.cashPaymentRepository.create({
      date: new Date(dto.date),
      cashAccountId: new Types.ObjectId(dto.cashAccountId),
      amount: dto.amount,
      fromResource: {
        resourceType: dto.resourceType,
        id: new Types.ObjectId(dto.resourceId),
      },
      receiver: {
        type: dto.receiverType,
        id: new Types.ObjectId(dto.receiverId),
      },
    });
  }
}
