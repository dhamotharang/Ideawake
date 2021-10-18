import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { Brackets } from 'typeorm';
import {
  BOOLEAN,
  EMAIL_BOOKMARKS,
  USER_AVATAR,
} from '../../common/constants/constants';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { ConfigService } from '../../shared/services/config.service';
import { UtilsService } from '../../providers/utils.service';
import * as _ from 'lodash';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { UserAttachmentService } from '../userAttachment/userAttachment.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { RoleActorTypes } from '../../enum';
import { UserCommunityService } from './userCommunity.service';
import { UserCircleService } from './userCircle.service';

const configService = new ConfigService();

@Injectable()
export class UserService {
  private client: ClientProxy;

  constructor(
    public readonly userRepository: UserRepository,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly awsS3Service: AwsS3Service,
    private readonly userAttachmentService: UserAttachmentService,
    private readonly roleActorService: RoleActorsService,
    private readonly userCommunityService: UserCommunityService,
    private readonly userCircleService: UserCircleService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: configService.get('REDIS_URL'),
      },
    });
  }

  /**
   * Get user
   */
  async getUsers(options: {}): Promise<UserEntity[]> {
    return this.userRepository.find(options);
  }

  /**
   * Get one user
   */
  async getOneUser(options: {}): Promise<UserEntity> {
    return this.userRepository.findOne(options);
  }

  /**
   * Get user
   */
  async getUsersWithCommunity(params?: {
    communityId: number;
    isDeleted?: boolean;
    join?: object;
    id?: number;
  }): Promise<UserEntity[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userCommunities', 'userCommunities')
      .innerJoinAndSelect('userCommunities.community', 'community')
      .leftJoinAndSelect('user.profileImage', 'profileImage');

    if (params.hasOwnProperty('join') && params.join['opportunity']) {
      query.leftJoinAndSelect('user.opportunities', 'opportunities');
    }
    if (
      params.hasOwnProperty('join') &&
      params.join['opportunityType'] &&
      params.join['opportunity']
    ) {
      query.leftJoinAndSelect(
        'opportunities.opportunityType',
        'opportunityType',
      );
    }
    query.where('userCommunities.communityId = :communityId', {
      communityId: params.communityId,
    });

    if (params.hasOwnProperty('isDeleted')) {
      query.andWhere('userCommunities.isDeleted = :isDeleted', {
        isDeleted: params.isDeleted,
      });
    }

    if (params.hasOwnProperty('id')) {
      query.andWhere('user.id = :id', {
        id: params.id,
      });
    }

    return query.getMany();
  }
  /**
   * Get user
   */
  async getUserWithSpecificCommunity(userId, communityId): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userCommunities', 'userCommunities')
      .leftJoinAndSelect('userCommunities.community', 'community')
      .where('user.id = :userId', {
        userId: userId,
      })
      .andWhere('userCommunities.communityId = :communityId', {
        communityId: communityId,
      })
      .getOne();
  }

  /**
   * Get user
   */
  async getUsersWithFilters(params?: {
    userIds?: number[];
    emails?: string[];
    communityId: number;
    isDeleted?: boolean;
    isPending?: boolean;
    ignoreJoin?: { communities?: boolean; profileImage?: boolean };
  }): Promise<UserEntity[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (!_.get(params, 'ignoreJoin.communities')) {
      // If user's communities data is required then join and select.
      query.innerJoinAndSelect('user.userCommunities', 'userCommunities');
    } else {
      // Otherwise only put a DB join (to save ORM hydration).
      query.innerJoin('user.userCommunities', 'userCommunities');
    }

    if (!_.get(params, 'ignoreJoin.profileImage')) {
      query.leftJoinAndSelect('user.profileImage', 'profileImage');
    }

    query.where('userCommunities.communityId = :communityId', {
      communityId: params.communityId,
    });

    if (params.userIds && params.userIds.length) {
      query.andWhere('user.id IN (:...userIds)', {
        userIds: params.userIds,
      });
    }

    if (params.emails && params.emails.length) {
      query.andWhere('user.email IN (:...emails)', {
        emails: params.emails,
      });
    }

    if (params.hasOwnProperty('isDeleted')) {
      query.andWhere('userCommunities.isDeleted = :isDeleted', {
        isDeleted: params.isDeleted,
      });
    }

    if (params.hasOwnProperty('isPending')) {
      query.andWhere('userCommunities.isPending = :isPending', {
        isPending: params.isPending,
      });
    }

    return query.getMany();
  }

  /**
   * Fetch a community's users.
   * @param options Options to search users on.
   */
  async getCommunityUsers(options?: {
    communityId: number;
    isDeleted?: boolean;
    userIds?: number[];
    joinProfileImage?: boolean;
  }): Promise<UserEntity[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userCommunities', 'userCommunities')
      .where('userCommunities.communityId = :communityId', {
        communityId: options.communityId,
      });

    if (options.userIds && options.userIds.length) {
      query.andWhere('user.id IN (:...userIds)', {
        userIds: options.userIds,
      });
    }

    if (options.hasOwnProperty('isDeleted')) {
      query.andWhere('userCommunities.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }

    if (options.joinProfileImage) {
      query.leftJoinAndSelect('user.profileImage', 'profileImage');
    }

    return query.getMany();
  }

  /**
   * Get user
   */
  async getUserWithSpecificSelect(userId, selectClause): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('user')
      .select(selectClause)
      .where('user.id = :userId', {
        userId: userId,
      })
      .getOne();
  }

  /**
   * Add user
   */
  async addUser(data: UserRegisterDto): Promise<UserEntity> {
    const userCreated = this.userRepository.create(data);
    return this.userRepository.save(userCreated);
  }

  /**
   * Add user
   */
  async addUserWithData(params: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      role: number;
      isDeleted: boolean;
      isPending?: boolean;
      oldPassword?: string;
      salt?: string;
    };
    community: number;
    circleIds?: number[];
  }): Promise<UserEntity> {
    const roleId = params.user.role;
    const isArchivedUser = params.user.isDeleted || false;
    delete params.user.role;
    delete params.user.isDeleted;

    let user = await this.getOneUser({
      where: { email: params.user.email },
      relations: ['userCommunities'],
    });
    if (!user) {
      const userName = await UtilsService.createUserName(
        params.user.firstName,
        params.user.lastName,
        params.community,
      );
      params.user['userName'] = userName;
      user = await this.addUserWithoutDto({ ...params.user, isDeleted: false });

      // Add User Avatar
      if (params.user.firstName || params.user.lastName) {
        try {
          const content = await UtilsService.getUserAvatar(
            user.firstName,
            user.lastName,
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
              user: user.id,
              attachmentType: USER_AVATAR.type,
              url: avatarUrl,
              community: params.community,
            },
          );
          await this.updateUser(
            { id: user.id },
            { profileImage: userAttachmentResponse.id },
            params.community,
            false,
          );
        } catch (error) {
          Logger.error('Error while creating avatar:', error);
        }
      }

      user = await this.getOneUser({
        where: { email: params.user.email },
        relations: ['userCommunities'],
      });
    }

    if (!_.find(user.userCommunities, { communityId: params.community })) {
      // Assign required role
      await this.roleActorService.addRoleActors({
        role: roleId,
        actorType: RoleActorTypes.USER,
        actorId: user.id,
        entityObjectId: null,
        entityType: null,
        community: params.community,
      });

      // Add user to community
      await this.userCommunityService.addUserCommunity({
        communityId: params.community,
        userId: user.id,
        isDeleted: isArchivedUser,
        isPending: params.user.isPending || false,
      });

      // Adding user to circles.
      if (_.get(params, 'circleIds.length')) {
        await this.userCircleService.addUserCircle(
          params.circleIds.map(circleId => ({ userId: user.id, circleId })),
        );
      }

      // Adding newly created user in elasticSearch.
      const userDataForElasticSearch = await this.getOneUser({
        where: { id: user.id },
      });
      userDataForElasticSearch['communityId'] = params.community;
      this.elasticSearchService.addUserData(userDataForElasticSearch);
    }

    return user;
  }

  /**
   * Add user without DTO
   */
  async addUserWithoutDto(data: {}): Promise<UserEntity> {
    const userCreated = this.userRepository.create(data);
    return this.userRepository.save(userCreated);
  }

  async addExistingUserToCommunity(params: {
    userId: number;
    roleId: number;
    communityId: number;
    isArchivedUser?: boolean;
    isPendingUser?: boolean;
    circleIds?: number[];
  }): Promise<{}> {
    const user = await this.getOneUser({
      where: { id: params.userId },
    });
    let commUserAdded = {};

    if (user) {
      // Add user to community
      const commUser = await this.userCommunityService.getUserCommunity({
        where: { userId: params.userId, communityId: params.communityId },
      });
      if (commUser) {
        // If the user already exists in the community, update the status.
        commUserAdded = await this.userCommunityService.updateUserCommunity(
          { communityId: params.communityId, userId: params.userId },
          {
            isDeleted: params.isArchivedUser || false,
            isPending: params.isPendingUser || false,
          },
        );
      } else {
        // Otherwise add the user to the community.
        commUserAdded = await this.userCommunityService.addUserCommunity({
          communityId: params.communityId,
          userId: params.userId,
          isDeleted: params.isArchivedUser || false,
          isPending: params.isPendingUser || false,
        });
      }

      // Assign required role
      await this.roleActorService.addOrUpdateRoleActors(
        {
          actorType: RoleActorTypes.USER,
          actorId: params.userId,
          entityObjectId: null,
          entityType: null,
          community: params.communityId,
        },
        {
          role: params.roleId,
          actorType: RoleActorTypes.USER,
          actorId: params.userId,
          entityObjectId: null,
          entityType: null,
          community: params.communityId,
        },
      );

      // Adding user to circles.
      if (_.get(params, 'circleIds.length')) {
        await this.userCircleService.saveUserCircles(
          params.circleIds.map(circleId => ({
            userId: params.userId,
            circleId,
          })),
        );
      }

      // Adding newly created community user in elasticSearch.
      user['communityId'] = params.communityId;
      this.elasticSearchService.addUserData(user);
    }

    return commUserAdded;
  }

  /**
   * Update user
   */
  async updateUser(
    options: {},
    data: {},
    community?,
    updateInElastic = false,
  ): Promise<{}> {
    const updatedUserData = await this.userRepository.update(options, data);
    if (updateInElastic) {
      const userObject = await this.getOneUser({
        where: { id: options['id'] },
      });
      userObject['communityId'] = community;

      this.elasticSearchService.editUserData({
        id: userObject.id,
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        userName: userObject.userName,
        email: userObject.email,
        secondaryEmail: userObject.secondaryEmail,
        profileBio: userObject.profileBio,
        skills: userObject.skills,
        region: userObject.region,
        country: userObject.country,
        city: userObject.city,
        zipCode: userObject.zipCode,
        timeZone: userObject.timeZone,
        latLng: userObject.latLng,
        position: userObject.position,
        company: userObject.company,
        communityId: userObject['communityId'],
        isDeleted: userObject.isDeleted,
      });
    }
    return updatedUserData;
  }

  /**
   * Delete user
   */
  async deleteUser(options: {}): Promise<{}> {
    return this.userRepository.delete(options);
  }

  /**
   * Get
   */
  async searchUsersInCircle(options: {
    take?: number;
    skip?: number;
    communityId: number;
    circleId: number;
    showArcived: string;
    searchKeys: { name: string; userName: string; email: string };
    joinProfileImage?: boolean;
    sortBy?: string;
    sortType?: 'ASC' | 'DESC';
    isUserPending?: boolean;
  }): Promise<[UserEntity[], number]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userCircles', 'userCircles')
      .leftJoin('userCircles.circle', 'circle')
      .leftJoin('user.userCommunities', 'userCommunities')
      .where('userCommunities.communityId = :communityId', {
        communityId: options.communityId,
      })
      .andWhere('userCircles.circle = :circleId', {
        circleId: options.circleId,
      })
      .andWhere(
        new Brackets(qb => {
          if (options.showArcived !== BOOLEAN.FALSE) {
            qb.andWhere('userCommunities.isDeleted = :isDeleted', {
              isDeleted: true,
            });
          } else {
            qb.andWhere('userCommunities.isDeleted = :isDeleted', {
              isDeleted: false,
            });
          }
        }),
      );

    if (options.hasOwnProperty('isUserPending')) {
      query.andWhere('userCommunities.isPending = :isUserPending', {
        isUserPending: options.isUserPending,
      });
    }

    if (options.joinProfileImage) {
      query.leftJoinAndSelect('user.profileImage', 'profileImage');
    }

    if (options.sortBy && options.sortType) {
      query.orderBy(`user.${options.sortBy}`, options.sortType);
    } else {
      // Default sort by full name in ASC order.
      query.orderBy({ 'user.firstName': 'ASC', 'user.lastName': 'ASC' });
    }

    if (
      options.searchKeys.name ||
      options.searchKeys.userName ||
      options.searchKeys.email
    ) {
      query.andWhere(
        new Brackets(qb => {
          if (options.searchKeys.name) {
            qb.orWhere('LOWER(user.firstName) like :name', {
              name: `%${options.searchKeys.name.toLowerCase()}%`,
            });
            qb.orWhere('LOWER(user.lastName) like :name', {
              name: `%${options.searchKeys.name.toLowerCase()}%`,
            });
          }
          if (options.searchKeys.userName) {
            qb.orWhere('LOWER(user.userName) like :userName', {
              userName: `%${options.searchKeys.userName.toLowerCase()}%`,
            });
          }
          if (options.searchKeys.email) {
            qb.orWhere('LOWER(user.email) like :email', {
              email: `%${options.searchKeys.email.toLowerCase()}%`,
            });
          }
        }),
      );
    }

    if (options.take) {
      query.take(options.take).skip(options.skip || 0);
    }

    return query.getManyAndCount();
  }

  /**
   * Search users in a community.
   * @param options Options to search users on.
   */
  async searchCommunityUsers(options: {
    communityId: number;
    take?: number;
    skip?: number;
    searchText?: string;
    isUserDeleted?: boolean;
    isUserPending?: boolean;
    joinProfileImage?: boolean;
    sortBy?: string;
    sortType?: 'ASC' | 'DESC';
    userIds?: number[];
    excludedIds?: number[];
  }): Promise<[UserEntity[], number]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userCommunities', 'userCommunities')
      .where('userCommunities.communityId = :communityId', {
        communityId: options.communityId,
      });

    if (options.joinProfileImage) {
      query.leftJoinAndSelect('user.profileImage', 'profileImage');
    }
    if (options.hasOwnProperty('isUserPending')) {
      query.andWhere('userCommunities.isPending = :isUserPending', {
        isUserPending: options.isUserPending,
      });
    }
    if (options.hasOwnProperty('isUserDeleted')) {
      query.andWhere('userCommunities.isDeleted = :isUserDeleted', {
        isUserDeleted: options.isUserDeleted,
      });
    }
    if (options.searchText) {
      query
        .andWhere(
          new Brackets(qb => {
            qb.orWhere('user.firstName ILIKE :searchText')
              .orWhere('user.lastName ILIKE :searchText')
              .orWhere('user.userName ILIKE :searchText')
              .orWhere('user.email ILIKE :searchText')
              .orWhere(
                `user.firstName || ' ' || user.lastName ILIKE :searchText`,
              );
          }),
        )
        .setParameter('searchText', `%${options.searchText}%`);
    }
    if (_.get(options, 'userIds.length')) {
      query.andWhere('user.id IN (:...userIds)', { userIds: options.userIds });
    }
    if (_.get(options, 'excludedIds.length')) {
      query.andWhere('user.id NOT IN (:...excludedIds)', {
        excludedIds: options.excludedIds,
      });
    }
    if (options.take) {
      query.take(options.take).skip(options.skip || 0);
    }
    if (options.sortBy && options.sortType) {
      query.orderBy(`user.${options.sortBy}`, options.sortType);
    } else {
      // Default sort by full name in ASC order.
      query.orderBy({ 'user.firstName': 'ASC', 'user.lastName': 'ASC' });
    }

    return query.getManyAndCount();
  }

  /**
   * Get user counts for the given community or circle.
   * @param options Options to search users on.
   */
  async getUserCount(options: {
    communityId: number;
    circleId?: number;
    isUserDeleted?: boolean;
    isUserPending?: boolean;
  }): Promise<number> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.userCommunities', 'userCommunities')
      .where('userCommunities.communityId = :communityId', {
        communityId: options.communityId,
      });

    if (options.circleId) {
      query
        .leftJoin('user.userCircles', 'userCircles')
        .leftJoin('userCircles.circle', 'circle')
        .andWhere('userCircles.circle = :circleId', {
          circleId: options.circleId,
        });
    }

    if (options.hasOwnProperty('isUserDeleted')) {
      query.andWhere('userCommunities.isDeleted = :isUserDeleted', {
        isUserDeleted: options.isUserDeleted,
      });
    }
    if (options.hasOwnProperty('isUserPending')) {
      query.andWhere('userCommunities.isPending = :isUserPending', {
        isUserPending: options.isUserPending,
      });
    }

    return query.getCount();
  }

  /**
   * Add reset password email
   */
  async addResetPasswordEmail(_data: {
    code;
    to: string;
    firstName: string;
    url;
    community;
    communityName: string;
  }): Promise<any> {
    const defaultEmailTemplate = _.head(
      await this.client
        .send('getDefaultEmailTemplates', { name: 'Default Email Template' })
        .toPromise(),
    );
    const forgotPasswordEmailTemplate = _.head(
      await this.client
        .send('getEmailTemplateForCommunity', {
          name: 'Forgot Password',
          community: _data.community,
        })
        .toPromise(),
    );

    const replacements = {
      [EMAIL_BOOKMARKS.BODY]: forgotPasswordEmailTemplate['body'],
      [EMAIL_BOOKMARKS.FOOTER]: forgotPasswordEmailTemplate['footerSection'],
      [EMAIL_BOOKMARKS.FEATURE_IMG]:
        forgotPasswordEmailTemplate['featureImage'],
      [EMAIL_BOOKMARKS.LINK_BTN]: UtilsService.generateResetPasswordUrlButton(
        _data.url,
        _data.code,
      ),
      [EMAIL_BOOKMARKS.FIRST_NAME]: _data.firstName,
      [EMAIL_BOOKMARKS.TAG_LINE]: '',
      [EMAIL_BOOKMARKS.COMPANY_NAME]: _data.communityName,
      [EMAIL_BOOKMARKS.COMMUNITY_NAME]: _data.communityName,
      [EMAIL_BOOKMARKS.SUBJECT]: forgotPasswordEmailTemplate['subject'],
    };

    _.forEach(replacements, (replacement, key) => {
      forgotPasswordEmailTemplate['subject'] = forgotPasswordEmailTemplate[
        'subject'
      ].replace(new RegExp(key, 'g'), replacement);
      defaultEmailTemplate['body'] = defaultEmailTemplate['body'].replace(
        new RegExp(key, 'g'),
        replacement,
      );
    });

    return this.client
      .send('addSendEmailsData', {
        to: _data.to,
        from: forgotPasswordEmailTemplate['senderEmail'],
        emailContent: defaultEmailTemplate['body'],
        status: 'pending',
        community: _data.community,
        subject: forgotPasswordEmailTemplate['subject'],
      })
      .toPromise();
  }
}
