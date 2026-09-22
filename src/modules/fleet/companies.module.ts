import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from '../../controllers/fleet/company.controller';
import { CompanyRepository } from '../../repositories/company.repository';
import { OwnerRepository } from '../../repositories/owner.repository';
import { Company, CompanySchema } from '../../schemas/fleet/company.schema';
import { Owner, OwnerSchema } from '../../schemas/fleet/owner.schema';
import { CompaniesService } from '../../services/fleet/companies.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Owner.name, schema: OwnerSchema },
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyRepository, OwnerRepository, CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}