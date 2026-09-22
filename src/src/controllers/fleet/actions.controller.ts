import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { GetActionsQueryDto } from '../../dto/fleet/get-actions-query.dto';
import { GetAllActionsQueryDto } from '../../dto/fleet/get-all-actions-query.dto';
import { ChangeActionDoneStatusDto } from '../../dto/fleet/change-action-done-status.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ActionsService } from '../../services/fleet/actions.service';

@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get('all')
  @UseGuards(RolesGuard)
  @RequireAllRoles(UserCompanyType.PROVIDER)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllByDoneStatus(@Query() query: GetAllActionsQueryDto) {
    return this.actionsService.getAllByDoneStatus(query);
  }

  @Patch('done-status/:actionId')
  changeDoneStatus(
    @Req() req: any,
    @Param('actionId') actionId: string,
    @Body() dto: ChangeActionDoneStatusDto,
  ) {
    return this.actionsService.changeDoneStatus(req.user, actionId, dto);
  }

  @Get()
  getByCompany(@Req() req: any, @Query() query: GetActionsQueryDto) {
    return this.actionsService.getByCompany(req.user, query);
  }
}