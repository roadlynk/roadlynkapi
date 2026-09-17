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
import { ChangeDealerActiveStatusDto } from '../../dto/master/change-dealer-active-status.dto';
import { CreateDealerDto } from '../../dto/master/create-dealer.dto';
import { GetDealersByClientQueryDto } from '../../dto/master/get-dealers-by-client-query.dto';
import { UpdateDealerDto } from '../../dto/master/update-dealer.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DealerService } from '../../services/master/dealer.service';

@Controller('dealer-masters')
@UseGuards(JwtAuthGuard)
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDealerDto) {
    return this.dealerService.create(req.user, dto);
  }

  @Get('client/:clientId')
  findAllByClientId(
    @Req() req: any,
    @Param('clientId') clientId: string,
    @Query() query: GetDealersByClientQueryDto,
  ) {
    return this.dealerService.findAllByClientId(req.user, clientId, query);
  }

  @Patch('active-status/:dealerId')
  changeActiveStatus(
    @Req() req: any,
    @Param('dealerId') dealerId: string,
    @Body() dto: ChangeDealerActiveStatusDto,
  ) {
    return this.dealerService.changeActiveStatus(req.user, dealerId, dto);
  }

  @Patch(':dealerId')
  update(
    @Req() req: any,
    @Param('dealerId') dealerId: string,
    @Body() dto: UpdateDealerDto,
  ) {
    return this.dealerService.update(req.user, dealerId, dto);
  }
}