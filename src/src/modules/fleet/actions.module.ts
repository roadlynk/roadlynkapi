import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsController } from '../../controllers/fleet/actions.controller';
import { ActionRepository } from '../../repositories/action.repository';
import { Action, ActionSchema } from '../../schemas/fleet/action.schema';
import { ActionsService } from '../../services/fleet/actions.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Action.name, schema: ActionSchema }]),
  ],
  controllers: [ActionsController],
  providers: [ActionRepository, ActionsService],
})
export class ActionsModule {}