import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalculateTransportRateDto } from '../../dto/master/calculate-transport-rate.dto';
import { CreateTransportRateDto } from '../../dto/master/create-transport-rate.dto';
import { GetTransportRatesQueryDto } from '../../dto/master/get-transport-rates-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TransportRateService } from '../../services/master/transport-rate.service';

@Controller('transport-rates')
@UseGuards(JwtAuthGuard)
export class TransportRateController {
  constructor(private readonly transportRateService: TransportRateService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTransportRateDto) {
    return this.transportRateService.create(req.user, dto);
  }

  @Post('filter')
  getByFilters(@Req() req: any, @Body() dto: GetTransportRatesQueryDto) {
    return this.transportRateService.getByFilters(req.user, dto);
  }

  @Post('get-transport-rate-and-location')
  getTransportRateAndLocation(
    @Req() req: any,
    @Body() dto: CalculateTransportRateDto,
  ) {
    return this.transportRateService.getTransportRateAndLocation(
      req.user,
      dto,
      dto.companyDate,
    );
  }
}
