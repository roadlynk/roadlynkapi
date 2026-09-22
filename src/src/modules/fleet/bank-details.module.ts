import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankDetailsController } from '../../controllers/fleet/bank-details.controller';
import { BankDetailsRepository } from '../../repositories/bank-details.repository';
import {
  BankDetails,
  BankDetailsSchema,
} from '../../schemas/fleet/bank-details.schema';
import { BankDetailsService } from '../../services/fleet/bank-details.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: BankDetails.name, schema: BankDetailsSchema },
    ]),
  ],
  controllers: [BankDetailsController],
  providers: [BankDetailsRepository, BankDetailsService],
})
export class BankDetailsModule {}
