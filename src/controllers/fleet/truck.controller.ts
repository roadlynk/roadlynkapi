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
import { CreateTruckDto } from '../../dto/fleet/create-truck.dto';
import { ChangeTruckActiveStatusDto } from '../../dto/fleet/change-truck-active-status.dto';
import { GetTrucksByOwnerQueryDto } from '../../dto/fleet/get-trucks-by-owner-query.dto';
import { GetTrucksQueryDto } from '../../dto/fleet/get-trucks-query.dto';
import { UpdateTruckDto } from '../../dto/fleet/update-truck.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TrucksService } from '../../services/fleet/trucks.service';

@Controller('trucks')
@UseGuards(JwtAuthGuard)
export class TruckController {
  constructor(private readonly trucksService: TrucksService) {}

  @Get()
  getAllByCompany(@Req() req: any, @Query() query: GetTrucksQueryDto) {
    return this.trucksService.getAllByCompany(req.user, query);
  }

  @Get('by-owner')
  getAllByOwner(@Req() req: any, @Query() query: GetTrucksByOwnerQueryDto) {
    return this.trucksService.getAllByOwner(req.user, query);
  }

  @Get(':truckId')
  getById(@Req() req: any, @Param('truckId') truckId: string) {
    return this.trucksService.getById(req.user, truckId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTruckDto) {
    return this.trucksService.create(req.user, dto);
  }

  @Patch('active-status')
  changeActiveStatus(
    @Req() req: any,
    @Body() dto: ChangeTruckActiveStatusDto,
  ) {
    return this.trucksService.changeActiveStatus(req.user, dto);
  }

  @Patch(':truckId')
  update(
    @Req() req: any,
    @Param('truckId') truckId: string,
    @Body() dto: UpdateTruckDto,
  ) {
    return this.trucksService.update(req.user, truckId, dto);
  }
}
