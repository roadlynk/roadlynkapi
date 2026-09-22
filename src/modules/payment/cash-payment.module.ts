import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashPaymentController } from '../../controllers/payment/cash-payment.controller';
import { CashPaymentRepository } from '../../repositories/cash-payment.repository';
import {
  CashPayment,
  CashPaymentSchema,
} from '../../schemas/payment/cash-payment.schema';
import { CashPaymentService } from '../../services/payment/cash-payment.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: CashPayment.name, schema: CashPaymentSchema },
    ]),
  ],
  controllers: [CashPaymentController],
  providers: [CashPaymentRepository, CashPaymentService],
})
export class CashPaymentModule {}
