import { Injectable } from '@nestjs/common';
import { UserCircleRepository } from './userCircle.repository';
import { UserCircles } from './user.circles.entity';
import { UtilsService } from '../../providers/utils.service';
import { differenceBy, get } from 'lodash';
import { UserEntity } from './user.entity';
import { DeepPartial, FindConditions } from 'typeorm';

@Injectable()
export class UserCircleService {
  constructor(public readonly userCircleRepository: UserCircleRepository) {}

  /**
   * Get userCircles
   */
  async getUserCircles(options: {}): Promise<UserCircles[]> {
    return this.userCircleRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'userCircle',
        ),
      }),
    });
  }

  /**
   * Add userCircle
   */
  async addUserCircle(data: {}): Promise<UserCircles> {
    const userCircleCreated = this.userCircleRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'userCircle'),
    );
    return this.userCircleRepository.save(userCircleCreated);
  }

  /**
   * Add a UserCircle(s) if not already exist otherwise ignore.
   * @param data Data to add.
   */
  async saveUserCircles(data: DeepPartial<UserCircles>[]): Promise<{}[]> {
    const existingUserCircles = await this.getUserCircles({
      where: data.map(uc => ({ userId: uc.userId, circleId: uc.circleId })),
    });

    const dataToAdd = differenceBy(
      data,
      existingUserCircles,
      val => `${val.userId}-${val.circleId}`,
    );

    if (get(dataToAdd, 'length')) {
      const userCircleCreated = this.userCircleRepository.create(
        UtilsService.replaceJoinColumnsForQueries(
          dataToAdd,
          'userCircle',
        ) as DeepPartial<UserCircles>[],
      );
      return this.userCircleRepository.save(userCircleCreated);
    }

    return [];
  }

  /**
   * Update userCircle
   */
  async updateUserCircle(options: {}, data: {}): Promise<{}> {
    return this.userCircleRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'userCircle'),
      UtilsService.replaceJoinColumnsForQueries(data, 'userCircle'),
    );
  }

  /**
   * Permanently delete user circles.
   * @param options Options to search user circles on.
   */
  async deleteUserCircle(options: FindConditions<UserCircles>): Promise<{}> {
    return this.userCircleRepository.delete(options);
  }

  async getCommunityUserCircles(options: {
    communityId: number;
    userIds?: number[];
    isCircleDeleted?: boolean;
  }): Promise<{}[]> {
    const query = this.userCircleRepository
      .createQueryBuilder('userCircles')
      .innerJoinAndSelect(
        'userCircles.circle',
        'circle',
        `circle.community = :communityId ${
          options.hasOwnProperty('isCircleDeleted')
            ? 'AND circle.isDeleted = :isDeleted'
            : ''
        }`,
        {
          communityId: options.communityId,
          ...(options.hasOwnProperty('isCircleDeleted') && {
            isDeleted: options.isCircleDeleted,
          }),
        },
      );

    if (get(options, 'userIds.length')) {
      query.where('userCircles.userId IN (:...userId)', {
        userId: options.userIds,
      });
    }

    return query.getMany();
  }

  /**
   * Get users counts for the given circles.
   * @param options Options to search circles on.
   */
  async getCircleUsersCount(options: {
    circleIds: number[];
    communityId: number;
    isUserDeleted?: boolean;
  }): Promise<{ circleId: number; count: number }[]> {
    const query = this.userCircleRepository
      .createQueryBuilder('userCircles')
      .select([
        'userCircles.circleId AS circle_id',
        'COUNT(DISTINCT userCircles.userId) AS count',
      ])
      .innerJoin('userCircles.user', 'user')
      .innerJoin('user.userCommunities', 'userCommunity')
      .where('userCircles.circleId IN (:...circleIds)', {
        circleIds: options.circleIds,
      })
      .andWhere('userCommunity.communityId = :communityId', {
        communityId: options.communityId,
      })
      .groupBy('userCircles.circleId');

    if (options.hasOwnProperty('isUserDeleted')) {
      query.andWhere('userCommunity.isDeleted = :isUserDeleted', {
        isUserDeleted: options.isUserDeleted,
      });
    }

    const rawResult = await query.getRawMany();

    // Mapping & parsing keys from raw results.
    return rawResult.map(res => ({
      circleId: res['circle_id'],
      count: parseInt(res['count']),
    }));
  }

  /**
   * Fetch a groups' users.
   * @param options Options to search users on.
   */
  async getCirclesUsers(options: {
    circleIds: number[];
    communityId: number;
    isUserDeleted?: boolean;
  }): Promise<UserEntity[]> {
    const query = this.userCircleRepository
      .createQueryBuilder('userCircle')
      .innerJoinAndSelect('userCircle.user', 'user')
      .innerJoin('userCircle.circle', 'circle')
      .innerJoin('user.userCommunities', 'userCommunity')
      .where('userCircle.circleId IN (:...circleIds)', {
        circleIds: options.circleIds,
      })
      .andWhere('circle.community = :communityId')
      .andWhere('userCommunity.communityId = :communityId')
      .setParameter('communityId', options.communityId);

    if (options.hasOwnProperty('isUserDeleted')) {
      query.andWhere('userCommunity.isDeleted = :isUserDeleted', {
        isUserDeleted: options.isUserDeleted,
      });
    }

    const result = await query.getMany();

    return result.map(res => res.user);
  }
}
