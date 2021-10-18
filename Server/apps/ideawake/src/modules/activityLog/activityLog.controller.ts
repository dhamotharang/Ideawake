import {
  Controller,
  Get,
  Query,
  Logger,
  Req,
  Body,
  Patch,
} from '@nestjs/common';

import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ActivityLogService } from './activityLog.service';
import { Request } from 'express';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';
import { ChallengeService } from '../challenge/challenge.service';
import { In } from 'typeorm';
import { keyBy } from 'lodash';
import { OpportunityService } from '../opportunity/opportunity.service';

@Controller('activities')
export class ActivityLogController {
  private looger = new Logger('Notification Controller');
  constructor(
    private activityLogService: ActivityLogService,
    private challengeService: ChallengeService,
    private opportunityService: OpportunityService,
  ) {}

  @Get('user')
  async getAllActivityLogs(
    @Query() _queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    this.looger.log('getAllActivityLogs query', req['userData'].id);
    const activityData = await this.activityLogService.getUserActivityLogs({
      userId: req['userData'].id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(activityData, '');
  }

  @Get('search')
  async searchAllActivityLogs(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    this.looger.log('searchAllActivityLogs query', req['userData'].id);

    // Transforming request data into processable object.
    const challengeEntityTypeId = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    )).id;
    const oppEntityTypeId = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    )).id;

    // EntityType check ensures backwards compatibility.
    if (queryParams.entityType) {
      // If multiple object ids and types given.
      if (Array.isArray(queryParams.entityObjectId)) {
        queryParams['entities'] = queryParams.entityObjectId.map(id => ({
          entityType: queryParams.entityType,
          entityObjectId: id,
        }));

        // Taking out all challenge opportunities in case of any challenge type.
        if (parseInt(queryParams.entityType) === challengeEntityTypeId) {
          const challenges = await this.challengeService.getChallenges({
            where: {
              id: In(queryParams.entityObjectId),
              community: req['userData'].currentCommunity,
            },
            relations: ['challengeOpportunities'],
          });
          const challengesGrouped = keyBy(challenges, 'id');

          queryParams.entityObjectId.forEach(id => {
            if (challengesGrouped[id]) {
              for (const opp of challengesGrouped[id].challengeOpportunities) {
                queryParams.entities.push({
                  entityType: oppEntityTypeId,
                  entityObjectId: opp.id,
                });
              }
            }
          });
        }
      } else {
        // If single object id and type given.
        queryParams['entities'] = [
          {
            entityType: queryParams.entityType,
            entityObjectId: queryParams.entityObjectId,
          },
        ];

        // Taking out all challenge opportunities in case of challenge type.
        if (parseInt(queryParams.entityType) === challengeEntityTypeId) {
          const challenge = await this.challengeService.getOneChallenge({
            where: {
              id: queryParams.entityObjectId,
              community: req['userData'].currentCommunity,
            },
            relations: ['challengeOpportunities'],
          });
          if (challenge) {
            for (const opp of challenge.challengeOpportunities) {
              queryParams['entities'].push({
                entityType: oppEntityTypeId,
                entityObjectId: opp.id,
              });
            }
          }
        }
      }
    } else if (queryParams.entityObjectId) {
      // This is done for backwards compatibility. All the requests with no type
      // given are considered as opportunity type requests.

      if (Array.isArray(queryParams.entityObjectId)) {
        queryParams.entities = queryParams.entityObjectId.map(id => ({
          entityType: oppEntityTypeId,
          entityObjectId: id,
        }));
      } else {
        queryParams.entities = [
          {
            entityType: oppEntityTypeId,
            entityObjectId: queryParams.entityObjectId,
          },
        ];
      }
    }

    // Get all community opportunities that are not visible to the user.
    const allCommunityOppoIds = (await this.opportunityService.getSimpleOpportunities(
      {
        select: ['id'],
        where: { community: req['userData'].currentCommunity },
      },
    )).map(opp => opp.id);
    if (allCommunityOppoIds.length) {
      const permissions = await this.opportunityService.getOpportunityPermissionsBulk(
        {
          opportunityIds: allCommunityOppoIds,
          userId: req['userData'].id,
          community: req['userData'].currentCommunity,
          includeVisibilitySettings: true,
          includeStageTabPermissions: false,
          includeExpSettings: false,
        },
      );
      queryParams['excludedEntities'] = permissions
        .filter(oppoPerm => !oppoPerm.permissions.viewOpportunity)
        .map(oppoPerm => ({
          entityObjectId: oppoPerm.opportunityId,
          entityType: oppEntityTypeId,
        }));
    }

    const activityData = await this.activityLogService.searchActivityLogs({
      options: {
        where: {
          entityObjectId: queryParams.entityObjectId,
          entityName: queryParams.entityName,
          community: req['userData'].currentCommunity,
          userId: queryParams.userId,
          filterBy: queryParams.filterBy,
        },
        take: queryParams.take,
        skip: queryParams.skip,
        orderBy: queryParams.orderBy,
        orderType: queryParams.orderType,
        isActivity: true,
        entities: queryParams.entities,
        ...(queryParams.excludedEntities &&
          queryParams.excludedEntities.length && {
            excludedEntities: queryParams.excludedEntities,
          }),
      },
    });
    return ResponseFormatService.responseOk(activityData, '');
  }

  @Get('search/notifications')
  async searchAllNotifications(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    this.looger.log('searchAllActivityLogs query', req['userData'].id);
    const activityData = await this.activityLogService.searchActivityLogs({
      options: {
        where: {
          entityObjectId: queryParams.entityObjectId,
          entityName: queryParams.entityName,
          community: req['userData'].currentCommunity,
          userId: req['userData'].id,
          filterBy: queryParams.filterBy,
        },
        take: queryParams.take,
        skip: queryParams.skip,
        orderBy: queryParams.orderBy,
        orderType: queryParams.orderType,
        isNotification: true,
      },
    });
    return ResponseFormatService.responseOk(activityData, '');
  }

  @Patch('notifications/read')
  async readNotifications(
    @Body() body: number[],
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const activityData = await this.activityLogService.updateReadStatus({
      id: body,
      community: req['userData'].currentCommunity,
      userId: req['userData'].id,
    });
    return ResponseFormatService.responseOk(activityData, '');
  }
}
