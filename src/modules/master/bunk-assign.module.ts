import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BunkController } from '../../controllers/master/bunk.controller';
import { BunkAssignController } from '../../controllers/master/bunk-assign.controller';
import { BunkAssignRepository } from '../../repositories/bunk-assign.repository';
import { BunkRepository } from '../../repositories/bunk.repository';
import {
  BunkAssign,
  BunkAssignSchema,
} from '../../schemas/master/company-specific/bunk-assign.schema';
import { Bunk, BunkSchema } from '../../schemas/master/company-specific/bunk.schema';
import { BunkAssignService } from '../../services/master/bunk-assign.service';
import { BunkService } from '../../services/master/bunk.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: BunkAssign.name, schema: BunkAssignSchema },
      { name: Bunk.name, schema: BunkSchema },
    ]),
  ],
  controllers: [BunkAssignController, BunkController],
  providers: [
    BunkAssignRepository,
    BunkRepository,
    BunkAssignService,
    BunkService,
  ],
})
export class BunkAssignModule {}
