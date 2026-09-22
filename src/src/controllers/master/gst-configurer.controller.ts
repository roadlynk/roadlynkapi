import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { RequireAllRoles, Roles } from '../../decorators/roles.decorator';
import { CreateGstConfigurerDto } from '../../dto/master/create-gst-configurer.dto';
import { UpdateGstConfigurerDto } from '../../dto/master/update-gst-configurer.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { GstConfigurerService } from '../../services/master/gst-configurer.service';

@Controller('gst-configurer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireAllRoles(UserCompanyType.PROVIDER)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class GstConfigurerController {
  constructor(private readonly gstConfigurerService: GstConfigurerService) {}

  @Get()
  getAll() {
    return this.gstConfigurerService.getAll();
  }

  @Post()
  create(@Body() dto: CreateGstConfigurerDto) {
    return this.gstConfigurerService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGstConfigurerDto) {
    return this.gstConfigurerService.update(id, dto);
  }

  @Get('active-percentage')
  getActivePercentage() {
    return this.gstConfigurerService.getActivePercentage();
  }

  @Patch('active-status/:id')
  changeActiveStatus(@Param('id') id: string) {
    return this.gstConfigurerService.changeActiveStatus(id);
  }
}
