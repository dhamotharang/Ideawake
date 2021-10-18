import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { IntegrationService } from '../../modules/integration/integration.service';
import { ConfigService } from '../../shared/services/config.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'ACT') {
  constructor(
    private readonly integrationService: IntegrationService,
    public readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }
  async Validate(accessObj: {
    token: string;
    clinetId: string;
  }): Promise<boolean> {
    const verifyToken = await this.integrationService.getIntegrations({
      where: {
        token: accessObj.token,
        clientId: accessObj.clinetId,
      },
    });
    if (!verifyToken.length) {
      throw new UnauthorizedException();
    } else {
      return true;
    }
  }
}
