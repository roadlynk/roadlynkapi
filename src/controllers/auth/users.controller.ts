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
import { auditActions } from '../../common/audit.actions';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditLog } from '../../decorators/audit-log.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { ChangeUserActiveStatusDto } from '../../dto/auth/change-user-active-status.dto';
import { EditUserByAdminDto } from '../../dto/auth/edit-user-by-admin.dto';
import { RegisterDto } from '../../dto/auth/register.dto';
import { GetUsersForAdminQueryDto } from '../../dto/auth/get-users-for-admin-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { UsersService } from '../../services/auth/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('for-admin')
  getUsersForAdmin(
    @Req() req: any,
    @Query() query: GetUsersForAdminQueryDto,
  ) {
    return this.usersService.getUsersForAdmin(req.user, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @AuditLog({ action: auditActions.user.CREATE, resourceType: 'USER' })
  create(@Req() req: any, @Body() dto: RegisterDto) {
    return this.usersService.register(req.user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('roles/:userId')
  @AuditLog({ action: auditActions.user.CHANGE_ROLES, resourceType: 'USER' })
  changeRoles(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() dto: EditUserByAdminDto,
  ) {
    return this.usersService.editUserByAdmin(req.user, userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('active-status/:userId')
  @AuditLog({
    action: auditActions.user.CHANGE_ACTIVE_STATUS,
    resourceType: 'USER',
  })
  changeActiveStatus(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() dto: ChangeUserActiveStatusDto,
  ) {
    return this.usersService.updateActiveStatus(req.user, userId, dto);
  }
}