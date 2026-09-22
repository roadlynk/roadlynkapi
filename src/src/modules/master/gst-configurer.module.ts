import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GstConfigurerController } from '../../controllers/master/gst-configurer.controller';
import { GstConfigurerRepository } from '../../repositories/gst-configurer.repository';
import {
  GstConfigurer,
  GstConfigurerSchema,
} from '../../schemas/master/general/gst-configurer.schema';
import { GstConfigurerService } from '../../services/master/gst-configurer.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: GstConfigurer.name, schema: GstConfigurerSchema },
    ]),
  ],
  controllers: [GstConfigurerController],
  providers: [GstConfigurerRepository, GstConfigurerService],
})
export class GstConfigurerModule {}
