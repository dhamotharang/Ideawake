import { Injectable } from '@nestjs/common';
import {
  Brackets,
  FindConditions,
  FindOneOptions,
  getConnection,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserCommunityRepository } from './userCommunity.repository';
import { UserCommCommunities } from './userCommunityCommunities.entity';

@Injectable()
export class UserCommunityService {
  constructor(
    public readonly userCommunityRepository: UserCommunityRepository,
  ) {}

  /**
   * Add User to a community.
   *
   * Note: Since the entity uses FKs as primary keys, the ORM doesn't allow
   * manual addition to those columns. Hence, raw query is being used here.
   */
  async addUserCommunity(data: {
    userId: number;
    communityId: number;
    isDeleted: boolean;
    isPending?: boolean;
  }): Promise<{}> {
    return getConnection().query(`
      INSERT INTO public.user_communities_community(user_id, community_id, is_deleted, is_pending)
      VALUES ('${data.userId}', '${data.communityId}', ${
      data.isDeleted
    }, ${data.isPending || false})
    `);
  }

  /**
   * Update User Community.
   */
  async updateUserCommunity(
    options: FindConditions<UserCommCommunities>,
    data: QueryDeepPartialEntity<UserCommCommunities>,
  ): Promise<{}> {
    return this.userCommunityRepository.update(options, data);
  }

  /**
   * Get single UserCommunity.
   */
  async getUserCommunity(
    options: FindOneOptions<UserCommCommunities>,
  ): Promise<{}> {
    return this.userCommunityRepository.findOne(options);
  }

  /**
   * Archive given community users.
   * @param options Options to search users on.
   */
  async archiveCommunityUsers(
    options: FindConditions<UserCommCommunities>,
  ): Promise<{}> {
    return this.updateUserCommunity(options, { isDeleted: true });
  }

  /**
   * Search/Get a community's users.
   * @param options Options to search users on.
   */
  async getCommunityUsers(options: {
    communityId: number;
    searchText?: string;
    isDeleted?: boolean;
    take?: number;
    skip?: number;
  }): Promise<[UserCommCommunities[], number]> {
    const query = this.userCommunityRepository
      .createQueryBuilder('userCommunity')
      .innerJoinAndSelect('userCommunity.user', 'user')
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .where('userCommunity.communityId = :communityId', {
        communityId: options.communityId,
      })
      .orderBy({ 'user.firstName': 'ASC', 'user.lastName': 'ASC' });

    if (options.searchText) {
      query
        .andWhere(
          new Brackets(qb => {
            qb.orWhere('user.firstName ILIKE :searchText')
              .orWhere('user.lastName ILIKE :searchText')
              .orWhere('user.email ILIKE :searchText')
              .orWhere('user.userName ILIKE :searchText')
              .orWhere(
                `user.firstName || ' ' || user.lastName ILIKE :searchText`,
              );
          }),
        )
        .setParameter('searchText', `%${options.searchText}%`);
    }

    if (options.hasOwnProperty('isDeleted')) {
      query.andWhere('userCommunity.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }

    if (options.take) {
      query.take(options.take).skip(options.skip || 0);
    }

    return query.getManyAndCount();
  }
}
