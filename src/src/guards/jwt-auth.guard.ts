import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { errorCode } from '../common/error.index';
import { UsersService } from '../services/auth/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing or invalid authorization token',
        error_code: errorCode.apiCommon.unauthorized,
      });
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const user = await this.usersService.findById(payload.sub);
      if (
        !user ||
        !user.isActive ||
        (user.tokenVersion ?? 1) !== (payload.tokenVersion ?? 1)
      ) {
        throw new UnauthorizedException({
          message: 'Token has been invalidated',
          error_code: errorCode.auth.invalidToken,
        });
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid or expired token',
        error_code: errorCode.auth.invalidToken,
      });
    }
  }
}
