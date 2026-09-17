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
import { CreateDeliveryChallanDto } from '../../dto/trip/create-delivery-challan.dto';
import { GetDeliveryChallansQueryDto } from '../../dto/trip/get-delivery-challans-query.dto';
import { UpdateDeliveryChallanDto } from '../../dto/trip/update-delivery-challan.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DeliveryChallanService } from '../../services/trip/delivery-challan.service';

@Controller('delivery-challans')
@UseGuards(JwtAuthGuard)
export class DeliveryChallanController {
  constructor(private readonly deliveryChallanService: DeliveryChallanService) {}

  @Get()
  getAll(@Req() req: any, @Query() query: GetDeliveryChallansQueryDto) {
    return this.deliveryChallanService.getAll(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateDeliveryChallanDto) {
    return this.deliveryChallanService.create(req.user, dto);
  }

  @Patch(':deliveryChallanId')
  update(
    @Req() req: any,
    @Param('deliveryChallanId') deliveryChallanId: string,
    @Body() dto: UpdateDeliveryChallanDto,
  ) {
    return this.deliveryChallanService.update(req.user, deliveryChallanId, dto);
  }
}
