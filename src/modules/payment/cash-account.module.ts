import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashAccountController } from '../../controllers/payment/cash-account.controller';
import { CashAccountRepository } from '../../repositories/cash-account.repository';
import {
  CashAccount,
  CashAccountSchema,
} from '../../schemas/payment/cash-account.schema';
import { CashAccountService } from '../../services/payment/cash-account.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: CashAccount.name, schema: CashAccountSchema },
    ]),
  ],
  controllers: [CashAccountController],
  providers: [CashAccountRepository, CashAccountService],
})
export class CashAccountModule {}
