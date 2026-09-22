import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBunkAssignDto } from '../../dto/master/create-bunk-assign.dto';
import { GetBunkAssignsQueryDto } from '../../dto/master/get-bunk-assigns-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BunkAssignService } from '../../services/master/bunk-assign.service';

@Controller('bunk-assign')
@UseGuards(JwtAuthGuard)
export class BunkAssignController {
  constructor(private readonly bunkService: BunkAssignService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBunkAssignDto) {
    return this.bunkService.create(req.user, dto);
  }

  @Post('filter')
  getByFilters(@Req() req: any, @Body() dto: GetBunkAssignsQueryDto) {
    return this.bunkService.getByFilters(req.user, dto);
  }
}
