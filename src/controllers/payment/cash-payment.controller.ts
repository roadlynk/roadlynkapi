import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { CreateCashPaymentDto } from '../../dto/payment/create-cash-payment.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CashPaymentService } from '../../services/payment/cash-payment.service';

@Controller('cash-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireAllRoles(UserCompanyType.PROVIDER)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CashPaymentController {
  constructor(private readonly cashPaymentService: CashPaymentService) {}

  @Post()
  create(@Body() dto: CreateCashPaymentDto) {
    return this.cashPaymentService.create(dto);
  }
}
