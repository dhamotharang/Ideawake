import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../../modules/user/user.entity';
import { UserLoginDto } from '../../modules/user/dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { InvalidPasswordException } from '../../exceptions/invalid-password.exception';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../../modules/user/user.service';
import { InviteService } from '../../modules/invite/invite.service';
import { ContextService } from '../../providers/context.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { In, getRepository, Like } from 'typeorm';
import { TagService } from '../../modules/tag/tag.service';
import { IntegrationService } from '../../modules/integration/integration.service';
import { parse } from 'tldts';
import { UserCommCommunities } from '../../modules/user/userCommunityCommunities.entity';
import { CommunityService } from '../../modules/community/community.service';

// import * as moment from 'moment';

@Injectable()
export class AuthService {
  private static _authUserKey = 'user_key';
  // static configService: any;

  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    public readonly inviteService: InviteService,
    public readonly tagService: TagService,
    public readonly integrationService: IntegrationService,
    public readonly communityService: CommunityService,
  ) {}

  async createToken(
    user,
    community?,
    setInDb = true,
  ): Promise<TokenPayloadDto> {
    let data = {
      id: _.head(user)['id'],
      currentCommunity: _.head(user)['currentCommunity'].id,
    };

    if (!_.isEmpty(community)) {
      data = { ...data, ...{ community: community } };
    }
    const accessToken = await this.jwtService.signAsync(data);

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: this.configService.getNumber('REFRESH_TOKEN_EXPIRATION_TIME'),
    });
    if (setInDb) {
      await this.userService.updateUser(
        { id: _.head(user)['id'] },
        { refreshToken: refreshToken },
        '',
        false,
      );
    }
    const userCommunities = getRepository(UserCommCommunities);
    const updateUserCommunityToken = userCommunities.update(
      {
        userId: _.head(user)['id'],
        communityId: _.head(user)['currentCommunity'].id,
      },
      { token: accessToken },
    );
    await Promise.all([updateUserCommunityToken]);

    return new TokenPayloadDto({
      fullToken: accessToken,
      refreshToken: refreshToken,
      currentCommunityObj: _.head(user)['currentCommunity'],
    });
  }

  async accessToken(params: {
    userId: number;
    community: number;
  }): Promise<TokenPayloadDto> {
    const data = {
      id: params.userId,
      currentCommunity: params.community,
    };
    const accessToken = await this.jwtService.signAsync(data);
    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: this.configService.getNumber('REFRESH_TOKEN_EXPIRATION_TIME'),
    });
    return new TokenPayloadDto({
      fullToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  async validateUser(
    userLoginDto: UserLoginDto,
    communityUrl,
  ): Promise<{ loginType: string; data: UserEntity[]; appData?: {} }> {
    const userCredential = await this.userService.getOneUser({
      select: ['password', 'oldPassword', 'salt'],
      where: {
        email: userLoginDto.email,
      },
    });

    let isPasswordValid = false;
    if (!_.isEmpty(userCredential)) {
      //Login with old password
      if (_.isEmpty(userCredential.password)) {
        isPasswordValid = UtilsService.validateOldHash(
          userLoginDto.password,
          userCredential.oldPassword,
          userCredential.salt,
        );
      }
      //Login with new password
      else {
        isPasswordValid = await UtilsService.validateHash(
          userLoginDto.password,
          userCredential.password,
        );
      }
    }
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }
    const user = await this.userService.getOneUser({
      relations: [
        'userCommunities',
        'userCommunities.community',
        'profileImage',
      ],
      where: {
        email: userLoginDto.email,
      },
    });

    const communityFindResult = this.findUserCommunity(
      user.userCommunities,
      communityUrl,
    );
    const inComingUrl = `${
      parse(communityUrl).subdomain ? parse(communityUrl).subdomain + '.' : ''
    }${parse(communityUrl).domain}`;
    const options = {
      where: {
        url: Like(`%${inComingUrl}%`),
      },
    };

    // Finding community for the origin's domain/subdomain.
    const data = await this.communityService.getCommunities(options);
    const foundDomain = _.find(data, function(o) {
      return (
        `${parse(o.url).subdomain ? parse(o.url).subdomain + '.' : ''}${
          parse(o.url).domain
        }` === inComingUrl
      );
    });

    // Verifying the user status in the community.
    if (
      (!communityFindResult && !_.isEmpty(foundDomain)) ||
      !user.userCommunities.length
    ) {
      throw new UserNotFoundException();
    } else if (communityFindResult) {
      if (communityFindResult.isDeleted) {
        // If user is archived.
        throw new ForbiddenException('Forbidden Access!');
      } else if (communityFindResult.isPending) {
        // If user is pendind.
        throw new ConflictException('Invite Not Accepted!');
      }
      user['currentCommunity'] = communityFindResult['community'];
    } else {
      const validCommunities = this.findAnyValidCommunity(user.userCommunities);
      if (validCommunities && validCommunities.length) {
        user['currentCommunity'] = _.head(validCommunities).community;
      } else {
        throw new ForbiddenException('Forbidden Access!');
      }
    }

    await this.userService.updateUser(
      { id: user.id },
      { lastLogin: new Date() },
      '',
      false,
    );
    if (user.skills && user.skills.length) {
      user['skillsData'] = await this.tagService.getTags({
        where: { id: In(user.skills) },
      });
    }
    user['communities'] = UtilsService.updateUserCommunityData(
      user.userCommunities,
    );
    // delete userFullData.userCommunities;

    if (userLoginDto.clientId) {
      // TODO: Check if integration is enabled. Only allow login if the
      // integration is enabled for this community.

      return {
        loginType: 'app',
        data: [user],
        appData: {
          redirectUri: userLoginDto.redirectUri,
          state: userLoginDto.state,
          community: user['currentCommunity'],
        },
      };
    }

    return { loginType: 'user', data: [user] };
  }

  parseCookiesIntoTokens(
    cookies: string[],
    communityUrl: string,
  ): { access?: string; refresh?: string } {
    const tokens = {};
    cookies.forEach(cookie => {
      if (cookie.includes(`${communityUrl}=`)) {
        tokens['access'] = cookie.replace(`${communityUrl}=`, '').trim();
      }
      if (cookie.includes('refresh-token=')) {
        tokens['refresh'] = cookie.replace('refresh-token=', '').trim();
      }
    });
    return tokens;
  }

  static setAuthUser(user: UserEntity): void {
    ContextService.set(AuthService._authUserKey, user);
  }

  static getAuthUser(): UserEntity {
    return ContextService.get(AuthService._authUserKey);
  }
  findUserCommunity(
    userCommunities: UserCommCommunities[],
    communityUrl: string,
  ): UserCommCommunities | undefined {
    return _.find(
      userCommunities,
      uComm =>
        parse(uComm.community.url).hostname === parse(communityUrl).hostname,
    );
  }

  /**
   * Verify & Decode Token
   */
  async verifyToken(token) {
    const res = jwt.verify(
      token.toString().trim(),
      this.configService.get('JWT_SECRET_KEY'),
      res => {
        return res == null ? jwt.decode(token.toString().trim()) : 'expired';
      },
    );
    return res;
  }

  /**
   * Returns the decoded payload without verifying if the signature is valid.
   * @param token JWT Token to decode.
   * @returns The decoded token.
   */
  decodeToken(token: string): {} {
    return jwt.decode(token.toString().trim());
  }

  findAnyValidCommunity(
    communities: UserCommCommunities[],
  ): UserCommCommunities[] {
    const foundCommunities = [];
    _.map(communities, val => {
      if (!val.isDeleted && !val.isPending) {
        foundCommunities.push(val);
      }
    });
    return foundCommunities;
  }
}
