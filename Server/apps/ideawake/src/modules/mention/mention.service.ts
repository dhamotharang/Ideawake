import { Injectable } from '@nestjs/common';
import { MentionRepository } from './mention.repository';
import { MentionEntity } from './mention.entity';
import {
  groupBy,
  differenceBy,
  findIndex,
  uniq,
  flatten,
  map,
  head,
  get,
} from 'lodash';
import { MentionObjectTypeEnum } from '../../enum/mention-object-type.enum';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { getConnection, In } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ACTION_TYPES } from '../../common/constants/constants';
import { CircleService } from '../circle/circle.service';
import { UserService } from '../user/user.service';
import { CircleEntity } from '../circle/circle.entity';
import { CommunityWisePermissionEntity } from '../communityWisePermission/communityWisePermission.entity';
import { CommunityService } from '../community/community.service';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { ChallengeEntity } from '../challenge/challenge.entity';
import { ParticipantTypeEnum } from '../../enum/participant-type.enum';

@Injectable()
export class MentionService {
  constructor(
    public readonly mentionRepository: MentionRepository,
    public readonly circleService: CircleService,
    public readonly userService: UserService,
    public readonly communityService: CommunityService,
  ) {}

  /**
   * Get mentions
   */
  async getMentionableData(params: {
    community: number;
    opportunityId?: number;
    opportunity?: OpportunityEntity;
    challengeId?: number;
    challenge?: ChallengeEntity;
    permissions: CommunityWisePermissionEntity;
    userId: number;
  }): Promise<{ users: UserEntity[]; groups: CircleEntity[] }> {
    let users = [];
    let groups = [];

    // Getting all community users.
    const communityData = await this.communityService.getCommunityUsers({
      communityId: params.community,
      isDeleted: false,
    });
    const communityUsers: UserEntity[] = map(
      head(map(communityData, 'communityUsers')),
      'user',
    ).filter(user => user.id !== params.userId);

    // Getting all community groups.
    const communityGroups = await this.circleService.getCircles({
      where: { community: params.community, isDeleted: false },
    });

    if (params.challenge) {
      if (
        params.permissions.mentionAllUsersInChallenge ||
        (params.permissions.mentionChallengeUsers &&
          !get(params.challenge.challengeParticipant, 'length'))
      ) {
        // All community users if all users allowed to mention or all members
        // selected in challenge participants if challenge users allowed to mention.
        users = communityUsers;
      } else if (params.permissions.mentionChallengeUsers) {
        // Challenge users only.
        const challengeParticipantUsers = params.challenge.challengeParticipant
          .filter(participant => participant.type === ParticipantTypeEnum.USER)
          .map(participant => participant.participantId);
        const uniqChallengeUsers = uniq(
          challengeParticipantUsers
            .concat(params.challenge.sponsors)
            .concat(params.challenge.moderators),
        );

        users = communityUsers.filter(user =>
          uniqChallengeUsers.includes(user.id),
        );
      }

      if (
        params.permissions.mentionAllGroupsInChallenge ||
        (params.permissions.mentionChallengeGroups &&
          !get(params.challenge.challengeParticipant, 'length'))
      ) {
        // All community groups if all groups allowed to mention or all members
        // selected in challenge participants if challenge groups allowed to mention.
        groups = communityGroups;
      } else if (params.permissions.mentionChallengeGroups) {
        // challenge groups only.
        const challengeGroups = params.challenge.challengeParticipant
          .filter(participant => participant.type === ParticipantTypeEnum.GROUP)
          .map(participant => participant.participantId);
        groups = communityGroups.filter(group =>
          challengeGroups.includes(group.id),
        );
      }
    } else {
      if (params.permissions.mentionUsers) {
        // All community users.
        users = communityUsers;
      }

      if (params.permissions.mentionGroups) {
        // All community groups.
        groups = communityGroups;
      }
    }

    return {
      users,
      groups,
    };
  }

  /**
   * Get mentions
   */
  async getMentions(options: {}): Promise<MentionEntity[]> {
    return this.mentionRepository.find(options);
  }

  /**
   * Get mentions
   */
  async getOneMention(options: {}): Promise<MentionEntity> {
    return this.mentionRepository.findOne(options);
  }

  /**
   * Add mention
   */
  async addMention(data: {}): Promise<MentionEntity> {
    const duplicateMention = await this.getOneMention({
      where: data,
      relations: ['entityType', 'community'],
    });
    let response;
    if (duplicateMention) {
      response = {
        ...duplicateMention,
        entityType: duplicateMention.entityType.id,
        community: duplicateMention.community.id,
      };
    } else {
      const mentionCreated = this.mentionRepository.create(data);
      response = await this.mentionRepository.save(mentionCreated);
    }
    return response;
  }

  /**
   * Bulk Add mention
   */
  async bulkAddMentions(data: {}[]): Promise<MentionEntity[]> {
    const uniqueMentions = data.filter(
      (value, index) =>
        findIndex(
          data,
          m =>
            m['mentionedObjectId'] === value['mentionedObjectId'] &&
            m['mentionedObjectType'] === value['mentionedObjectType'],
        ) === index,
    );

    const mentionPromises = uniqueMentions.map(mention =>
      this.addMention(mention),
    );

    const savedMentions = await Promise.all(mentionPromises);

    return data.map(mention =>
      savedMentions.find(
        m =>
          m.mentionedObjectId === mention['mentionedObjectId'] &&
          m.mentionedObjectType === mention['mentionedObjectType'],
      ),
    );
  }

  /**
   * Update mention
   */
  async updateMention(options: {}, data: {}): Promise<{}> {
    return this.mentionRepository.update(options, data);
  }

  /**
   * Find the difference between current and old mentions.
   * @param currMentions Current Mentions to find difference from.
   * @param oldMentions Older Mentions to take out from current ones.
   * @returns The new array of filtered values.
   */
  public diffMentions(
    currMentions: MentionEntity[],
    oldMentions: MentionEntity[],
  ): MentionEntity[] {
    const currMentionsGrouped = groupBy(currMentions, 'mentionedObjectType');
    const oldMentionsGrouped = groupBy(oldMentions, 'mentionedObjectType');
    let newMentions = [];
    for (const key of Object.values(MentionObjectTypeEnum)) {
      newMentions = newMentions.concat(
        differenceBy(
          currMentionsGrouped[key] || [],
          oldMentionsGrouped[key] || [],
          'mentionedObjectId',
        ),
      );
    }
    return newMentions;
  }

  /**
   * Archive mention
   */
  async archiveMention(options: {}): Promise<{}> {
    return this.updateMention(options, { isDeleted: true });
  }

  /**
   * Delete mention
   */
  async removeMention(options: {}): Promise<{}> {
    return this.mentionRepository.delete(options);
  }

  /**
   * Generate mention notifications.
   * @param params Data to generate notifications for.
   * @returns Array of promises of generated notifications.
   */
  async generateNotifications(params: {
    actionData: {};
    actorData: {};
    mentions: {}[];
    mentionType: string;
    mentionEntity: {};
  }): Promise<Promise<void>[]> {
    const objectIdsGrouped = groupBy(params.mentions, 'mentionedObjectType');
    map(objectIdsGrouped, (value, key) => {
      objectIdsGrouped[key] = uniq(value.map(m => m['mentionedObjectId']));
    });

    let mentionedUserData = [];

    if (
      objectIdsGrouped[MentionObjectTypeEnum.USER] &&
      objectIdsGrouped[MentionObjectTypeEnum.USER].length
    ) {
      mentionedUserData = mentionedUserData.concat(
        (await getConnection()
          .createQueryBuilder()
          .select(`user`)
          .from(UserEntity, 'user')
          .where('user.id IN (:...ids)', {
            ids: objectIdsGrouped[MentionObjectTypeEnum.USER],
          })
          .getMany()).map(user => ({
          type: MentionObjectTypeEnum.USER,
          user,
          mentionedObject: user,
        })),
      );
    }

    // Get Group users for group mentions.
    if (
      objectIdsGrouped[MentionObjectTypeEnum.GROUP] &&
      objectIdsGrouped[MentionObjectTypeEnum.GROUP].length
    ) {
      const groups = await this.circleService.getCircles({
        where: { id: In(objectIdsGrouped[MentionObjectTypeEnum.GROUP]) },
        relations: ['circleUsers', 'circleUsers.user'],
      });
      mentionedUserData = mentionedUserData.concat(
        flatten(
          groups.map(group =>
            group.circleUsers.map(cu => ({
              type: MentionObjectTypeEnum.GROUP,
              user: cu.user,
              mentionedObject: group,
            })),
          ),
        ),
      );
    }

    if (mentionedUserData.length) {
      return mentionedUserData.map(mention =>
        NotificationHookService.notificationHook({
          actionData: {
            ...params.actionData,
            user: mention.user,
          },
          actorData: params.actorData,
          actionType: ACTION_TYPES.MENTION,
          isActivity: false,
          isNotification: true,
          invertUser: true,
          entityOperendObject: {
            type: params.mentionType,
            entity: params.mentionEntity,
            mentionedObjectType: mention.type,
            mentionedObject: mention.mentionedObject,
          },
        }),
      );
    }
  }
}
