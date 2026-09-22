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
import { CreateClientDto } from '../../dto/master/create-client.dto';
import { GetClientsQueryDto } from '../../dto/master/get-clients-query.dto';
import { ChangeClientActiveStatusDto } from '../../dto/master/change-client-active-status.dto';
import { UpdateClientDto } from '../../dto/master/update-client.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ClientService } from '../../services/master/client.service';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  getAll(@Req() req: any, @Query() query: GetClientsQueryDto) {
    return this.clientService.getAll(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateClientDto) {
    return this.clientService.create(req.user, dto);
  }

  @Patch('active-status/:clientId')
  changeActiveStatus(
    @Req() req: any,
    @Param('clientId') clientId: string,
    @Body() dto: ChangeClientActiveStatusDto,
  ) {
    return this.clientService.changeActiveStatus(req.user, clientId, dto);
  }

  @Patch(':clientId')
  update(
    @Req() req: any,
    @Param('clientId') clientId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientService.update(req.user, clientId, dto);
  }
}