import { UserEntity } from './../modules/user/user.entity';
import { Request, Response } from 'express';
import {
  Injectable,
  UnauthorizedException,
  NestMiddleware,
} from '@nestjs/common';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../shared/services/config.service';
import { UserService } from '../modules/user/user.service';
import { AuthService } from '../modules/auth/auth.service';
import { parse } from 'tldts';
import {
  COOKIE_SAME_SITE_TYPES,
  ENVIRONMENTS,
} from '../common/constants/constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    public readonly authService: AuthService,
  ) {}
  private cookieSameSiteDefault = 'Lax';

  async use(_req: Request, _res: Response, next: Function): Promise<void> {
    let originUrl;
    let communityName;
    if (_req.headers && _req.headers.origin) {
      originUrl = parse(_req.headers.origin.toString());
      communityName = originUrl.subdomain || originUrl.domainWithoutSuffix;
    }

    const excludedRoutes = [
      { route: '/auth/user-login', type: 'POST' },
      { route: '/auth/logout', type: 'POST' },
      { route: '/auth/verify-login', type: 'POST' },
      { route: '/auth/user-register', type: 'POST' },
      { route: '/auth/reset-password', type: 'POST' },
      { route: '/password-reset', type: 'GET', slug: true },
      { route: '/password-reset/user', type: 'patch' },
      { route: '/auth/accept-invite', type: 'POST' },
      { route: '/auth/switch-user-community', type: 'GET' },
      { route: '/auth/refresh-token', type: 'POST' },
      { route: '/users/check-duplicate', type: 'GET' },
      { route: '/tenant/register', type: 'POST' },
      { route: '/community/check-duplicate', type: 'GET' },
      { route: '/auth/saml', type: 'GET' },
      { route: '/auth/reply-saml', type: 'POST', slug: true },
      { route: '/health', type: 'GET' },
      { route: '/invite/validate', type: 'GET' },
      { route: '/community/details-from-url', type: 'GET' },
    ];
    const found = _.find(excludedRoutes, function(o) {
      if (o.slug && _req.baseUrl.includes(o.route)) {
        return true;
      }
      return o.route === _req.baseUrl && o.type === _req.method;
    });
    //Allow Access To Excluded Routes
    if (found) {
      return next();
    }

    try {
      const authorization = _req.headers['authorization']
        ? _req.headers['authorization'].split(' ')
        : '';

      // Get Access Token From Authorization Header OR Get Auth Token From AuthV2 Call
      let accessToken =
        authorization.length > 0 && authorization[0] == 'Bearer'
          ? authorization[1]
          : _req.body.code;

      //Get Auth Token from Session Cookie - FrontEnd
      let refreshToken: string;
      if (!accessToken) {
        if (!_req.headers['cookie']) {
          throw new UnauthorizedException();
        }
        const tempTokenArray = _req.headers['cookie']
          ? _.map(_req.headers['cookie'].split(';'), (_val, _key) => {
              if (_val.includes(`${communityName}=`)) {
                return {
                  accessToken: _val.replace(`${communityName}=`, ''),
                };
              }
              if (_val.includes('refresh-token=')) {
                return { refreshToken: _val.replace('refresh-token=', '') };
              }
            })
          : [];
        const tokens = _.reduce(
          _.compact(tempTokenArray),
          function(memo, current) {
            return _.assign(memo, current);
          },
          {},
        );
        accessToken = tokens['accessToken'].trim();
        refreshToken = tokens['refreshToken'].trim();
      }

      //Verify Token and Decode Payload from it.
      let accessDecode: any = await this.authService.verifyToken(accessToken);
      let expiredUserData: UserEntity;

      //If Access Token Expired Use Refresh Token
      if (accessDecode === 'expired') {
        const refreshDecode: any = await this.authService.verifyToken(
          refreshToken,
        );
        const expiredAccessDecode = this.authService.decodeToken(accessToken);

        //If Refresh Token Expired Throw Exception
        if (
          refreshDecode === 'expired' ||
          refreshDecode['id'] !== expiredAccessDecode['id']
        ) {
          throw new UnauthorizedException();
        }
        const userDataForToken = await this.userService.getUserWithSpecificSelect(
          refreshDecode['id'],
          'user.refreshToken',
        );

        //Make Sure Refresh Token is Of Valid User
        if (userDataForToken.refreshToken === refreshToken) {
          expiredUserData = await this.userService.getUserWithSpecificCommunity(
            refreshDecode['id'],
            expiredAccessDecode['currentCommunity'],
          );
          expiredUserData.refreshToken = userDataForToken.refreshToken;
          expiredUserData['currentCommunity'] =
            expiredUserData.userCommunities[0].community;
          //Create New Access and Refresh Token Against User
          const newToken = await this.authService.createToken(
            [expiredUserData],
            [],
            false,
          );
          // Set New Token In HTTP Cookie
          _res.cookie(`${communityName}`, newToken.fullToken, {
            httpOnly: true,
            sameSite:
              this.configService.get('COOKIE_SAME_SITE') ||
              this.cookieSameSiteDefault,
            ...(this.configService.get('COOKIE_SAME_SITE') ===
              COOKIE_SAME_SITE_TYPES.NONE &&
              this.configService.getEnv() !== ENVIRONMENTS.DEVELOP && {
                secure: true,
              }),
          });
          accessDecode = jwt.decode(newToken.fullToken);
        } else {
          throw new UnauthorizedException();
        }
      } else {
        // Verify community if token is not expired.
        const communityParamId =
          _req.query['community'] ||
          _req.query['communityId'] ||
          _req.body['community'] ||
          _req.body['communityId'];
        if (
          communityParamId &&
          parseInt(communityParamId) !== accessDecode['currentCommunity']
        ) {
          throw new UnauthorizedException();
        }

        // Adding in community id from token to data.
        _req.query['community'] = _req.body['community'] =
          accessDecode['currentCommunity'];
      }

      // TODO: Verify Access Token For Integrations.

      const userData = await this.userService.getUsers({
        where: { id: accessDecode['id'] },
      });
      userData[0]['currentCommunity'] = accessDecode['currentCommunity'];
      _req['userData'] = userData[0];

      _req['accessToken'] = jwt.decode(accessToken.toString().trim());
    } catch (error) {
      throw new UnauthorizedException();
    }
    next();
  }
}
