import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentEntity } from './comment.entity';
import { has } from 'lodash';
import {
  ACTION_TYPES,
  ENTITY_TYPES,
  TABLES,
  MENTION_TYPES,
  ENVIRONMENTS,
  EMAIL_BOOKMARKS,
} from '../../common/constants/constants';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { CommunityActionPoints } from '../../shared/services/communityActionPoint.service';
import { In } from 'typeorm';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { MentionService } from '../mention/mention.service';
import { ConfigService } from '../../shared/services/config.service';
import { get } from 'lodash';
import { CommentThreadService } from '../commentThread/commentThread.service';
import { CommentThreadParticipantService } from '../commentThreadParticipant/commentThreadParticipant.service';
import { CommentAttachmentService } from '../commentAttachment/commentAttachment.service';
import { UserEntity } from '../user/user.entity';
import { UserActionPointService } from '../userActionPoint/userActionPoint.service';
import { ActionTypeService } from '../actionType/actionType.service';

@Injectable()
export class CommentService {
  private configService = new ConfigService();

  constructor(
    public readonly commentRepository: CommentRepository,
    public readonly mentionService: MentionService,
    public readonly commentThreadService: CommentThreadService,
    public readonly commentThreadParticipantService: CommentThreadParticipantService,
    public readonly commentAttachmentService: CommentAttachmentService,
    public readonly userActionPointService: UserActionPointService,
    public readonly actionTypeService: ActionTypeService,
  ) {}

  /**
   * Get comments
   */
  async getCommentCount(options: {}): Promise<number> {
    return this.commentRepository.count(options);
  }
  /**
   * Get comments
   */
  async getComments(options: {}): Promise<CommentEntity[]> {
    return this.commentRepository.find(options);
  }

  /**
   * Get single comment.
   */
  async getComment(options: {}): Promise<CommentEntity> {
    return this.commentRepository.findOne(options);
  }

  /**
   * Get comments counts by the given object ids.
   * @param options Options to search comments on.
   * @returns Comments counts.
   */
  async getCommentCountsByObjIds(options: {
    entityTypeId: number;
    entityObjectIds: number[];
    communityId: number;
  }): Promise<{ entityObjectId: number; count: number }[]> {
    const countsResp = await this.commentRepository
      .createQueryBuilder('comment')
      .select([
        `comment.entityObjectId as entity_object_id`,
        `count(comment.entityObjectId) as count`,
      ])
      .where(`comment.community = :community`, {
        community: options.communityId,
      })
      .andWhere(`comment.entityType = :entityTypeId`, {
        entityTypeId: options.entityTypeId,
      })
      .andWhere(`comment.entityObjectId IN (:...entityObjectIds)`, {
        entityObjectIds: options.entityObjectIds,
      })
      .groupBy(`comment.entityObjectId`)
      .getRawMany();

    return countsResp.map(resp => ({
      entityObjectId: parseInt(resp.entity_object_id),
      count: parseInt(resp.count),
    }));
  }

  /**
   * Add comment
   */
  async addComment(
    data: {},
    actorData,
    isReply,
    notifyUsers = true,
  ): Promise<CommentEntity> {
    const mentions = data['mentions'] || [];
    data['mentions'] = [];

    const commentData = this.commentRepository.create(data);
    const saveComment = await this.commentRepository.save(commentData);

    const commentEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.COMMENT,
    );

    // add mentions
    let addedMentions = [];
    if (mentions.length) {
      mentions.map(async mention => {
        mention['entityObjectId'] = saveComment.id;
        mention['entityType'] = commentEntityType.id;
        mention['community'] = actorData['community'];
      });
      addedMentions = await this.mentionService.bulkAddMentions(mentions);

      const addedMentionsIds = addedMentions.map(mention => mention.id);
      await this.commentRepository.update(
        { id: saveComment.id },
        { mentions: addedMentionsIds },
      );
      saveComment.mentions = addedMentionsIds;
    }

    const commentAddedData = await this.commentRepository.findOne({
      where: { id: saveComment.id },
      relations: [
        'entityType',
        'commentThread',
        'commentThread.community',
        'community',
      ],
    });

    if (notifyUsers) {
      NotificationHookService.notificationHook({
        actionData: saveComment,
        actorData: commentAddedData.anonymous
          ? { ...actorData, firstName: 'Anonymous' }
          : actorData,
        actionType: ACTION_TYPES.COMMENT,
        entityOperendObject: {
          comment: commentAddedData,
          redirectLink: this.generateCommentLink(commentAddedData),
          redirectBtnText: `Reply to ${EMAIL_BOOKMARKS.FIRST_NAME}`,
        },
      });

      // Generate notifications for mentions (only user mentions being handled right now).
      if (saveComment.mentions.length) {
        this.mentionService.generateNotifications({
          actionData: {
            ...commentAddedData,
            entityType: commentAddedData.entityType.id,
          },
          actorData: commentAddedData.anonymous
            ? { ...actorData, firstName: 'Anonymous' }
            : actorData,
          mentions: addedMentions,
          mentionType: MENTION_TYPES.COMMENT,
          mentionEntity: commentAddedData,
        });
      }
    }

    const actionEntityTypeIdComment = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.COMMENT,
    )).id;

    const points = await CommunityActionPoints.addUserPoints({
      actionType: isReply ? ACTION_TYPES.COMMENT : ACTION_TYPES.POST,
      entityTypeName: ENTITY_TYPES.COMMENT,
      community: actorData.community,
      userId: actorData.id,
      entityType: commentAddedData.entityType.id,
      entityObjectId: commentAddedData.entityObjectId,
      actionEntityObjectId: commentAddedData.id,
      actionEntityType: actionEntityTypeIdComment,
    });
    saveComment['points'] = {
      value: points,
      type: ACTION_TYPES.COMMENT,
    };
    return saveComment;
  }

  /**
   * Adds a comment along with the respective thread or thread participant.
   * @param data Comment data.
   */
  async addCommentWithThread(data: {
    commentThread?: number;
    user: UserEntity;
    message: string;
    tags: string[];
    mentions: number[];
    anonymous: number;
    entityType: number;
    entityObjectId: number;
    community: number;
    isDeleted?: boolean;
    attachments: {}[];
    notifyUsers: boolean;
  }): Promise<CommentEntity> {
    let addedComment: CommentEntity;
    const attachments = data.attachments;
    const notifyUsers = data.notifyUsers;
    delete data.attachments;
    delete data.notifyUsers;

    if (!get(data, 'commentThread')) {
      // Add a new comment with a new thread.
      const commentThread = await this.commentThreadService.addCommentThread({
        entityType: data.entityType,
        entityObjectId: data.entityObjectId,
        user: data.user,
        community: data.community,
      });

      addedComment = await this.addComment(
        { ...data, commentThread: commentThread },
        { ...data.user, community: data.community },
        false,
        notifyUsers,
      );
    } else {
      // Add a reply to a comment in the given thread by adding it in thread
      // participants.
      addedComment = await this.addComment(
        { ...data, commentThread: null },
        { ...data.user, community: data.community },
        true,
        notifyUsers,
      );
      await this.commentThreadParticipantService.addCommentThreadParticipant({
        commentThread: data.commentThread,
        user: data.user,
        comment: addedComment.id,
      });
    }

    // Add comment attachments.
    if (get(attachments, 'length')) {
      await this.commentAttachmentService.addCommentUserAttachments(
        attachments.map(attachment => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(attachment as any),
          commentId: addedComment.id,
        })),
      );
    }

    return addedComment;
  }

  /**
   * Add comment with it's replies.
   * @param params Params containing the comment & replies data.
   */
  async addCommentWithReplies(params: {
    comment: {
      commentThread?: number;
      user: UserEntity;
      message: string;
      tags: string[];
      mentions: number[];
      anonymous: number;
      entityType: number;
      entityObjectId: number;
      community: number;
      isDeleted?: boolean;
      attachments: {}[];
    };
    replies: {
      commentThread?: number;
      user: UserEntity;
      message: string;
      tags: string[];
      mentions: number[];
      anonymous: number;
      entityType: number;
      entityObjectId: number;
      community: number;
      isDeleted?: boolean;
      attachments: {}[];
    }[];
  }): Promise<CommentEntity> {
    const comment = await this.addCommentWithThread({
      ...params.comment,
      notifyUsers: false,
    });

    await Promise.all(
      params.replies.map(reply =>
        this.addCommentWithThread({
          ...reply,
          commentThread: comment.commentThreadId,
          notifyUsers: false,
        }),
      ),
    );

    return comment;
  }

  generateCommentLink(comment: CommentEntity): string {
    const port =
      this.configService.getEnv() === ENVIRONMENTS.DEVELOP
        ? `:${this.configService.getNumber('CLIENT_PORT')}`
        : '';

    return `${comment.community.url}${port}/idea/view/${comment.entityObjectId}?scrollTo=comment${comment.id}`;
  }

  /**
   * Update comment
   */
  async updateComment(
    options: {},
    data: {},
    actorData: {},
    communityId: number,
  ): Promise<{}> {
    const mentions = data['mentions'] || [];

    const existingComment = await this.commentRepository.findOne({
      where: { ...options, community: communityId },
      relations: ['entityType', 'commentThread'],
    });
    const existingMentions =
      existingComment.mentions && existingComment.mentions.length
        ? await this.mentionService.getMentions({
            where: { id: In(existingComment.mentions) },
          })
        : [];
    const commentEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.COMMENT,
    );

    let addedMentions = [];
    if (data['mentions']) {
      // remove existing mentions
      if (existingComment.mentions && existingComment.mentions.length) {
        await this.mentionService.removeMention(
          existingComment.mentions.map(mention => ({ id: mention })),
        );
      }

      // add new mentions
      mentions.map(async mention => {
        mention['entityObjectId'] = existingComment.id;
        mention['entityType'] = commentEntityType.id;
        mention['community'] = communityId;
        delete mention['id'];
        delete mention['createdAt'];
        delete mention['updatedAt'];
      });
      addedMentions = await this.mentionService.bulkAddMentions(mentions);
      data['mentions'] = addedMentions.map(mention => mention.id);
    }

    if (has(data, 'isDeleted') && data['isDeleted'] == true) {
      let actionType = await this.actionTypeService.getActionType({
        abbreviation: ACTION_TYPES.POST,
      });

      const actionEntityTypeIdComment = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.COMMENT,
      )).id;

      if (
        has(existingComment, 'commentThread') &&
        !existingComment['commentThread']
      ) {
        actionType = await this.actionTypeService.getActionType({
          abbreviation: ACTION_TYPES.COMMENT,
        });
      }

      await this.userActionPointService.deleteUserActionPoint({
        actionType: actionType['id'],
        community: communityId,
        userId: actorData['id'],
        entityType: existingComment.entityTypeId,
        entityObjectId: existingComment.entityObjectId,
        actionEntityObjectId: existingComment.id,
        actionEntityType: actionEntityTypeIdComment,
      });
    }

    const updateData = this.commentRepository.update(options, data);

    const updatedComment = await this.commentRepository.findOne({
      where: { ...options },
      relations: ['entityType'],
    });

    // Generate notifications for mentions.
    actorData['community'] = communityId;
    if (addedMentions && addedMentions.length) {
      const newMentions = this.mentionService.diffMentions(
        addedMentions,
        existingMentions,
      );
      if (newMentions && newMentions.length) {
        this.mentionService.generateNotifications({
          actionData: {
            ...updatedComment,
            entityType: updatedComment.entityType.id,
          },
          actorData: updatedComment.anonymous
            ? { ...actorData, firstName: 'Anonymous' }
            : actorData,
          mentions: addedMentions,
          mentionType: MENTION_TYPES.COMMENT,
          mentionEntity: updatedComment,
        });
      }
    }

    return updateData;
  }

  /**
   * Delete comment
   */
  async deleteComment(options: {}): Promise<{}> {
    return this.commentRepository.delete(options);
  }
  async getCommentCountsByDate(
    entityTypeId?,
    entityObjectIds?,
  ): Promise<any[]> {
    return this.commentRepository
      .createQueryBuilder(TABLES.COMMENT)
      .select([
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT CAST(${TABLES.COMMENT}.createdAt AS DATE)), ',') AS date`,
        `count(${TABLES.COMMENT}.id)::INTEGER`,
        // `ARRAY_AGG(${TABLES.COMMENT}.entityObjectId) as ids`,
      ])
      .andWhere(
        entityTypeId ? `${TABLES.COMMENT}.entityType = :entityType` : `1=1`,
        {
          entityType: entityTypeId,
        },
      )
      .andWhere(
        entityObjectIds
          ? `${TABLES.COMMENT}.entityObjectId IN (:...entityObjectIds)`
          : `1=1`,
        {
          entityObjectIds: entityObjectIds,
        },
      )
      .groupBy(`CAST(${TABLES.COMMENT}.createdAt AS DATE)`)
      .getRawMany();
  }
}
