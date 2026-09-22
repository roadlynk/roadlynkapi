import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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

  @Get()
  getAll(@Req() req: any, @Query() query: GetBunksQueryDto) {
    return this.bunkService.getAll(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateBunkDto) {
    return this.bunkService.create(req.user, dto);
  }
}
