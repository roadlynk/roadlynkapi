import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientController } from '../../controllers/master/client.controller';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { ClientBranch, ClientBranchSchema } from '../../schemas/master/company-specific/client-branch.schema';
import { Client, ClientSchema } from '../../schemas/master/company-specific/client.schema';
import { ClientService } from '../../services/master/client.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: ClientBranch.name, schema: ClientBranchSchema },
    ]),
  ],
  controllers: [ClientController],
  providers: [ClientRepository, ClientBranchRepository, ClientService],
})
export class ClientModule {}