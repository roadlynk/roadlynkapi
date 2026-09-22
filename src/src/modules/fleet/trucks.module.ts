import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TruckController } from '../../controllers/fleet/truck.controller';
import { ActionRepository } from '../../repositories/action.repository';
import { OwnerRepository } from '../../repositories/owner.repository';
import { TruckRepository } from '../../repositories/truck.repository';
import { Action, ActionSchema } from '../../schemas/fleet/action.schema';
import { Owner, OwnerSchema } from '../../schemas/fleet/owner.schema';
import { Truck, TruckSchema } from '../../schemas/fleet/truck.schema';
import { TrucksService } from '../../services/fleet/trucks.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Truck.name, schema: TruckSchema },
      { name: Owner.name, schema: OwnerSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  controllers: [TruckController],
  providers: [TruckRepository, OwnerRepository, ActionRepository, TrucksService],
  exports: [TruckRepository],
})
export class TrucksModule {}

