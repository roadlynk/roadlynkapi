import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBunkDto } from '../../dto/master/create-bunk.dto';
import { GetBunksQueryDto } from '../../dto/master/get-bunks-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BunkService } from '../../services/master/bunk.service';

@Controller('bunks')
@UseGuards(JwtAuthGuard)
export class BunkController {
  constructor(private readonly bunkService: BunkService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBunkDto) {
    return this.bunkService.create(req.user, dto);
  }

  @Post('filter')
  getByFilters(@Req() req: any, @Body() dto: GetBunksQueryDto) {
    return this.bunkService.getByFilters(req.user, dto);
  }
}
