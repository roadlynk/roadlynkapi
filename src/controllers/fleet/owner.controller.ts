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
import { CreateOwnerDto } from '../../dto/fleet/create-owner.dto';
import { ChangeOwnerActiveStatusDto } from '../../dto/fleet/change-owner-active-status.dto';
import { GetOwnersQueryDto } from '../../dto/fleet/get-owners-query.dto';
import { UpdateOwnerDto } from '../../dto/fleet/update-owner.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OwnersService } from '../../services/fleet/owners.service';

@Controller('owners')
@UseGuards(JwtAuthGuard)
export class OwnerController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  getAllByCompany(@Req() req: any, @Query() query: GetOwnersQueryDto) {
    return this.ownersService.getAllByCompany(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateOwnerDto) {
    return this.ownersService.create(req.user, dto);
  }

  @Get(':ownerId')
  getById(@Req() req: any, @Param('ownerId') ownerId: string) {
    return this.ownersService.getById(req.user, ownerId);
  }

  @Patch(':ownerId')
  update(
    @Req() req: any,
    @Param('ownerId') ownerId: string,
    @Body() dto: UpdateOwnerDto,
  ) {
    return this.ownersService.update(req.user, ownerId, dto);
  }

  @Patch('active-status/:ownerId')
  changeActiveStatus(
    @Req() req: any,
    @Param('ownerId') ownerId: string,
    @Body() dto: ChangeOwnerActiveStatusDto,
  ) {
    return this.ownersService.changeActiveStatus(req.user, ownerId, dto);
  }
}
