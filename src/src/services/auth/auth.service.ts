import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { errorCode } from '../../common/error.index';
import { UserDocument } from '../../schemas/auth-users/user.schema';
import { UsersService } from './users.service';
import { LoginDto } from '../../dto/auth/login.dto';
import { CompanyMembershipsService } from './company-memberships.service';
import { ChangePasswordDto } from '../../dto/auth/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly companyMembershipsService: CompanyMembershipsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private buildTokenPayload(user: UserDocument) {
    return {
      sub: user._id.toString(),
      username: user.username,
      userCompanyType: user.userCompanyType,
      userRole: user.userRole,
      tokenVersion: user.tokenVersion ?? 1,
    };
  }

  private mapCompanyMemberships(memberships: any[]) {
    return memberships.map((membership) => {
      const company = membership.companyId as any;

      return {
        id: company?._id?.toString?.() ?? membership.companyId,
        companyCode: company?.companyCode,
        companyName: company?.companyName,
        employeeRole: membership.employeeRole,
        isActive: membership.isActive,
      };
    });
  }

  private signAccessToken(user: UserDocument) {
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) as any;

    const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    return this.jwtService.sign(this.buildTokenPayload(user), {
      secret,
      expiresIn,
    });
  }

  private signRefreshToken(user: UserDocument) {
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as any;

    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    return this.jwtService.sign(
      {
        ...this.buildTokenPayload(user),
        type: 'refresh',
      },
      {
        secret,
        expiresIn,
      },
    );
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException({
        message: 'Current password is incorrect',
        error_code: errorCode.auth.invalidCredentials,
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.changePassword(userId, passwordHash);

    return { message: 'Password changed successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error_code: errorCode.auth.invalidCredentials,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Account is disabled',
        error_code: errorCode.auth.accountDisabled,
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error_code: errorCode.auth.invalidCredentials,
      });
    }

    const memberships = await this.companyMembershipsService.getUserCompanyMemberships(
      user._id.toString(),
    );

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        userCompanyType: user.userCompanyType,
        userRole: user.userRole,
        isActive: user.isActive,
        tokenVersion: user.tokenVersion ?? 1,
        companies: this.mapCompanyMemberships(memberships),
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException({
          message: 'Invalid refresh token',
          error_code: errorCode.auth.invalidRefreshToken,
        });
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException({
          message: 'User not found or inactive',
          error_code: errorCode.user.notFound,
        });
      }

      if ((user.tokenVersion ?? 1) !== (payload.tokenVersion ?? 1)) {
        throw new UnauthorizedException({
          message: 'Token has been invalidated',
          error_code: errorCode.auth.invalidToken,
        });
      }

      const newAccessToken = this.signAccessToken(user);
      const newRefreshToken = this.signRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        error_code: errorCode.auth.invalidRefreshToken,
      });
    }
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        error_code: errorCode.user.notFound,
      });
    }

    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return {
      message: 'Logged out successfully',
      clearClientTokens: true,
      tokenNames: ['accessToken', 'refreshToken'],
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        error_code: errorCode.user.notFound,
      });
    }

    const memberships =
      await this.companyMembershipsService.getUserCompanyMemberships(userId);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      userCompanyType: user.userCompanyType,
      userRole: user.userRole,
      isActive: user.isActive,
      tokenVersion: user.tokenVersion ?? 1,
      companies: this.mapCompanyMemberships(memberships),
    };
  }
}
