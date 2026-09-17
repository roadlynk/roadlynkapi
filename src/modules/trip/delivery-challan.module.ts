import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryChallanController } from '../../controllers/trip/delivery-challan.controller';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { CompanyRepository } from '../../repositories/company.repository';
import { DealerRepository } from '../../repositories/dealer.repository';
import { DeliveryChallanRepository } from '../../repositories/delivery-challan.repository';
import { DriverRepository } from '../../repositories/driver.repository';
import { MaterialRepository } from '../../repositories/material.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import { Company, CompanySchema } from '../../schemas/fleet/company.schema';
import { Driver, DriverSchema } from '../../schemas/fleet/driver.schema';
import { Truck, TruckSchema } from '../../schemas/fleet/truck.schema';
import {
  Client,
  ClientSchema,
} from '../../schemas/master/company-specific/client.schema';
import {
  ClientBranch,
  ClientBranchSchema,
} from '../../schemas/master/company-specific/client-branch.schema';
import {
  Dealer,
  DealerSchema,
} from '../../schemas/master/company-specific/dealer.schema';
import {
  Material,
  MaterialSchema,
} from '../../schemas/master/company-specific/material.schema';
import {
  DeliveryChallan,
  DeliveryChallanSchema,
} from '../../schemas/trip/delivery-challan.schema';
import { PdfService } from '../../services/common/pdf.service';
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
      { name: Client.name, schema: ClientSchema },
      { name: ClientBranch.name, schema: ClientBranchSchema },
      { name: Truck.name, schema: TruckSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: Dealer.name, schema: DealerSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [DeliveryChallanController],
  providers: [
    DeliveryChallanRepository,
    CompanyRepository,
    ClientRepository,
    ClientBranchRepository,
    TruckRepository,
    DriverRepository,
    DealerRepository,
    MaterialRepository,
    DeliveryChallanService,
    PdfService,
  ],
  exports: [DeliveryChallanRepository, DeliveryChallanService],
})
export class DeliveryChallanModule {}
