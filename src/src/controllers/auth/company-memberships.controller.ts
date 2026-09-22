import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { CompanyUsersParamDto } from '../../dto/auth/company-users-param.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CompanyMembershipsService } from '../../services/auth/company-memberships.service';
import { AssignCompanyMembershipsDto } from '../../dto/auth/assign-company-memberships.dto';

@Controller('company-memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyMembershipsController {
  constructor(
    private readonly companyMembershipsService: CompanyMembershipsService,
  ) {}

  @Post('assign')
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  assignUsers(@Req() req: any, @Body() dto: AssignCompanyMembershipsDto) {
    return this.companyMembershipsService.assignUsersToCompany(req.user, dto);
  }

  @Get('/assign-users/:companyId')
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getCompanyUsers(@Param() params: CompanyUsersParamDto) {
    return this.companyMembershipsService.getAssignedUsers(params.companyId);
  }
}