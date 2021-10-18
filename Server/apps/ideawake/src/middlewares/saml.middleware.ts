import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { CommunitySSOLoginEnum } from '../enum';
import { TABLES } from '../common/constants/constants';
import { getConnection } from 'typeorm';
import * as _ from 'lodash';
import { SamlStrategy } from '../modules/auth/saml.strategy';
import { ConfigService } from '../shared/services/config.service';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class SamlMiddleware implements NestMiddleware {
  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
  ) {}
  async use(req: Request, _res: Response, _next: Function) {
    // Handle Strategy instance creation for SAML response.
    let slug;
    if (_.get(req, 'route.path', '').includes('/auth/reply-saml')) {
      slug = _.get(req, 'params.communitySlug');
      if (!slug) {
        // Initiallize empty SAML strategy.
        new SamlStrategy(this.configService, this.userService, {});
        return _next();
      }
    }

    // check community configurations here
    const query = getConnection()
      .createQueryBuilder()
      .select(`community`)
      .from(`${TABLES.COMMUNITY}`, `community`)
      .leftJoinAndSelect('community.authIntegration', 'authIntegration');

    // Find community based either on slug (if present) or id.
    if (slug) {
      query.where(`community.communitySlug = :slug`, { slug });
    } else {
      query.where(`community.id = :id`, { id: req.query['community'] });
    }

    const communityData = await query.getOne();

    let localPortSetting = '';
    if (this.configService.getEnv() === 'development') {
      localPortSetting = `:${this.configService.getNumber('CLIENT_PORT')}`;
    }

    if (communityData['loginWithSSO'] === CommunitySSOLoginEnum.DISABLED) {
      _res.redirect(
        `${communityData['url']}${localPortSetting}/auth/login?e_status=2`,
      );
    }
    //

    const data = {
      SAML_ENTRYPOINT: _.head(communityData['authIntegration'])['loginUrl'],
      SAML_ISSUER: _.head(communityData['authIntegration'])['clientId'],
      SAML_CALLBACK_URL:
        this.configService.get('SAML_CALLBACK_URL') +
        communityData['communitySlug'],
    };

    req['authIntCommunityData'] = data;
    new SamlStrategy(this.configService, this.userService, data);
    return _next();
  }
}
