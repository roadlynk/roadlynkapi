import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransportRateController } from '../../controllers/master/transport-rate.controller';
import { TransportRateRepository } from '../../repositories/transport-rate.repository';
import {
  TransportRate,
  TransportRateSchema,
} from '../../schemas/master/company-specific/transportRate.schema';
import { TransportRateService } from '../../services/master/transport-rate.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';
import { DeliveryChallanModule } from '../trip/delivery-challan.module';
import { TrucksModule } from '../fleet/trucks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DeliveryChallanModule,
    TrucksModule,
    MongooseModule.forFeature([
      { name: TransportRate.name, schema: TransportRateSchema },
    ]),
  ],
  controllers: [TransportRateController],
  providers: [TransportRateRepository, TransportRateService],
})
export class TransportRateModule {}
