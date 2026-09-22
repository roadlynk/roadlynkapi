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
import { ChangeCashAccountActiveStatusDto } from '../../dto/payment/change-cash-account-active-status.dto';
import { CreateCashAccountDto } from '../../dto/payment/create-cash-account.dto';
import { GetCashAccountsQueryDto } from '../../dto/payment/get-cash-accounts-query.dto';
import { UpdateCashAccountDto } from '../../dto/payment/update-cash-account.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CashAccountService } from '../../services/payment/cash-account.service';

@Controller('cash-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireAllRoles(UserCompanyType.PROVIDER)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CashAccountController {
  constructor(private readonly cashAccountService: CashAccountService) {}

  @Get()
  getAll(@Req() req: any, @Query() query: GetCashAccountsQueryDto) {
    return this.cashAccountService.getAll(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCashAccountDto) {
    return this.cashAccountService.create(req.user, dto);
  }

  @Patch('active-status/:id')
  changeActiveStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ChangeCashAccountActiveStatusDto,
  ) {
    return this.cashAccountService.changeActiveStatus(req.user, id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCashAccountDto,
  ) {
    return this.cashAccountService.update(req.user, id, dto);
  }
}
