import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  TABLES,
  ACTION_ENTITY_MAPPING,
} from '../../common/constants/constants';
import * as _ from 'lodash';
@Injectable()
export class CommunityActionPoints {
  static async addCommunityActionPoints(params: {
    community: number;
  }): Promise<void> {
    const data = await getConnection()
      .createQueryBuilder()
      .select(`commAcpoints`)
      .from(`${TABLES.COMMUNITY_ACTION_POINT}`, 'commAcpoints')
      .where(`commAcpoints.community = :community`, {
        community: params.community,
      })
      .getMany();
    if (!data.length) {
      const actions = _.uniq(_.map(ACTION_ENTITY_MAPPING, 'action'));
      const entities = _.uniq(_.map(ACTION_ENTITY_MAPPING, 'entity'));
      const actionData = await getConnection()
        .createQueryBuilder()
        .select(`actiontypes`)
        .from(`${TABLES.ACTION_TYPE}`, 'actiontypes')
        .where('actiontypes.abbreviation IN (:...actions)', {
          actions: actions,
        })
        .getMany();
      const entityData = await getConnection()
        .createQueryBuilder()
        .select(`entitytypes`)
        .from(`${TABLES.ENTITY_TYPE}`, 'entitytypes')
        .where('entitytypes.abbreviation IN (:...entities)', {
          entities: entities,
        })
        .getMany();
      const finalActionData = _.groupBy(actionData, 'abbreviation');
      const finalEntityData = _.groupBy(entityData, 'abbreviation');

      const dataToAdd = [];
      for (const iterator of ACTION_ENTITY_MAPPING) {
        dataToAdd.push({
          actionType: finalActionData[iterator.action][0]['id'],
          community: params.community,
          experiencePoint: iterator.points,
          entityType: finalEntityData[iterator.entity][0]['id'],
        });
      }
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(TABLES.COMMUNITY_ACTION_POINT)
        .values(dataToAdd)
        .execute();
    }
  }
  static async addUserPoints(params: {
    actionType: string;
    entityTypeId?: number;
    entityTypeName?: string;
    community: number;
    userId: number;
    entityType?: number;
    entityObjectId: number;
    actionEntityObjectId?: number;
    actionEntityType?: number;
  }) {
    const actionData = await getConnection()
      .createQueryBuilder()
      .select(`actiontypes`)
      .from(`${TABLES.ACTION_TYPE}`, 'actiontypes')
      .where('actiontypes.abbreviation = :action', {
        action: params.actionType,
      })
      .getOne();
    const entityData = await getConnection()
      .createQueryBuilder()
      .select(`entityType`)
      .from(`${TABLES.ENTITY_TYPE}`, 'entityType')

      .where(params.entityTypeId ? `entityType.id = :id` : '1=1', {
        id: params.entityTypeId,
      })
      .andWhere(
        params.entityTypeName
          ? `entityType.abbreviation = :abbreviation`
          : '1=1',
        {
          abbreviation: params.entityTypeName,
        },
      )

      .getOne();
    const communityActionPoint = await getConnection()
      .createQueryBuilder()
      .select(`commAcpoints`)
      .from(`${TABLES.COMMUNITY_ACTION_POINT}`, 'commAcpoints')
      .where(`commAcpoints.community = :community`, {
        community: params.community,
      })
      .andWhere(`commAcpoints.actionType = :actionType`, {
        actionType: actionData['id'],
      })
      .andWhere(`commAcpoints.entityType = :entityType`, {
        entityType: entityData['id'],
      })
      .getOne();
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(TABLES.USER_ACTION_POINT)
      .values({
        user: params.userId,
        actionType: actionData['id'],
        community: params.community,
        experiencePoint: communityActionPoint['experiencePoint'],
        entityType: params.entityType ? params.entityType : entityData['id'],
        entityObjectId: params.entityObjectId,
        actionEntityObjectId: params.actionEntityObjectId,
        actionEntityType: params.actionEntityType,
      })
      .execute();
    return communityActionPoint['experiencePoint'];
  }
}
