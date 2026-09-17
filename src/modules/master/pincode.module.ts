import { Module } from '@nestjs/common';
import { PincodeController } from '../../controllers/master/pincode.controller';
import { PincodeService } from '../../services/master/pincode.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [PincodeController],
  providers: [PincodeService],
})
export class PincodeModule {}
