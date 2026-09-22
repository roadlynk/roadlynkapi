import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateAccountAssignDto } from '../../dto/master/create-account-assign.dto';
import { GetAccountAssignsQueryDto } from '../../dto/master/get-account-assigns-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AccountAssignService } from '../../services/master/account-assign.service';

@Controller('account-assign')
@UseGuards(JwtAuthGuard)
export class AccountAssignController {
  constructor(private readonly accountAssignService: AccountAssignService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateAccountAssignDto) {
    return this.accountAssignService.create(req.user, dto);
  }

  @Post('filter')
  getByFilters(@Req() req: any, @Body() dto: GetAccountAssignsQueryDto) {
    return this.accountAssignService.getByFilters(req.user, dto);
  }
}
