import { Module } from '@nestjs/common';
import { ImagesController } from '../../controllers/common/image.controller';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { CloudinaryService } from '../../services/common/cloudinary.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ImagesController],
  providers: [CloudinaryProvider, CloudinaryService],
})
export class ImagesModule {}