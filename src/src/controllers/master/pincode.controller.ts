import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetPincodeQueryDto } from '../../dto/master/get-pincode-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PincodeService } from '../../services/master/pincode.service';

@Controller('pincode')
@UseGuards(JwtAuthGuard)
export class PincodeController {
  constructor(private readonly pincodeService: PincodeService) {}

  @Get()
  getByPincode(@Query() query: GetPincodeQueryDto) {
    return this.pincodeService.findByPincode(query.pincode);
  }
}
