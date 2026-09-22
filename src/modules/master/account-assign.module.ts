import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountAssignController } from '../../controllers/master/account-assign.controller';
import { AccountAssignRepository } from '../../repositories/account-assign.repository';
import {
  AccountAssign,
  AccountAssignSchema,
} from '../../schemas/master/company-specific/account-assign.schema';
import {
  CashAccount,
  CashAccountSchema,
} from '../../schemas/payment/cash-account.schema';
import { AccountAssignService } from '../../services/master/account-assign.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: AccountAssign.name, schema: AccountAssignSchema },
      { name: CashAccount.name, schema: CashAccountSchema },
    ]),
  ],
  controllers: [AccountAssignController],
  providers: [AccountAssignRepository, AccountAssignService],
})
export class AccountAssignModule {}
