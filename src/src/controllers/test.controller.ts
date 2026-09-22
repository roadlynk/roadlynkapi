import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('test')
export class TestController {
  @Get('public')
  publicEndpoint() {
    return { message: 'PUBLIC ENDPOINT' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @Get('user')
  userEndpoint() {
    return { message: 'USER ENDPOINT' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  adminEndpoint() {
    return { message: 'ADMIN ENDPOINT' };
  }
}
