import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChangeClientBranchActiveStatusDto } from '../../dto/master/change-client-branch-active-status.dto';
import { CreateClientBranchDto } from '../../dto/master/create-client-branch.dto';
import { UpdateClientBranchDto } from '../../dto/master/update-client-branch.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ClientBranchService } from '../../services/master/client-branch.service';

@Controller('client-branches')
@UseGuards(JwtAuthGuard)
export class ClientBranchController {
  constructor(private readonly clientBranchService: ClientBranchService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateClientBranchDto) {
    return this.clientBranchService.create(req.user, dto);
  }

  @Patch('active-status/:branchId')
  changeActiveStatus(
    @Req() req: any,
    @Param('branchId') branchId: string,
    @Body() dto: ChangeClientBranchActiveStatusDto,
  ) {
    return this.clientBranchService.changeActiveStatus(
      req.user,
      branchId,
      dto,
    );
  }

  @Patch(':branchId')
  update(
    @Req() req: any,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateClientBranchDto,
  ) {
    return this.clientBranchService.update(req.user, branchId, dto);
  }
}
