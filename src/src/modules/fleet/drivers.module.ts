import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverController } from '../../controllers/fleet/driver.controller';
import { DriverRepository } from '../../repositories/driver.repository';
import { Driver, DriverSchema } from '../../schemas/fleet/driver.schema';
import { DriversService } from '../../services/fleet/drivers.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema }]),
  ],
  controllers: [DriverController],
  providers: [DriverRepository, DriversService],
})
export class DriversModule {}
