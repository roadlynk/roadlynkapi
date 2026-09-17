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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: TransportRate.name, schema: TransportRateSchema },
    ]),
  ],
  controllers: [TransportRateController],
  providers: [TransportRateRepository, TransportRateService],
})
export class TransportRateModule {}
