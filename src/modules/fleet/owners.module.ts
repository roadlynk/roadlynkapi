import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerController } from '../../controllers/fleet/owner.controller';
import { OwnerRepository } from '../../repositories/owner.repository';
import { Owner, OwnerSchema } from '../../schemas/fleet/owner.schema';
import { OwnersService } from '../../services/fleet/owners.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';
import { TrucksModule } from './trucks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TrucksModule,
    MongooseModule.forFeature([{ name: Owner.name, schema: OwnerSchema }]),
  ],
  controllers: [OwnerController],
  providers: [OwnerRepository, OwnersService],
})
export class OwnersModule {}
