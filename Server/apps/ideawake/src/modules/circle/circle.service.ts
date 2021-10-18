import { Injectable } from '@nestjs/common';
import { CircleRepository } from './circle.repository';
import { CircleEntity } from './circle.entity';
import { Brackets } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { compact, flatten, get } from 'lodash';

@Injectable()
export class CircleService {
  constructor(public readonly circleRepository: CircleRepository) {}

  /**
   * Get
   */
  async getCircles(options: {}): Promise<CircleEntity[]> {
    return this.circleRepository.find(options);
  }
  /**
   * GetCount
   */
  async getCount(options: {}): Promise<number> {
    return this.circleRepository.count(options);
  }

  /**
   * Get child circles counts for the given circles.
   * @param options Options to search circles on.
   */
  async getChildCirclesCount(options: {
    circleIds: number[];
  }): Promise<{ circleId: number; count: number }[]> {
    const rawResult = await this.circleRepository
      .createQueryBuilder('circle')
      .select([
        'circle.parentCircleId AS circle_id',
        'COUNT(DISTINCT(circle.id)) AS count',
      ])
      .where('circle.parentCircleId IN (:...circleIds)', {
        circleIds: options.circleIds,
      })
      .groupBy('circle.parentCircleId')
      .getRawMany();

    // Mapping & parsing keys from raw results.
    return rawResult.map(res => ({
      circleId: res['circle_id'],
      count: parseInt(res['count']),
    }));
  }

  /**
   * Get
   */
  async searchCircles(options: {
    communityId: number;
    searchText?: string;
    isDeleted?: boolean;
    take?: number;
    skip?: number;
    sortBy?: string;
    sortType?: 'ASC' | 'DESC';
    circleIds?: number[];
    excludedIds?: number[];
  }): Promise<[CircleEntity[], number]> {
    const query = this.circleRepository
      .createQueryBuilder('circle')
      .innerJoin('circle.community', 'community')
      .where('community.id = :communityId', {
        communityId: options.communityId,
      });

    if (options.hasOwnProperty('isDeleted')) {
      query.andWhere('circle.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }

    if (options.searchText) {
      query
        .andWhere(
          new Brackets(qb => {
            qb.orWhere('circle.name ILIKE :searchText');
            qb.orWhere('circle.displayName ILIKE :searchText');
          }),
        )
        .setParameter('searchText', `%${options.searchText}%`);
    }

    if (get(options, 'circleIds.length')) {
      query.andWhere('circle.id IN (:...circleIds)', {
        circleIds: options.circleIds,
      });
    }
    if (get(options, 'excludedIds.length')) {
      query.andWhere('circle.id NOT IN (:...excludedIds)', {
        excludedIds: options.excludedIds,
      });
    }

    if (options.sortBy && options.sortType) {
      query.orderBy(`circle.${options.sortBy}`, options.sortType);
    } else {
      // Default sort by full name in ASC order.
      query.orderBy('circle.name', 'ASC');
    }

    if (options.take) {
      query.take(options.take).skip(options.skip || 0);
    }

    return query.getManyAndCount();
  }
  /**
   * Get
   */
  async getCircleCount(
    isDeleted: boolean,
    communityId: string,
  ): Promise<number> {
    return this.circleRepository
      .createQueryBuilder('circle')
      .where('circle.community = :communityId', {
        communityId: communityId,
      })
      .andWhere('circle.isDeleted = :isDeleted', {
        isDeleted,
      })
      .getCount();
  }

  async getCircleUsers(options: {}): Promise<UserEntity[]> {
    const groups = await this.getCircles({
      ...options,
      relations: [
        'circleUsers',
        'circleUsers.user',
        'circleUsers.user.profileImage',
      ],
    });

    return compact(
      flatten(groups.map(group => group.circleUsers.map(cu => cu.user))),
    );
  }

  /**
   * Add
   */
  async addCircle(data: {}): Promise<CircleEntity> {
    const themeCreated = this.circleRepository.create(data);
    return this.circleRepository.save(themeCreated);
  }

  /**
   * Update
   */
  async updateCircle(options: {}, data: {}): Promise<{}> {
    return this.circleRepository.update(options, data);
  }

  /**
   * Delete
   */
  async deleteCircle(options: {}): Promise<{}> {
    return this.circleRepository.delete(options);
  }
}
