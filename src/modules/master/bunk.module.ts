import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BunkController } from '../../controllers/master/bunk.controller';
import { BunkRepository } from '../../repositories/bunk.repository';
import { Bunk, BunkSchema } from '../../schemas/master/company-specific/bunk.schema';
import { BunkService } from '../../services/master/bunk.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Bunk.name, schema: BunkSchema }]),
  ],
  controllers: [BunkController],
  providers: [BunkRepository, BunkService],
})
export class BunkModule {}
