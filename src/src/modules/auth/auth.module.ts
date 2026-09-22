import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PublicAuthController } from '../../controllers/auth/auth.controller';
import { UsersController } from '../../controllers/auth/users.controller';
import { CompanyMembershipsController } from '../../controllers/auth/company-memberships.controller';
import { TestController } from '../../controllers/test.controller';
import { AuthService } from '../../services/auth/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { UsersModule } from './users.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as any,
        },
      }),
    }),
  ],
  controllers: [
    PublicAuthController,
    UsersController,
    CompanyMembershipsController,
    TestController,
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
