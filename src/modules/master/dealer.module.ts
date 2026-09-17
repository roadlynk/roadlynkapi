import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealerController } from '../../controllers/master/dealer.controller';
import { ClientRepository } from '../../repositories/client.repository';
import { DealerRepository } from '../../repositories/dealer.repository';
import {
  Client,
  ClientSchema,
} from '../../schemas/master/company-specific/client.schema';
import {
  Dealer,
  DealerSchema,
} from '../../schemas/master/company-specific/dealer.schema';
import { DealerService } from '../../services/master/dealer.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: Dealer.name, schema: DealerSchema },
    ]),
  ],
  controllers: [DealerController],
  providers: [DealerRepository, ClientRepository, DealerService],
})
export class DealerModule {}