import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientBranchController } from '../../controllers/master/client-branch.controller';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { ClientRepository } from '../../repositories/client.repository';
import {
  ClientBranch,
  ClientBranchSchema,
} from '../../schemas/master/company-specific/client-branch.schema';
import {
  Client,
  ClientSchema,
} from '../../schemas/master/company-specific/client.schema';
import { ClientBranchService } from '../../services/master/client-branch.service';
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
  controllers: [ClientBranchController],
  providers: [ClientBranchRepository, ClientRepository, ClientBranchService],
})
export class ClientBranchModule {}
