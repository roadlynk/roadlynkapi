import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryChallanController } from '../../controllers/trip/delivery-challan.controller';
import { CompanyRepository } from '../../repositories/company.repository';
import { DeliveryChallanRepository } from '../../repositories/delivery-challan.repository';
import { Company, CompanySchema } from '../../schemas/fleet/company.schema';
import {
  DeliveryChallan,
  DeliveryChallanSchema,
} from '../../schemas/trip/delivery-challan.schema';
import { DeliveryChallanService } from '../../services/trip/delivery-challan.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: DeliveryChallan.name, schema: DeliveryChallanSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [DeliveryChallanController],
  providers: [DeliveryChallanRepository, CompanyRepository, DeliveryChallanService],
  exports: [DeliveryChallanRepository],
})
export class DeliveryChallanModule {}
