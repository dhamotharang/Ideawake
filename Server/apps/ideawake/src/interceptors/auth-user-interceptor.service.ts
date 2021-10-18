import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../shared/services/config.service';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers['cookie']) {
      throw new UnauthorizedException();
    }
    const cookies = request.headers['cookie'].split(';');
    let finalToken = '';
    let sign: string;
    let payload: string;
    for (const iterator of cookies) {
      if (iterator.includes('jwt-sign=')) {
        sign = iterator.replace('jwt-sign=', '');
      }
      if (iterator.includes('jwt-header-payload=')) {
        payload = iterator.replace('jwt-header-payload=', '');
      }
    }
    finalToken = payload.trim() + '.' + sign.trim();
    try {
      const decoded = jwt.verify(
        finalToken.toString().trim(),
        this.configService.get('JWT_SECRET_KEY'),
      );
      const userData = await this.userService.getUsers({
        where: { id: decoded['id'] },
      });
      if (!userData.length) {
        throw new UnauthorizedException();
      }
      request['userData'] = userData[0];
    } catch (error) {
      throw new UnauthorizedException();
    }
    return next.handle();
  }
}
