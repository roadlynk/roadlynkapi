import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateDeliveryChallanDto } from '../../dto/trip/create-delivery-challan.dto';
import { FilterDeliveryChallansDto } from '../../dto/trip/filter-delivery-challans.dto';
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

  @Post('filter')
  getByFilters(@Req() req: any, @Body() dto: FilterDeliveryChallansDto) {
    return this.deliveryChallanService.getByFilters(req.user, dto);
  }

  @Post('filter/excel')
  async exportToExcel(
    @Req() req: any,
    @Body() dto: FilterDeliveryChallansDto,
    @Res() res: Response,
  ) {
    const buffer = await this.deliveryChallanService.exportToExcel(
      req.user,
      dto,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="delivery-challans.xlsx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('pdf/:deliveryChallanId')
  async getPdf(
    @Req() req: any,
    @Param('deliveryChallanId') deliveryChallanId: string,
    @Res() res: Response,
  ) {
    const { dcNumber, pdfBuffer } = await this.deliveryChallanService.getPdf(
      req.user,
      deliveryChallanId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dcNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
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
