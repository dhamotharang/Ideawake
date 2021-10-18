import { Injectable } from '@nestjs/common';
import { ShareRepository } from './share.repository';
import { ShareEntity } from './share.entity';
import { TABLES, ACTION_TYPES } from '../../common/constants/constants';
import { NotificationHookService } from '../../shared/services/notificationHook';
import * as _ from 'lodash';
import { In } from 'typeorm';
@Injectable()
export class ShareService {
  constructor(public readonly ShareRepository: ShareRepository) {}

  async getShareCounts(
    userId: string,
    entityTypeId?,
    entityObjectIds?,
  ): Promise<{}> {
    return this.ShareRepository.createQueryBuilder(TABLES.SHARE)
      .select([
        `${TABLES.SHARE}.entityType`,
        `count(${TABLES.SHARE}.entityType)`,
        `array_agg(${TABLES.SHARE}.entityObjectId) as ids`,
      ])
      .where(`${TABLES.SHARE}.user = :userId`, {
        userId: userId,
      })
      .andWhere(
        entityTypeId ? `${TABLES.SHARE}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.SHARE}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`${TABLES.SHARE}.entityType`)
      .getRawMany();
  }

  async getShareCountsByDate(entityTypeId?, entityObjectIds?): Promise<any[]> {
    return this.ShareRepository.createQueryBuilder(TABLES.SHARE)
      .select([
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT CAST(${TABLES.SHARE}.createdAt AS DATE)), ',') AS date`,
        `count(${TABLES.SHARE}.id)::INTEGER`,
        // `ARRAY_AGG(${TABLES.SHARE}.entityObjectId) as ids`,
      ])
      .andWhere(
        entityTypeId ? `${TABLES.SHARE}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.SHARE}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`CAST(${TABLES.SHARE}.createdAt AS DATE)`)
      .getRawMany();
  }
  /**
   * Get All Filtered Shares Rgardless of User
   * @param {object} options
   */
  async getAllShare(options: {}): Promise<ShareEntity[]> {
    return this.ShareRepository.find(options);
  }

  /**
   * Get Share against User
   */
  async getShare(options: {}): Promise<ShareEntity[]> {
    return this.ShareRepository.find(options);
  }
  /**
   * Get Share against User
   */
  async getShareCount(options: {}): Promise<number> {
    return this.ShareRepository.count(options);
  }

  /**
   * Get Type specific Shares against a user under community
   */
  async getTypeShare(options: {
    abbreviation: string;
    entityObjectId: string;
    sharedWith: string;
    community: string;
  }): Promise<{}> {
    return this.ShareRepository.createQueryBuilder(TABLES.SHARE)
      .innerJoinAndSelect('share.entityType', 'entityType')
      .leftJoinAndSelect('share.sharedWith', 'sharedWith')
      .leftJoinAndSelect('share.sharedBy', 'sharedBy')
      .where('entityType.abbreviation = :abbreviation', {
        abbreviation: options.abbreviation,
      })
      .andWhere('share.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .andWhere('share.sharedWith = :sharedWith', {
        sharedWith: options.sharedWith,
      })
      .andWhere('share.community = :community', {
        community: options.community,
      })
      .getOne();
  }
  /**
   * Get Type specific Shares against a user under community
   */
  async getAllTypeShare(options: {
    abbreviation: string;
    entityObjectId: string;
    community: string;
  }): Promise<{}> {
    return this.ShareRepository.createQueryBuilder(TABLES.SHARE)
      .innerJoinAndSelect('share.entityType', 'entityType')
      .leftJoinAndSelect('share.sharedWith', 'sharedWith')
      .leftJoinAndSelect('share.sharedBy', 'sharedBy')
      .where('entityType.abbreviation = :abbreviation', {
        abbreviation: options.abbreviation,
      })
      .andWhere('share.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .andWhere('share.community = :community', {
        community: options.community,
      })
      .getMany();
  }

  /**
   * Add Share
   */
  async addShare(data: {}, actorData): Promise<ShareEntity[] | ShareEntity> {
    const ShareCreated = this.ShareRepository.create(data);
    const shareAddResponse = await this.ShareRepository.save(ShareCreated);
    const ids = [];
    _.map(shareAddResponse, val => {
      ids.push(val['id']);
    });
    const addedData = await this.ShareRepository.find({
      where: { id: In(ids) },
      relations: ['sharedWith', 'entityType'],
    });
    for (const iterator in addedData) {
      const tempObj = {
        entityType: addedData[iterator].entityType.id,
        entityObjectId: addedData[iterator].entityObjectId,
        user: addedData[iterator].sharedWith,
        message: addedData[iterator].message,
      };
      NotificationHookService.notificationHook({
        actionData: tempObj,
        actorData: actorData,
        actionType: ACTION_TYPES.SHARE,
        invertUser: true,
        entityOperendObject: {
          message: tempObj.message,
        },
      });
    }
    return shareAddResponse;
  }

  /**
   * Update Share
   */
  async updateShare(options: {}, data: {}): Promise<{}> {
    return this.ShareRepository.update(options, data);
  }

  /**
   * Delete Share
   */
  async deleteShare(options: {}): Promise<{}> {
    return this.ShareRepository.delete(options);
  }

  /**
   * Get Type specific Shares against a user under community
   */
  async getTypeShareCount(entityObjectIds, abbreviation): Promise<{}> {
    return this.ShareRepository.createQueryBuilder(TABLES.SHARE)
      .innerJoinAndSelect('share.entityType', 'entityType')
      .leftJoinAndSelect('share.user', 'user')
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .where('share.entityObjectId IN (:...entityObjectIds)', {
        entityObjectIds: entityObjectIds,
      })
      .andWhere('entityType.abbreviation = :abbreviation', {
        abbreviation: abbreviation,
      })
      .orderBy('share.createdAt')
      .getMany();
  }
}
