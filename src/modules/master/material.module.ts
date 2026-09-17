import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialController } from '../../controllers/master/material.controller';
import { MaterialRepository } from '../../repositories/material.repository';
import { Material, MaterialSchema } from '../../schemas/master/company-specific/material.schema';
import { MaterialService } from '../../services/master/material.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../auth/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }]),
  ],
  controllers: [MaterialController],
  providers: [MaterialRepository, MaterialService],
})
export class MaterialModule {}
