import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { CreateCompanyDto } from '../../dto/fleet/create-company.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CompaniesService } from '../../services/fleet/companies.service';
import { AuditLog } from '../../decorators/audit-log.decorator';
import { auditActions } from '../../common/audit.actions';
import { GetCompaniesQueryDto } from '../../dto/fleet/get-companies-query.dto';
import { ChangeCompanyActiveStatusDto } from '../../dto/fleet/change-company-active-status.dto';
import { UpdateCompanyDto } from '../../dto/fleet/update-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  getCompanies(@Req() req: any, @Query() query: GetCompaniesQueryDto) {
    return this.companiesService.getCompanies(req.user, query);
  }

  @Get('saas-clients')
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getActiveSaasClients() {
    return this.companiesService.getActiveSaasClients();
  }

  @Post()
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @AuditLog({ action: auditActions.company.CREATE, resourceType: 'COMPANY' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch('active-status/:companyId')
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  changeActiveStatus(
    @Param('companyId') companyId: string,
    @Body() dto: ChangeCompanyActiveStatusDto,
  ) {
    return this.companiesService.changeActiveStatus(companyId, dto);
  }

  @Patch(':companyId')
  update(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(req.user, companyId, dto);
  }
}