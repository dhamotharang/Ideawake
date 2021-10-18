import { Injectable } from '@nestjs/common';
import { UserActionPointRepository } from './userActionPoint.repository';
import { UserActionPointEntity } from './userActionPoint.entity';
import {
  TABLES,
  TIME_LIMITS,
  USER_ACTION_POINT_FUNCTION_OPTIONS,
} from '../../common/constants/constants';
import * as moment from 'moment';
import { UserService } from '../user/user.service';
import * as _ from 'lodash';
import { In } from 'typeorm';
import { CircleService } from '../circle/circle.service';
@Injectable()
export class UserActionPointService {
  constructor(
    public readonly userActionPointRepository: UserActionPointRepository,
    private readonly userSrevice: UserService,
    private readonly circleService: CircleService,
  ) {}

  async getUserActionPointsProcess(params: {
    frequency: string;
    community: number;
    groupBy?: string;
    entityObjectIds?: [];
    entityObjectType?: number;
  }) {
    let diff;
    const toDate = moment().format('YYYY-MM-DD');
    let fromDate;
    let fromDateOld;
    let toDateOld;
    switch (params.frequency) {
      case 'week':
        diff = 'week';
        fromDate = moment()
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        fromDateOld = moment(fromDate)
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        toDateOld = moment(toDate)
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        break;
      case 'month':
        diff = 'month';
        fromDate = moment()
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        fromDateOld = moment(fromDate)
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        toDateOld = moment(toDate)
          .subtract(1, diff)
          .format('YYYY-MM-DD');
        break;
      case 'open':
        diff = 'years';
        fromDate = moment()
          .subtract(100, diff)
          .format('YYYY-MM-DD');
        fromDateOld = fromDate;
        toDateOld = moment(toDate)
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    let userActionPoints;
    let userActionPointsPrevious;
    let groupActionPoints;
    let groupActionPointsPrevious;
    if (
      params.groupBy &&
      params.groupBy === USER_ACTION_POINT_FUNCTION_OPTIONS.LOCATION
    ) {
      userActionPoints = await this.getUsersActionPointsByRegion({
        community: params.community,
        fromDate: fromDate,
        toDate: toDate,
        entityObjectIds: params.entityObjectIds,
        entityObjectType: params.entityObjectType,
      });
      return userActionPoints;
    } else if (
      params.groupBy &&
      params.groupBy === USER_ACTION_POINT_FUNCTION_OPTIONS.GROUPS
    ) {
      groupActionPoints = await this.getGroupsActionPoints({
        community: params.community,
        fromDate: fromDate,
        toDate: toDate,
        entityObjectIds: params.entityObjectIds,
        entityObjectType: params.entityObjectType,
      });
      groupActionPointsPrevious = await this.getGroupsActionPoints({
        community: params.community,
        fromDate: fromDateOld,
        toDate: toDateOld,
        entityObjectIds: params.entityObjectIds,
        entityObjectType: params.entityObjectType,
      });

      const maxCurrRank = _.max(
        _.map(groupActionPoints, ap => parseInt(ap['rank'])),
      );

      _.map(groupActionPoints, val => {
        const foundIndex = _.findIndex(groupActionPointsPrevious, function(o) {
          return o['circle'] == val['circle'];
        });
        val['rank'] = parseInt(val['rank']);

        // Calculating rank changed (if no previous data present for the group
        // then consider max current rank as prev rank).
        const prevRank = parseInt(
          _.get(groupActionPointsPrevious, `${foundIndex}.rank`, maxCurrRank),
        );
        val['rankChanged'] = prevRank - parseInt(val['rank']);
      });

      const circleIds = _.map(groupActionPoints, 'circle');

      const finalData = [];
      if (circleIds.length) {
        const allCircles = await this.circleService.getCircles({
          where: { id: In(circleIds), community: params.community },
        });

        const groupByCircleDataOnId = _.keyBy(allCircles, 'id');

        _.map(groupActionPoints, val => {
          if (_.get(groupByCircleDataOnId, val['circle'])) {
            finalData.push({
              ..._.get(groupByCircleDataOnId, val['circle']),
              experiencePoint: val['experience_point'],
              rank: val['rank'],
              rankChanged: val['rankChanged'],
            });
          }
        });
      }
      return finalData;
    } else {
      userActionPoints = await this.getUsersActionPoints({
        community: params.community,
        fromDate: fromDate,
        toDate: toDate,
        entityObjectIds: params.entityObjectIds,
        entityObjectType: params.entityObjectType,
      });

      userActionPointsPrevious = await this.getUsersActionPoints({
        community: params.community,
        fromDate: fromDateOld,
        toDate: toDateOld,
        entityObjectIds: params.entityObjectIds,
        entityObjectType: params.entityObjectType,
      });

      const maxCurrRank = _.max(
        _.map(userActionPoints, ap => parseInt(ap['rank'])),
      );

      _.map(userActionPoints, val => {
        const foundIndex = _.findIndex(userActionPointsPrevious, function(o) {
          return o['user_id'] == val['user_id'];
        });
        val['rank'] = parseInt(val['rank']);

        // Calculating rank changed (if no previous data present for the user
        // then consider max current rank as prev rank).
        const prevRank = parseInt(
          _.get(userActionPointsPrevious, `${foundIndex}.rank`, maxCurrRank),
        );
        val['rankChanged'] = prevRank - parseInt(val['rank']);
      });

      const userIds = _.map(userActionPoints, 'user_id');
      const finalData = [];
      if (userIds.length) {
        const allUsers = await this.userSrevice.getUsers({
          where: { id: In(userIds) },
          relations: ['profileImage'],
        });
        const groupByUserDataOnId = _.groupBy(allUsers, 'id');

        _.map(userActionPoints, val => {
          finalData.push({
            ...groupByUserDataOnId[val['user_id']][0],
            experiencePoint: val['experience_point'],
            rank: val['rank'],
            rankChanged: val['rankChanged'],
          });
        });
      }
      return finalData;
    }
  }
  /**
   * Get userActionPoints
   */
  async getUsersActionPoints(options: {
    community: number;
    fromDate: string;
    toDate: string;
    entityObjectIds?: [];
    entityObjectType?: number;
  }): Promise<UserActionPointEntity[]> {
    return this.userActionPointRepository
      .createQueryBuilder(TABLES.USER_ACTION_POINT)
      .select([
        'sum(user_action_point.experience_point) AS experience_point',
        'user_action_point.user_id',
        'ROW_NUMBER () OVER (ORDER BY sum(user_action_point.experience_point) DESC) as rank',
      ])
      .where('user_action_point.community = :community', {
        community: options.community,
      })
      .andWhere(
        options.entityObjectType
          ? `user_action_point.entityType = :entityType`
          : '1=1',
        {
          entityType: options.entityObjectType,
        },
      )
      .andWhere(
        options.entityObjectIds
          ? `user_action_point.entityObjectId IN (:...entityObjectId)`
          : '1=1',
        {
          entityObjectId: options.entityObjectIds,
        },
      )
      .andWhere(
        options.fromDate && options.toDate
          ? `user_action_point.created_at BETWEEN '${options.fromDate} ${TIME_LIMITS.START}' AND '${options.toDate} ${TIME_LIMITS.END}'`
          : `1=1`,
      )
      .groupBy('user_action_point.user_id')
      .orderBy('experience_point', 'DESC')
      .limit(50)
      .getRawMany();
  }
  /**
   * Get userActionPoints
   */
  async getUsersActionPointsByRegion(options: {
    community: number;
    fromDate: string;
    toDate: string;
    entityObjectIds?: [];
    entityObjectType?: number;
  }): Promise<UserActionPointEntity[]> {
    return this.userActionPointRepository
      .createQueryBuilder(TABLES.USER_ACTION_POINT)
      .select([
        'sum(user_action_point.experience_point) AS points',
        'user.region AS region',
        'array_agg(user.latLng) AS coordinates',
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT user.timeZone), ',') AS timeZone`,
        'ROW_NUMBER () OVER (ORDER BY sum(user_action_point.experience_point) DESC) as rank',
      ])
      .leftJoin(`${TABLES.USER_ACTION_POINT}.user`, 'user')

      .where('user_action_point.community = :community', {
        community: options.community,
      })
      .andWhere(
        options.entityObjectType
          ? `user_action_point.entityType = :entityType`
          : '1=1',
        {
          entityType: options.entityObjectType,
        },
      )
      .andWhere(
        options.entityObjectIds
          ? `user_action_point.entityObjectId IN (:...entityObjectId)`
          : '1=1',
        {
          entityObjectId: options.entityObjectIds,
        },
      )
      .andWhere(
        options.fromDate && options.toDate
          ? `user_action_point.created_at BETWEEN '${options.fromDate} ${TIME_LIMITS.START}' AND '${options.toDate} ${TIME_LIMITS.END}'`
          : `1=1`,
      )
      .groupBy('user.region')
      .orderBy('points', 'DESC')
      .limit(50)
      .getRawMany();
  }
  /**
   * Get userActionPoints
   */
  async getGroupsActionPoints(options: {
    community: number;
    fromDate: string;
    toDate: string;
    entityObjectIds?: [];
    entityObjectType?: number;
  }): Promise<UserActionPointEntity[]> {
    return this.userActionPointRepository
      .createQueryBuilder(TABLES.USER_ACTION_POINT)
      .select([
        'sum(user_action_point.experience_point) AS experience_point',
        'userCircles.circle AS circle',
        'ROW_NUMBER () OVER (ORDER BY sum(user_action_point.experience_point) DESC) as rank',
      ])
      .leftJoin(`${TABLES.USER_ACTION_POINT}.user`, 'user')
      .innerJoin(`user.userCircles`, 'userCircles')
      .where('user_action_point.community = :community', {
        community: options.community,
      })
      .andWhere(
        options.entityObjectType
          ? `user_action_point.entityType = :entityType`
          : '1=1',
        {
          entityType: options.entityObjectType,
        },
      )
      .andWhere(
        options.entityObjectIds
          ? `user_action_point.entityObjectId IN (:...entityObjectId)`
          : '1=1',
        {
          entityObjectId: options.entityObjectIds,
        },
      )
      .andWhere(
        options.fromDate && options.toDate
          ? `user_action_point.created_at BETWEEN '${options.fromDate} ${TIME_LIMITS.START}' AND '${options.toDate} ${TIME_LIMITS.END}'`
          : `1=1`,
      )
      .groupBy('userCircles.circle')
      .orderBy('experience_point', 'DESC')
      .limit(50)
      .getRawMany();
  }

  /**
   * Get userActionPoints
   */
  async getUserActionPoints(options: {}): Promise<UserActionPointEntity[]> {
    return this.userActionPointRepository.find(options);
  }

  /**
   * Add userActionPoint
   */
  async addUserActionPoint(data: {}): Promise<UserActionPointEntity> {
    const userActionPointCreated = this.userActionPointRepository.create(data);
    return this.userActionPointRepository.save(userActionPointCreated);
  }

  /**
   * Update userActionPoint
   */
  async updateUserActionPoint(options: {}, data: {}): Promise<{}> {
    return this.userActionPointRepository.update(options, data);
  }

  /**
   * Delete userActionPoint
   */
  async deleteUserActionPoint(options: {}): Promise<{}> {
    return this.userActionPointRepository.delete(options);
  }
}
