import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBankDetailsDto } from '../../dto/fleet/create-bank-details.dto';
import { GetBankDetailsByHolderDto } from '../../dto/fleet/get-bank-details-by-holder.dto';
import { SetActiveBankDetailsDto } from '../../dto/fleet/set-active-bank-details.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BankDetailsService } from '../../services/fleet/bank-details.service';

@Controller('bank-details')
@UseGuards(JwtAuthGuard)
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Get()
  getByHolder(@Req() req: any, @Query() query: GetBankDetailsByHolderDto) {
    return this.bankDetailsService.getByHolder(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateBankDetailsDto) {
    return this.bankDetailsService.create(req.user, dto);
  }

  @Patch('active')
  setActive(@Req() req: any, @Body() dto: SetActiveBankDetailsDto) {
    return this.bankDetailsService.setActiveBankDetails(req.user, dto);
  }
}
