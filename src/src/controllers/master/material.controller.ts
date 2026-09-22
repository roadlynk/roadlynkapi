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
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { CreateMaterialDto } from '../../dto/master/create-material.dto';
import { ChangeMaterialActiveStatusDto } from '../../dto/master/change-material-active-status.dto';
import { GetMaterialsQueryDto } from '../../dto/master/get-materials-query.dto';
import { UpdateMaterialDto } from '../../dto/master/update-material.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { MaterialService } from '../../services/master/material.service';

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireAllRoles(UserCompanyType.PROVIDER)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  getAll(@Req() req: any, @Query() query: GetMaterialsQueryDto) {
    return this.materialService.getAll(req.user, query);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateMaterialDto) {
    return this.materialService.create(req.user, dto);
  }

  @Patch('active-status/:materialId')
  changeActiveStatus(
    @Req() req: any,
    @Param('materialId') materialId: string,
    @Body() dto: ChangeMaterialActiveStatusDto,
  ) {
    return this.materialService.changeActiveStatus(req.user, materialId, dto);
  }

  @Patch(':materialId')
  update(
    @Req() req: any,
    @Param('materialId') materialId: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialService.update(req.user, materialId, dto);
  }
}
