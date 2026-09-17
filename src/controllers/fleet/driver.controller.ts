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
import { ChangeDriverActiveStatusDto } from '../../dto/fleet/change-driver-active-status.dto';
import { CreateDriverDto } from '../../dto/fleet/create-driver.dto';
import { GetDriversQueryDto } from '../../dto/fleet/get-drivers-query.dto';
import { UpdateDriverDto } from '../../dto/fleet/update-driver.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DriversService } from '../../services/fleet/drivers.service';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriverController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  getAllByCompany(@Req() req: any, @Query() query: GetDriversQueryDto) {
    return this.driversService.getAllByCompany(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateDriverDto) {
    return this.driversService.create(req.user, dto);
  }

  @Get(':driverId')
  getById(@Req() req: any, @Param('driverId') driverId: string) {
    return this.driversService.getById(req.user, driverId);
  }

  @Patch(':driverId')
  update(
    @Req() req: any,
    @Param('driverId') driverId: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driversService.update(req.user, driverId, dto);
  }

  @Patch('active-status/:driverId')
  changeActiveStatus(
    @Req() req: any,
    @Param('driverId') driverId: string,
    @Body() dto: ChangeDriverActiveStatusDto,
  ) {
    return this.driversService.changeActiveStatus(req.user, driverId, dto);
  }
}
