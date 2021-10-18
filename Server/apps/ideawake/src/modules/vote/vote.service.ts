import { Injectable } from '@nestjs/common';
import { VoteRepository } from './vote.repository';
import { VoteEntity } from './vote.entity';
import {
  TABLES,
  ACTION_TYPES,
  ENTITY_TYPES,
  ENVIRONMENTS,
  EMAIL_BOOKMARKS,
  //   ENTITY_TYPES,
} from '../../common/constants/constants';
import { NotificationHookService } from './../../shared/services/notificationHook';
import { CommunityActionPoints } from '../../shared/services/communityActionPoint.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { CommentService } from '../comment/comment.service';
import { ConfigService } from '../../shared/services/config.service';
import { UserActionPointService } from '../userActionPoint/userActionPoint.service';
import { ActionTypeService } from '../actionType/actionType.service';
import { get } from 'lodash';

@Injectable()
export class VoteService {
  private configService = new ConfigService();
  constructor(
    public readonly voteRepository: VoteRepository,
    public readonly commentService: CommentService,
    public readonly userActionPointService: UserActionPointService,
    public readonly actionTypeService: ActionTypeService,
  ) {}

  async getVoteCounts(
    userId: string,
    entityTypeId?,
    entityObjectIds?,
    community?,
  ): Promise<{}> {
    return this.voteRepository
      .createQueryBuilder(TABLES.VOTE)
      .select([
        `${TABLES.VOTE}.entityType`,
        `count(${TABLES.VOTE}.entityType)`,
        `array_agg(${TABLES.VOTE}.entityObjectId) as ids`,
      ])
      .where(`${TABLES.VOTE}.user = :userId`, {
        userId: userId,
      })
      .andWhere(community ? `${TABLES.VOTE}.community = :community` : `1=1`, {
        community: community,
      })
      .andWhere(
        entityTypeId ? `${TABLES.VOTE}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.VOTE}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`${TABLES.VOTE}.entityType`)
      .getRawMany();
  }

  /**
   * Get votes counts by the given object ids.
   * @param options Options to search votes on.
   * @returns Votes counts.
   */
  async getVoteCountsByObjIds(options: {
    entityTypeId: number;
    entityObjectIds: number[];
    communityId: number;
  }): Promise<{ entityObjectId: number; count: number }[]> {
    const countsResp = await this.voteRepository
      .createQueryBuilder('vote')
      .select([
        `vote.entityObjectId as entity_object_id`,
        `count(vote.entityObjectId) as count`,
      ])
      .where(`vote.community = :community`, {
        community: options.communityId,
      })
      .andWhere(`vote.entityType = :entityTypeId`, {
        entityTypeId: options.entityTypeId,
      })
      .andWhere(`vote.entityObjectId IN (:...entityObjectIds)`, {
        entityObjectIds: options.entityObjectIds,
      })
      .groupBy(`vote.entityObjectId`)
      .getRawMany();

    return countsResp.map(resp => ({
      entityObjectId: parseInt(resp.entity_object_id),
      count: parseInt(resp.count),
    }));
  }

  async getVoteCountsByDate(entityTypeId?, entityObjectIds?): Promise<any[]> {
    return this.voteRepository
      .createQueryBuilder(TABLES.VOTE)
      .select([
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT CAST(${TABLES.VOTE}.createdAt AS DATE)), ',') AS date`,
        `count(${TABLES.VOTE}.id)::INTEGER`,
        // `ARRAY_AGG(${TABLES.VOTE}.entityObjectId) as ids`,
      ])
      .andWhere(
        entityTypeId ? `${TABLES.VOTE}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.VOTE}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`CAST(${TABLES.VOTE}.createdAt AS DATE)`)
      .getRawMany();
  }
  /**
   * Get All Filtered Votes Rgardless of User
   * @param {object} options
   */
  async getAllVote(options: {}): Promise<VoteEntity[]> {
    return this.voteRepository.find(options);
  }

  /**
   * Get Vote against User
   */
  async getVoteCount(options: {}): Promise<number> {
    return this.voteRepository.count(options);
  }
  /**
   * Get Vote against User
   */
  async getVote(options: {}): Promise<VoteEntity[]> {
    return this.voteRepository.find(options);
  }

  /**
   * Get Type specific Votes against a user under community
   */
  async getTypeVote(options: {
    abbreviation: string;
    entityObjectId: string;
    user: string;
    community: string;
  }): Promise<{}> {
    return this.voteRepository
      .createQueryBuilder(TABLES.VOTE)
      .innerJoinAndSelect('vote.entityType', 'entityType')
      .where('entityType.abbreviation = :abbreviation', {
        abbreviation: options.abbreviation,
      })
      .andWhere('vote.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .andWhere('vote.user = :user', {
        user: options.user,
      })
      .andWhere('vote.community = :community', {
        community: options.community,
      })
      .getOne();
  }

  /**
   * Get user's votes on multiple objects of an entity.
   * @param options Options to search votes on.
   * @returns User's votes on the given objects.
   */
  async getUserVotesInBulk(options: {
    entityTypeAbbr: string;
    entityObjectIds: number[];
    user: string;
    community: string;
  }): Promise<VoteEntity[]> {
    if (!get(options.entityObjectIds, 'length')) return [];

    return this.voteRepository
      .createQueryBuilder('vote')
      .innerJoin('vote.entityType', 'entityType')
      .where('entityType.abbreviation = :abbreviation', {
        abbreviation: options.entityTypeAbbr,
      })
      .andWhere('vote.entityObjectId IN (:...entityObjectIds)', {
        entityObjectIds: options.entityObjectIds,
      })
      .andWhere('vote.user = :user', {
        user: options.user,
      })
      .andWhere('vote.community = :community', {
        community: options.community,
      })
      .getMany();
  }

  /**
   * Add Vote
   */
  async addVote(data: {}, actorData): Promise<VoteEntity> {
    const VoteCreated = this.voteRepository.create(data);
    const voteAddResponse = await this.voteRepository.save(VoteCreated);
    const addedVoteData = await this.voteRepository.findOne({
      where: { id: voteAddResponse.id },
      relations: ['entityType', 'community'],
    });
    let points;
    if (
      addedVoteData.entityType.abbreviation === ENTITY_TYPES.IDEA ||
      addedVoteData.entityType.abbreviation === ENTITY_TYPES.COMMENT
    ) {
      const actionEntityTypeIdVote = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.VOTE,
      )).id;

      points = await CommunityActionPoints.addUserPoints({
        actionType: ACTION_TYPES.UPVOTE,
        entityTypeId: addedVoteData.entityType.id,
        community: addedVoteData.community.id,
        userId: actorData.id,
        entityType: addedVoteData.entityType.id,
        entityObjectId: parseInt(addedVoteData.entityObjectId),
        actionEntityObjectId: addedVoteData.id,
        actionEntityType: actionEntityTypeIdVote,
      });

      let entityTypeId;
      let entityObjectId;
      let entity;

      if (addedVoteData.entityType.abbreviation === ENTITY_TYPES.COMMENT) {
        entity = await this.commentService.getComment({
          where: { id: addedVoteData.entityObjectId },
        });
        entityTypeId = entity.entityTypeId;
        entityObjectId = entity.entityObjectId;
      } else {
        entityTypeId = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.IDEA,
        )).id;
        entityObjectId = addedVoteData.entityObjectId;
      }

      NotificationHookService.notificationHook({
        actionData: {
          ...voteAddResponse,
          entityType: entityTypeId,
          ...(entityObjectId && { entityObjectId }),
        },
        actorData: actorData,
        actionType: ACTION_TYPES.UPVOTE,
        isEmail: addedVoteData.entityType.abbreviation === ENTITY_TYPES.IDEA,
        entityOperendObject: {
          type: addedVoteData.entityType.abbreviation,
          entityObjectId: addedVoteData.entityObjectId,
          ...(entity && { entity }),
          ...(addedVoteData.entityType.abbreviation === ENTITY_TYPES.IDEA && {
            ...this.generateOpportunityRedirectLink(
              addedVoteData,
              entityObjectId,
            ),
          }),
        },
      });
    }

    voteAddResponse['points'] = {
      value: points,
      type: ACTION_TYPES.UPVOTE,
    };
    return voteAddResponse;
  }

  async addSimpleVotes(data: {}[]): Promise<VoteEntity[]> {
    const votesCreated = this.voteRepository.create(data);
    return this.voteRepository.save(votesCreated);
  }

  /**
   * Update Vote
   */
  async updateVote(options: {}, data: {}): Promise<{}> {
    return this.voteRepository.update(options, data);
  }

  /**
   * Delete Vote
   */
  async deleteVote(options): Promise<{}> {
    const voteData = await this.voteRepository.findOne({
      where: { id: options.id },
      relations: ['user'],
    });

    const actionType = await this.actionTypeService.getActionType({
      abbreviation: ACTION_TYPES.UPVOTE,
    });

    await this.userActionPointService.deleteUserActionPoint({
      actionType: actionType['id'],
      community: voteData.communityId,
      userId: voteData.user.id,
      entityType: voteData.entityTypeId,
      entityObjectId: parseInt(voteData.entityObjectId),
    });

    return this.voteRepository.delete(options);
  }

  /**
   * Get Type specific Votes against a user under community
   */
  async getTypeVoteCount(entityObjectIds, abbreviation): Promise<{}> {
    return this.voteRepository
      .createQueryBuilder(TABLES.VOTE)
      .innerJoinAndSelect('vote.entityType', 'entityType')
      .leftJoinAndSelect('vote.user', 'user')
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .where('vote.entityObjectId IN (:...entityObjectIds)', {
        entityObjectIds: entityObjectIds,
      })
      .andWhere('entityType.abbreviation = :abbreviation', {
        abbreviation: abbreviation,
      })
      .orderBy('vote.createdAt')
      .getMany();
  }

  generateOpportunityRedirectLink(
    vote: VoteEntity,
    entityObjectId: number,
  ): { redirectLink: string; redirectBtnText: string } {
    const port =
      this.configService.getEnv() === ENVIRONMENTS.DEVELOP
        ? `:${this.configService.getNumber('CLIENT_PORT')}`
        : '';

    return {
      redirectLink: `${vote.community.url}${port}/idea/view/${entityObjectId}`,
      redirectBtnText: `View ${EMAIL_BOOKMARKS.POST_TYPE}`,
    };
  }
}
