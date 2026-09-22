import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompanyMembership,
  CompanyMembershipSchema,
} from '../../schemas/auth-users/company-membership.schema';
import { User, UserSchema } from '../../schemas/auth-users/user.schema';
import { CompanyMembershipRepository } from '../../repositories/company-membership.repository';
import { UserRepository } from '../../repositories/auth/user.repository';
import { CompanyMembershipsService } from '../../services/auth/company-memberships.service';
import { UsersService } from '../../services/auth/users.service';
import { RegistrationAuthorizationService } from '../../services/auth/authorization.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyMembership.name, schema: CompanyMembershipSchema },
    ]),
  ],
  providers: [
    UserRepository,
    CompanyMembershipRepository,
    UsersService,
    CompanyMembershipsService,
    RegistrationAuthorizationService,
  ],
  exports: [UsersService, CompanyMembershipsService, RegistrationAuthorizationService],
})
export class UsersModule {}
