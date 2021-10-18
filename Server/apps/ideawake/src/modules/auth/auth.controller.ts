import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  UseGuards,
  Get,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
  Param,
  Logger,
} from '@nestjs/common';

// import { ResponseFormatService } from '../services/response-format.service';
// import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { UserLoginDto } from './dto/UserLoginDto';
import { Request, Response } from 'express';
import { UserService } from '../../modules/user/user.service';
import { AuthService } from './auth.service';
import { ConfigService } from '../../shared/services/config.service';
import { UtilsService } from '../../providers/utils.service';
import {
  USER_AVATAR,
  ACTION_TYPES,
  ENTITY_TYPES,
  ROLE_ABBREVIATIONS,
  AUTH_SCOPES,
  COOKIE_SAME_SITE_TYPES,
  ENVIRONMENTS,
} from '../../common/constants/constants';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { parse } from 'tldts';
import { InviteService } from '../../modules/invite/invite.service';
import { UserAttachmentService } from '../../modules/userAttachment/userAttachment.service';
import { RoleActorsService } from '../../modules/roleActors/roleActors.service';
import { RoleActorTypes, UserRole } from '../../enum';
import { In, getRepository } from 'typeorm';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { CommunityRegisterDto } from './dto/CommunityRegisterDto';
import { UserAcceptInviteDto } from './dto/UserAcceptInviteDto';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { UserResetPassDto } from './dto/UserResetPassDto';
import { AccessTokenDto } from './dto/AccessTokenDto';
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { TenantService } from '../../modules/tenant/tenant.service';
import { CommunityService } from '../../modules/community/community.service';
import { lookup } from 'geoip-lite';
import { RoleService } from '../../modules/role/role.service';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import { RolesEnum } from '../../enum/roles.enum';
import { UserCircles } from '../../modules/user/user.circles.entity';
import { CommunityActionPoints } from '../../shared/services/communityActionPoint.service';
import { InviteGateway } from '../../modules/invite/invite.gateway';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse } from '@nestjs/swagger';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { PasswordResetService } from '../../modules/password/password-reset.service';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { TagService } from '../../modules/tag/tag.service';
import * as _ from 'lodash';
import { IntegrationService } from '../../modules/integration/integration.service';
import * as jwt from 'jsonwebtoken';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import { SamlObject } from '../../interfaces';
import { UserEntity } from '../user/user.entity';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { RoleActorsEntity } from '../roleActors/roleActors.entity';
import { VerifyLoginDto } from './dto/VerifyLoginDto';
import { CommunityEntity } from '../community/community.entity';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { BlacklistEmailService } from '../user/blacklistEmail.service';
import { UserCommunityService } from '../user/userCommunity.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly userCommunityService: UserCommunityService,
    public readonly authService: AuthService,
    private readonly awsS3Service: AwsS3Service,
    public readonly inviteService: InviteService,
    public readonly userAttachmentService: UserAttachmentService,
    public readonly roleActorService: RoleActorsService,
    public readonly tenantService: TenantService,
    public readonly communityService: CommunityService,
    public readonly roleService: RoleService,
    public readonly inviteGateway: InviteGateway,
    public readonly passwordResetService: PasswordResetService,
    public readonly tagService: TagService,
    private readonly integrationService: IntegrationService,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly blacklistEmailService: BlacklistEmailService,
  ) {}
  private configService = new ConfigService();
  private cookieSameSiteDefault = 'Lax';

  @Post('user-login')
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    userLoginDto.email = userLoginDto.email.toLowerCase();
    const userEntity = await this.authService.validateUser(
      userLoginDto,
      req.headers.origin,
    );

    const originUrl = parse(req.headers.origin.toString());

    const urlCommunity = originUrl.subdomain
      ? originUrl.subdomain
      : originUrl.domainWithoutSuffix;
    let token: TokenPayloadDto;

    if (userEntity.loginType === 'app') {
      token = await this.authService.createToken(userEntity.data);

      userEntity.appData['code'] = token.fullToken;
      res.cookie(`${urlCommunity}`, token.fullToken, {
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
      res.cookie('refresh-token', token.refreshToken, {
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

      res.send({
        statusCode: HttpStatus.OK,
        wasSuccess: true,
        message: 'User Logged In Successfully',
        response: {
          user: userEntity.data[0],
          loginStatus: true,
          appLoginStatus: true,
          appLoginData: userEntity.appData,
        },
      });
    } else {
      token = await this.authService.createToken(userEntity.data);

      if (!userEntity.data[0].profileImage) {
        /* Add User Avatar */
        const content = await UtilsService.getUserAvatar(
          userEntity.data[0].firstName,
          userEntity.data[0].lastName,
          USER_AVATAR.size,
          USER_AVATAR.background,
          USER_AVATAR.color,
        );
        const avatarUrl = await this.awsS3Service.uploadImage(
          {
            buffer: content,
            mimetype: USER_AVATAR.mimeType,
          },
          USER_AVATAR.bucketPath,
        );
        const userAttachmentResponse = await this.userAttachmentService.addUserAttachment(
          {
            user: userEntity.data[0].id,
            attachmentType: USER_AVATAR.type,
            url: avatarUrl,
            community: userEntity.data[0].userCommunities[0].community.id,
          },
        );
        await this.userService.updateUser(
          { id: userEntity.data[0].id },
          {
            profileImage: userAttachmentResponse.id,
          },
          '',
          false,
        );
        userEntity.data[0].profileImage = userAttachmentResponse;
        /* Add User Avatar */
      }
      if (!userEntity.data[0].region) {
        const ip = req.clientIp;
        const userUpdatedObjectForLocation = UtilsService.getUserLocationByIp(
          ip,
        );
        if (userUpdatedObjectForLocation !== null) {
          await this.userService.updateUser(
            { id: userEntity.data[0].id },
            userUpdatedObjectForLocation,
            token.currentCommunityObj['id'],
            true,
          );
        }
      }
      if (Array.isArray(userEntity.data) && userEntity.data.length) {
        const nonAcceptedInvites = await this.inviteService.getInvites({
          relations: ['community'],
          where: { email: userEntity.data[0].email, inviteAccepted: false },
        });
        userEntity.data[0]['invites'] = nonAcceptedInvites;

        userEntity.data[0]['roles'] = await this.roleActorService.getRoleActors(
          {
            where: {
              entityObjectId: null,
              entityType: null,
              actorId: userEntity.data[0].id,
              actorType: RoleActorTypes.USER,
              community: In(
                userEntity.data[0].userCommunities.map(
                  userCommunity => userCommunity.communityId,
                ),
              ),
            },
            relations: ['role'],
          },
        );
      }

      res.cookie(`${urlCommunity}`, token.fullToken, {
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
      res.cookie('refresh-token', token.refreshToken, {
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

      res.send({
        statusCode: HttpStatus.OK,
        wasSuccess: true,
        message: 'User Logged In Successfully',
        response: {
          user: userEntity.data[0],
          loginStatus: true,
        },
      });
    }
  }
  @Post('user-register')
  async tenantRegister(
    @Res() res: Response,
    @Req() req: Request,
    @Body('user') userData: UserRegisterDto,
    @Body('community') communityData: CommunityRegisterDto,
  ): Promise<void> {
    try {
      const originUrl = parse(req.headers.origin.toString());

      const urlCommunity = originUrl.subdomain
        ? originUrl.subdomain
        : originUrl.domainWithoutSuffix;
      userData.email = userData.email.toLowerCase();

      userData.isDeleted = false;
      userData.userName = userData.firstName + userData.lastName;

      // Get existing user with the email or create a new one if not present.
      let userResponse = await this.userService.getOneUser({
        where: { email: userData.email },
      });
      if (!userResponse) {
        userResponse = await this.userService.addUser(userData);
      }

      const tenantResponse = await this.tenantService.addTenant({
        name: communityData.name,
        email: userData.email,
        createdBy: userResponse.id,
        updatedBy: userResponse.id,
        isDeleted: false,
        ownerUser: userResponse,
      });
      const communityDataUpdated = {
        ...communityData,
        createdBy: userResponse.id,
        updatedBy: userResponse.id,
        tenant: tenantResponse,
        ownerUser: userResponse,
        isDeleted: false,
      };
      const communityResponse = await this.communityService.addCommunity(
        communityDataUpdated,
      );
      /* Add User Avatar */
      const content = await UtilsService.getUserAvatar(
        userResponse.firstName,
        userResponse.lastName,
        USER_AVATAR.size,
        USER_AVATAR.background,
        USER_AVATAR.color,
      );
      const avatarUrl = await this.awsS3Service.uploadImage(
        {
          buffer: content,
          mimetype: USER_AVATAR.mimeType,
        },
        USER_AVATAR.bucketPath,
      );
      const userAttachmentResponse = await this.userAttachmentService.addUserAttachment(
        {
          user: userResponse.id,
          attachmentType: USER_AVATAR.type,
          url: avatarUrl,
          community: communityResponse.id,
        },
      );
      await this.userService.updateUser(
        { id: userResponse.id },
        {
          profileImage: userAttachmentResponse.id,
        },
        '',
        false,
      );
      if (!userResponse.region) {
        const ip = req.clientIp;
        const geo = lookup(ip);
        if (geo !== null) {
          await this.userService.updateUser(
            { id: userResponse.id },
            {
              country: geo && geo.country ? geo.country : null,
              city: geo && geo.city ? geo.city : null,
              timeZone: geo && geo.timezone ? geo.timezone : null,
              region: geo && geo.region ? geo.region : null,
              latLng: geo && geo.ll ? geo.ll : null,
            },
            communityResponse.id,
            true,
          );
        }
      }
      /* End Add User Avatar */

      // assign required role
      const role = (await this.roleService.getRoles({
        where: {
          level: RoleLevelEnum.community,
          community: communityResponse.id,
          title: RolesEnum.admin,
        },
      }))[0];

      await this.roleActorService.addRoleActors({
        role,
        actorType: RoleActorTypes.USER,
        actorId: userResponse.id,
        entityObjectId: null,
        entityType: null,
        community: communityResponse.id,
      });

      await this.userCommunityService.addUserCommunity({
        userId: userResponse.id,
        communityId: communityResponse.id,
        isDeleted: false,
      });

      const createdUserData = await this.userService.getUsers({
        relations: [
          'userCommunities',
          'userCommunities.community',
          'profileImage',
        ],
        where: { id: userResponse.id },
      });
      const userDataForElasticSearch = await this.userService.getOneUser({
        where: { id: userResponse.id },
      });
      userDataForElasticSearch['communityId'] = communityResponse.id;

      this.elasticSearchService.addUserData(userDataForElasticSearch);
      userResponse['currentCommunity'] = communityResponse;
      createdUserData[0]['currentCommunity'] = communityResponse;
      const token = await this.authService.createToken([userResponse]);
      delete userResponse.password;
      res.cookie(`${urlCommunity}`, token.fullToken, {
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
      res.cookie('refresh-token', token.refreshToken, {
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
      res.send({
        statusCode: HttpStatus.OK,
        wasSuccess: true,
        message: 'Tenant Registered',
        response: {
          user: createdUserData[0],
          community: communityResponse,
          tenant: tenantResponse,
          loginStatus: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
  @Post('accept-invite')
  async userRegister(
    @Res() res: Response,
    @Req() req: Request,
    @Body('user') userData: UserAcceptInviteDto,
    @Body('inviteCode') inviteCode: string,
  ): Promise<void> {
    try {
      userData.email = userData.email.toLowerCase();
      const originUrl = parse(req.headers.origin.toString());

      const urlCommunity = originUrl.subdomain
        ? originUrl.subdomain
        : originUrl.domainWithoutSuffix;
      const inviteData = await this.inviteService.getOneInvite({
        where: { id: inviteCode, inviteAccepted: false },
        relations: ['community', 'role', 'user'],
      });
      if (inviteData) {
        const communityData = inviteData.community;

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // Only check is removed . in future If we need to on the expiry , only uncommment this code

        // if (moment().isAfter(moment(inviteData.expiryDate))) {
        //   res.send({
        //     statusCode: HttpStatus.OK,
        //     wasSuccess: true,
        //     message: 'Invitation Expired',
        //     response: {
        //       loginStatus: false,
        //     },
        //   });
        // }

        ///////////////////////////////////////////////////////////////////////////////////////////////////

        userData.isDeleted = false;
        const userRelations = [
          'userCommunities',
          'userCommunities.community',
          'profileImage',
        ];
        const existingUser = await this.userService.getOneUser({
          where: { email: userData.email },
          relations: userRelations,
        });
        let userResponse;
        if (_.get(existingUser, 'isPending')) {
          // Update the user data if a pending user already exist.

          // Get user's location.
          let userLocationData = {};
          if (!existingUser.region) {
            const ip = req.clientIp;
            userLocationData = UtilsService.getUserLocationByIp(ip) || {};
          }

          // Create user avatar.
          let userAttachmentResponse;
          try {
            const content = await UtilsService.getUserAvatar(
              userData.firstName,
              userData.lastName,
              USER_AVATAR.size,
              USER_AVATAR.background,
              USER_AVATAR.color,
            );
            const avatarUrl = await this.awsS3Service.uploadImage(
              { buffer: content, mimetype: USER_AVATAR.mimeType },
              USER_AVATAR.bucketPath,
            );
            userAttachmentResponse = await this.userAttachmentService.addUserAttachment(
              {
                user: userResponse.id,
                attachmentType: USER_AVATAR.type,
                url: avatarUrl,
                community: communityData.id,
              },
            );
          } catch (error) {
            Logger.error(
              'Error while creating user avatar on accept login.',
              JSON.stringify(error),
            );
          }

          // Update User Data.
          await this.userService.updateUser(
            { id: existingUser.id },
            {
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: userData.password,
              lastLogin: new Date(),
              isPending: false,
              ...(userAttachmentResponse && {
                profileImage: userAttachmentResponse.id,
              }),
              ...userLocationData,
            },
          );

          // Fetch updated user.
          userResponse = await this.userService.getOneUser({
            where: { id: existingUser.id },
            relations: userRelations,
          });
        } else if (existingUser) {
          // If an active user already exists return that.
          userResponse = existingUser;
        } else {
          // If no active or pending user already exist, create a new one.
          const userName = await UtilsService.createUserName(
            userData.firstName,
            userData.lastName,
            communityData.id,
          );
          userData.userName = userName;
          userResponse = await this.userService.addUser({
            ...userData,
            lastLogin: new Date(),
          });

          /* Add User Avatar */
          try {
            const content = await UtilsService.getUserAvatar(
              userResponse.firstName,
              userResponse.lastName,
              USER_AVATAR.size,
              USER_AVATAR.background,
              USER_AVATAR.color,
            );
            const avatarUrl = await this.awsS3Service.uploadImage(
              {
                buffer: content,
                mimetype: USER_AVATAR.mimeType,
              },
              USER_AVATAR.bucketPath,
            );
            const userAttachmentResponse = await this.userAttachmentService.addUserAttachment(
              {
                user: userResponse.id,
                attachmentType: USER_AVATAR.type,
                url: avatarUrl,
                community: communityData.id,
              },
            );
            await this.userService.updateUser(
              { id: userResponse.id },
              { profileImage: userAttachmentResponse.id },
            );
          } catch (error) {
            Logger.error(
              'Error while creating user avatar on accept login.',
              JSON.stringify(error),
            );
          }
          /* End Add User Avatar */

          // Assign user location.
          if (!userResponse.region) {
            const ip = req.clientIp;
            const userUpdatedObjectForLocation = UtilsService.getUserLocationByIp(
              ip,
            );
            if (userUpdatedObjectForLocation !== null) {
              await this.userService.updateUser(
                { id: userResponse.id },
                userUpdatedObjectForLocation,
                communityData.id,
                true,
              );
            }
          }

          // Fetch updated user.
          userResponse = await this.userService.getOneUser({
            where: { id: userResponse.id },
            relations: userRelations,
          });
        }

        // Check if user already exists as a pending user in the community.
        const userComm = _.find(
          userResponse['userCommunities'],
          userCom => userCom['communityId'] === communityData.id,
        );

        if (userComm) {
          // If a (pending) user already exist in the community, only update the
          // pending status.
          await this.userCommunityService.updateUserCommunity(
            { userId: userResponse.id, communityId: communityData.id },
            { isPending: false },
          );
        } else {
          // If the user doesn't exist in the community...

          // Assign required role
          await this.roleActorService.addRoleActors({
            role: inviteData.role,
            actorType: RoleActorTypes.USER,
            actorId: userResponse.id,
            entityObjectId: null,
            entityType: null,
            community: communityData.id,
          });

          // Add user to community.
          await this.userCommunityService.addUserCommunity({
            userId: userResponse.id,
            communityId: communityData.id,
            isDeleted: false,
            isPending: false,
          });

          // Add user to groups.
          if (inviteData.circles && inviteData.circles.length) {
            const circleUsers = inviteData.circles.map(groupId => ({
              userId: userResponse.id,
              circleId: groupId,
              role: UserRole.USER,
            }));
            const userCirclesRepository = getRepository(UserCircles);
            const createdData = userCirclesRepository.create(circleUsers);
            await userCirclesRepository.save(createdData);
          }

          // Add user to elasticsearch.
          const userDataForElasticSearch = await this.userService.getOneUser({
            where: { id: userResponse.id },
          });
          userDataForElasticSearch['communityId'] = communityData.id;
          this.elasticSearchService.addUserData(userDataForElasticSearch);
        }

        // Update invite status.
        await this.inviteService.updateInvite(
          { id: inviteData.id },
          { inviteAccepted: true },
        );
        await this.inviteGateway.pushInvites(communityData.id);

        // Give user points for accepting invite.
        const actionEntityTypeIdInvite = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.INVITE,
        )).id;
        await CommunityActionPoints.addUserPoints({
          actionType: ACTION_TYPES.ACCEPT_INVITE,
          entityTypeName: ENTITY_TYPES.USER,
          community: communityData.id,
          userId: inviteData.user.id,
          entityObjectId: userResponse.id,
          actionEntityObjectId: inviteData.id,
          actionEntityType: actionEntityTypeIdInvite,
        });

        // Create user's login token.
        userResponse['currentCommunity'] = communityData;
        const token = await this.authService.createToken([userResponse]);
        delete userResponse.password;
        const finalUserResponse: {} = { ...userResponse };
        finalUserResponse['communities'] = [communityData];

        res.cookie(`${urlCommunity}`, token.fullToken, {
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
        res.cookie('refresh-token', token.refreshToken, {
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

        res.send({
          statusCode: HttpStatus.OK,
          wasSuccess: true,
          message: 'User Registered',
          response: {
            user: finalUserResponse,
            loginStatus: true,
          },
        });
      } else {
        res.send({
          statusCode: HttpStatus.OK,
          wasSuccess: true,
          message: 'Invite does not exist',
          response: {
            loginStatus: false,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('reset-password')
  async resetUserPassword(
    @Body() body: UserResetPassDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    try {
      const originUrl = req.headers.origin;
      const parsedCommunityUrl = parse(originUrl.toString()).hostname;
      const community = await this.communityService.getCommunityFromUrl(
        parsedCommunityUrl,
      );

      let user: UserEntity;
      if (community) {
        user = _.head(
          await this.userService.getUsersWithFilters({
            emails: [body.email],
            communityId: community.id,
            isDeleted: false,
          }),
        );
      }

      if (!community || !user) {
        return ResponseFormatService.responseUnprocessableEntity(
          {},
          'No users found against the provided email',
        );
      }

      const resetData = {
        isDeleted: false,
        updatedBy: user.userName,
        createdBy: user.userName,
        userId: user.id,
        expiryDate: moment().add(1, 'days'),
        resetCode: bcrypt.hashSync(user.email, 10).replace(/[\/,?]/g, ''),
      };
      await this.passwordResetService.deletePasswordReset({
        userId: user.id,
      });

      const addedResetEntry = await this.passwordResetService.addPasswordReset(
        resetData,
      );

      if (addedResetEntry) {
        await this.userService.addResetPasswordEmail({
          code: addedResetEntry.resetCode,
          to: user.email,
          firstName: user.firstName,
          url: originUrl,
          community: community.id,
          communityName: community.name,
        });

        return ResponseFormatService.responseOk(
          addedResetEntry,
          'Reset link has been sent seccessfully',
        );
      }
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('switch-user-community')
  async switchUserCommunity(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const originUrl = parse(req.headers.origin.toString());

    const urlCommunity = originUrl.subdomain
      ? originUrl.subdomain
      : originUrl.domainWithoutSuffix;
    const tempTokenArray = req.headers['cookie']
      ? _.map(req.headers['cookie'].split(';'), (_val, _key) => {
          if (_val.includes(`${urlCommunity}=`)) {
            return { accessToken: _val.replace(`${urlCommunity}=`, '') };
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

    if (!tokens['refreshToken']) {
      throw new UnauthorizedException();
    }

    // const accessToken = tokens['accessToken'].trim();
    const refreshToken = tokens['refreshToken'].trim();
    const decoded = await jwt.verify(
      refreshToken.toString().trim(),
      this.configService.get('JWT_SECRET_KEY'),
      async res => {
        if (res == null) {
          return jwt.decode(refreshToken);
        } else {
          throw new UnauthorizedException();
        }
      },
    );
    const userData = await this.userService.getUsers({
      where: { id: decoded['id'] },
    });

    const userFullData = await this.userService.getUsers({
      relations: [
        'userCommunities',
        'userCommunities.community',
        'profileImage',
      ],
      where: {
        email: _.head(userData).email,
      },
    });
    const communityFindResult: {} = this.findUserCommunity(
      userFullData[0].userCommunities,
      req.headers.origin,
    );
    if (!communityFindResult) {
      throw new UnauthorizedException();
    }
    userFullData[0]['currentCommunity'] = communityFindResult['community'];
    /**
     * Updating Object Structure for front end
     */
    const userCommunitiesTemp = [];
    for (const i of userFullData[0].userCommunities) {
      userCommunitiesTemp.push(i.community);
    }
    if (userFullData[0].skills && userFullData[0].skills.length) {
      userFullData[0]['skillsData'] = await this.tagService.getTags({
        where: { id: In(userFullData[0].skills) },
      });
    }
    userFullData[0]['communities'] = userCommunitiesTemp;
    delete userFullData[0].userCommunities;
    /**
     * Updating Object Structure for front end
     */
    const token = await this.authService.createToken(userFullData);

    res.cookie(`${urlCommunity}`, token.fullToken, {
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
    res.cookie('refresh-token', token.refreshToken, {
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

    res.send({
      statusCode: HttpStatus.OK,
      wasSuccess: true,
      message: 'User Logged In Successfully',
      response: {
        user: userFullData[0],
        loginStatus: true,
      },
    });
  }

  @Post('verify-login')
  async verifyLogin(
    @Body() body: VerifyLoginDto,
    @Req() req: Request,
    @Res() response: Response,
  ): Promise<void> {
    // Parse cookies into tokens.
    const cookies = req.headers['cookie']
      ? req.headers['cookie'].split(';').map(cookie => cookie.trim())
      : [];

    const originUrl = parse(req.headers.origin.toString());
    const communityUrl = originUrl.subdomain
      ? originUrl.subdomain
      : originUrl.domainWithoutSuffix;

    const tokens = this.authService.parseCookiesIntoTokens(
      cookies,
      communityUrl,
    );

    if (!tokens.access && !tokens.refresh) {
      throw new UnauthorizedException();
    }

    let user: UserEntity;
    let community: CommunityEntity;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessDecoded: any = await this.authService.verifyToken(
      tokens.access || '',
    );

    if (accessDecoded === 'expired') {
      // If access token doesn't exist or expired, create a new one using the
      // given refresh token.

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshDecoded: any = await this.authService.verifyToken(
        tokens.refresh || '',
      );
      if (refreshDecoded === 'expired') {
        throw new UnauthorizedException();
      }

      user = await this.userService.getOneUser({
        relations: [
          'userCommunities',
          'userCommunities.community',
          'profileImage',
        ],
        where: {
          id: refreshDecoded.id,
        },
      });

      // Verifying user existance in the community.
      const communityFindResult: {} = this.findUserCommunity(
        user.userCommunities,
        req.headers.origin,
      );
      if (!communityFindResult) {
        throw new UnauthorizedException();
      }

      user['currentCommunity'] = communityFindResult['community'];
      community = communityFindResult['community'];

      // Creating new tokens for the user.
      const updatedTokens = await this.authService.createToken([user]);
      response.cookie(`${communityUrl}`, updatedTokens.fullToken, {
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
      response.cookie('refresh-token', updatedTokens.refreshToken, {
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
    } else {
      // If access token exists, get user details.
      user = await this.userService.getOneUser({
        relations: [
          'userCommunities',
          'userCommunities.community',
          'profileImage',
        ],
        where: {
          id: accessDecoded.id,
        },
      });
      community = await this.communityService.getOneCommunity({
        where: { id: accessDecoded.currentCommunity },
      });
      user['currentCommunity'] = community;
    }

    // Updating Object Structure for front-end.
    if (user.skills && user.skills.length) {
      user['skillsData'] = await this.tagService.getTags({
        where: { id: In(user.skills) },
      });
    }
    user['communities'] = UtilsService.updateUserCommunityData(
      user.userCommunities,
    );

    // Formatting response.
    const resp = {
      statusCode: HttpStatus.OK,
      wasSuccess: true,
      message: 'User already logged in.',
      response: {
        user: user,
        loginStatus: true,
      },
    };

    // Create authorization code and other data for external apps login.
    if (body && body.clientId) {
      const token = await this.authService.accessToken({
        userId: user.id,
        community: community.id,
      });

      resp.response['appLoginStatus'] = true;
      resp.response['appLoginData'] = {
        code: token.fullToken,
        redirectUri: body.redirectUri,
        state: body.state,
        community,
      };
    }

    response.send(resp);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const cookies = req.headers['cookie']
      ? req.headers['cookie'].split(';').map(cookie => cookie.trim())
      : [];
    const cookieNames = cookies.map(cookie => _.head(cookie.split('=')).trim());

    // Clear all user cookies.
    for (const cookie of cookieNames) {
      res.clearCookie(cookie, {
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
    }

    // Remove refresh token from DB.
    const refreshTokenCookie = _.head(
      cookies.filter(cookie => cookie.includes('refresh-token=')),
    );
    const refreshToken = refreshTokenCookie
      ? refreshTokenCookie.replace('refresh-token=', '').trim()
      : undefined;

    let decodedRefreshToken;
    if (refreshToken) {
      jwt.verify(
        refreshToken,
        this.configService.get('JWT_SECRET_KEY'),
        res => {
          decodedRefreshToken =
            res === null ? jwt.decode(refreshToken) : undefined;
        },
      );
    }
    if (decodedRefreshToken) {
      await this.userService.updateUser(
        { id: decodedRefreshToken['id'] },
        { refreshToken: null },
        '',
        false,
      );
    }

    res.send({
      statusCode: HttpStatus.OK,
      wasSuccess: true,
      message: 'User Logged Out Successfully',
      response: {
        logoutStatus: true,
      },
    });
  }

  @Post('token')
  /**
   * Get Access Token to Integrate External APPS
   * @param {} body clientId, clientSecret, redirectUri
   * @param {} req community from request
   * @return Access Token
   */
  async getAccessToken(
    @Body() body: AccessTokenDto,
    @Req() req: Request,
  ): Promise<{}> {
    // TODO: Check if integration is enabled for the current community.

    const clientId = this.configService.get('CLIENT_ID');
    const clientSecret = this.configService.get('CLIENT_SECRET');

    // Get roles according to the given access types.
    const roles = await this.roleService.getRoles({
      where: {
        ...(body.scope && { abbreviation: In(body.scope.split(' ')) }),
        community: req['userData'].currentCommunity,
      },
    });
    let roleActors: RoleActorsEntity[];
    if (roles.length) {
      roleActors = await this.roleActorService.getRoleActors({
        where: {
          role: In(roles.map(role => role.id)),
          actorType: RoleActorTypes.USER,
          actorId: req['userData'].id,
          entityObjectId: null,
          entityType: null,
          community: req['userData'].currentCommunity,
        },
      });
    }

    //Autorize Access Only
    if (
      body.client_id !== clientId ||
      body.client_secret !== clientSecret ||
      !roleActors ||
      !roleActors.length
    ) {
      throw new UnauthorizedException();
    }

    //Get Access Token
    const accessToken = await this.authService.accessToken({
      userId: req['userData'].id,
      community: req['userData'].currentCommunity,
    });

    //Update Newly Created Token
    await this.integrationService.updateIntegration(
      { clinetId: body.client_id },
      { token: accessToken.fullToken, refreshToken: accessToken.refreshToken },
    );
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: accessToken.fullToken,
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: accessToken.refreshToken,
    };
  }

  @Post('refresh-token')
  /**
   * Refresh access token for integrated external apps.
   * @param {} body refreshToken, grantType, clientId, clientSecret
   * @param {} req community from request
   * @return New Access & Refresh Tokens
   */
  async refreshToken(@Body() body: RefreshTokenDto): Promise<{}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshDecoded: any = await this.authService.verifyToken(
      body.refreshToken,
    );
    const accessDecoded = this.authService.decodeToken(body.accessToken);

    const clientId = this.configService.get('CLIENT_ID');
    const clientSecret = this.configService.get('CLIENT_SECRET');

    if (
      refreshDecoded === 'expired' ||
      !accessDecoded ||
      !accessDecoded['currentCommunity'] ||
      (body.scope === AUTH_SCOPES.EXTERNAL &&
        (body.clientId !== clientId || body.clientSecret !== clientSecret))
    ) {
      throw new UnauthorizedException();
    }

    //Renew Access Token
    const accessToken = await this.authService.accessToken({
      userId: refreshDecoded.id,
      community: accessDecoded['currentCommunity'],
    });

    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: accessToken.fullToken,
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: accessToken.refreshToken,
    };
  }

  @Get('saml-callback-url')
  async getSamlCallbackUrl(@Req() req: Request): Promise<ResponseFormat> {
    const communityData = await this.communityService.getOneCommunity({
      where: { id: req['accessToken']['currentCommunity'] },
    });
    const samlCallbackUrl =
      this.configService.get('SAML_CALLBACK_URL') + communityData.communitySlug;
    return ResponseFormatService.responseOk(
      { url: samlCallbackUrl },
      'SAML Callback Url',
    );
  }

  // SAML
  @Get('saml')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('saml'))
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  samlInitLogin(): void {
    // AuthGuard redirects to SSO service
  }

  @UseGuards(AuthGuard('saml'))
  @Post('reply-saml/:communitySlug')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async samlLogin(@Req() req, @Res() res, @Param() params): Promise<void> {
    const userSamlObject: SamlObject = req.user;
    // const email = body.email;
    const foundCommunity = await this.communityService.getOneCommunity({
      where: { communitySlug: params['communitySlug'] },
    });

    if (!foundCommunity) {
      throw new UnauthorizedException();
    }

    let localPortSetting = '';
    if (this.configService.getEnv() === 'development') {
      localPortSetting = `:${this.configService.getNumber('CLIENT_PORT')}`;
    }

    if (!userSamlObject.email) {
      res.redirect(
        `${foundCommunity.url}${localPortSetting}/auth/login?e_status=1`,
      );
      return;
    } else {
      // Hardcoded check for handling kiosk login (for osfnet).
      if (userSamlObject.email.includes('intranet.osfnet.org')) {
        res.redirect(
          `${foundCommunity.url}${localPortSetting}/error/shared-machine`,
        );
        return;
      } else {
        // Check if the user has a blacklisted email.
        const blackListEmail = await this.blacklistEmailService.getBlacklistEmail(
          { where: { email: userSamlObject.email, community: foundCommunity } },
        );
        if (blackListEmail) {
          res.redirect(
            `${foundCommunity.url}${localPortSetting}/auth/login?e_status=1`,
          );
          return;
        }
      }
    }

    const foundUser = await this.userService.getOneUser({
      where: { email: userSamlObject.email },
    });

    let userFullData: UserEntity;
    if (foundUser) {
      userFullData = await this.userService.getUserWithSpecificCommunity(
        foundUser.id,
        foundCommunity.id,
      );
    }

    if (userFullData) {
      const currCommunity = _.head(userFullData.userCommunities);
      if (currCommunity.isDeleted) {
        // Redirect archived user back to login page.
        res.redirect(
          `${foundCommunity.url}${localPortSetting}/auth/login?e_status=1`,
        );
        return;
      } else if (currCommunity.isPending) {
        // If the user is pending in the community, update the status.
        await this.userCommunityService.updateUserCommunity(
          { userId: userFullData.id, communityId: foundCommunity.id },
          { isPending: false },
        );
      }

      userFullData['currentCommunity'] = _.head(userFullData.userCommunities)[
        'community'
      ];
    }

    if (!userFullData || foundUser.isPending) {
      const invite = await this.inviteService.getCaseInsensitiveInvite({
        email: userSamlObject.email,
        isDeleted: false,
        inviteAccepted: false,
        communityId: foundCommunity.id,
        isSSO: true,
      });

      if (invite) {
        await this.inviteService.updateInvite(
          { id: invite.id },
          { inviteAccepted: true },
        );
      }

      let userData;
      if (!foundUser) {
        // If the user hasn't been created, create a new one.
        const userName =
          !userSamlObject.firstName && !userSamlObject.lastName
            ? _.head(userSamlObject.email.split('@'))
            : `${userSamlObject.firstName}${userSamlObject.lastName}`;

        // Get user's location.
        const ip = req.clientIp;
        const userLocationData = UtilsService.getUserLocationByIp(ip) || {};

        const userAddObject = {
          firstName: userSamlObject.firstName,
          lastName: userSamlObject.lastName,
          userName: userName,
          email: userSamlObject.email,
          lastLogin: new Date(),
          ...userLocationData,
        };
        userData = await this.userService.addUserWithoutDto(userAddObject);
      } else if (foundUser.isPending) {
        // If the user is pending, update the user data and status.

        // Get user's location.
        const ip = req.clientIp;
        const userLocationData = UtilsService.getUserLocationByIp(ip) || {};

        // Update User Data.
        await this.userService.updateUser(
          { id: foundUser.id },
          {
            ...(userSamlObject.firstName && {
              firstName: userSamlObject.firstName,
            }),
            ...(userSamlObject.lastName && {
              lastName: userSamlObject.lastName,
            }),
            lastLogin: new Date(),
            isPending: false,
            ...userLocationData,
          },
        );

        userData = foundUser;
      } else {
        userData = foundUser;
      }

      if (!userFullData) {
        await this.userCommunityService.addUserCommunity({
          userId: userData.id,
          communityId: foundCommunity.id,
          isDeleted: false,
        });

        userFullData = await this.userService.getOneUser({
          relations: ['userCommunities', 'userCommunities.community'],
          where: { email: userSamlObject.email },
        });

        // Assign required role
        if (invite) {
          // If user is invited, assign the role the user is invited for.
          await this.roleActorService.addRoleActors({
            roleId: invite.roleId,
            actorType: RoleActorTypes.USER,
            actorId: userFullData.id,
            entityObjectId: null,
            entityTypeId: null,
            communityId: foundCommunity.id,
          });
        } else {
          // Otherwise assign the user role.
          const userRole = await this.roleService.getOneRole({
            where: {
              abbreviation: ROLE_ABBREVIATIONS.USER,
              community: foundCommunity.id,
            },
          });
          await this.roleActorService.addRoleActors({
            roleId: userRole.id,
            actorType: RoleActorTypes.USER,
            actorId: userFullData.id,
            entityObjectId: null,
            entityTypeId: null,
            communityId: foundCommunity.id,
          });
        }
        userFullData['currentCommunity'] = foundCommunity;

        // Add user to elastic search.
        const userDataForElasticSearch = await this.userService.getOneUser({
          where: { id: userFullData.id },
        });
        userDataForElasticSearch['communityId'] = foundCommunity.id;
        this.elasticSearchService.addUserData(userDataForElasticSearch);
      }
    }

    // Creating user avatar for pending and new users.
    if (!userFullData.profileImage || foundUser.isPending) {
      try {
        /* Add User Avatar */
        const content = await UtilsService.getUserAvatar(
          userFullData.firstName,
          userFullData.lastName,
          USER_AVATAR.size,
          USER_AVATAR.background,
          USER_AVATAR.color,
        );
        const avatarUrl = await this.awsS3Service.uploadImage(
          {
            buffer: content,
            mimetype: USER_AVATAR.mimeType,
          },
          USER_AVATAR.bucketPath,
        );
        const userAttachmentResponse = await this.userAttachmentService.addUserAttachment(
          {
            user: userFullData.id,
            attachmentType: USER_AVATAR.type,
            url: avatarUrl,
            community: userFullData['currentCommunity']['id'],
          },
        );
        await this.userService.updateUser(
          { id: userFullData.id },
          { profileImage: userAttachmentResponse.id },
        );
        userFullData.profileImage = userAttachmentResponse;
      } catch (error) {
        Logger.error(
          'Error while creating user avatar on accept login.',
          JSON.stringify(error),
        );
      }
    }

    // Creating auth tokens and setting cookies.
    const token = await this.authService.createToken([userFullData]);

    const commUrlParsed = parse(token.currentCommunityObj['url']);
    const urlForToken = commUrlParsed.subdomain
      ? commUrlParsed.subdomain
      : commUrlParsed.domainWithoutSuffix;

    res.cookie(`${urlForToken}`, token.fullToken, {
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
    res.cookie('refresh-token', token.refreshToken, {
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

    // Redirect the user to community homepage.
    res.redirect(
      `${token.currentCommunityObj['url']}${localPortSetting}/auth/community`,
    );
  }

  findUserCommunity(userCommunitiesObject, communityUrl): {} {
    const matchedCommunity = _.find(userCommunitiesObject, function(o) {
      return parse(o.community.url).hostname === parse(communityUrl).hostname;
    });
    return matchedCommunity;
  }
}
