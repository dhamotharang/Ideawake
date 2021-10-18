import { Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';

import { CommentThreadEntity } from './commentThread.entity';
import { CommentThreadRepository } from './commentThread.repository';

@Injectable()
export class CommentThreadService {
  constructor(
    public readonly commentThreadRepository: CommentThreadRepository,
  ) {}

  /**
   * Get commentThreads
   */
  async getCommentThreads(options: {}): Promise<CommentThreadEntity[]> {
    return this.commentThreadRepository.find(options);
  }

  /**
   * Get commentThreads
   */
  async findCommentThreads(options: {
    community;
    entityObjectId;
    isDeleted?: boolean;
  }): Promise<CommentThreadEntity[]> {
    const query = this.commentThreadRepository
      .createQueryBuilder('comment_thread')
      .leftJoinAndSelect('comment_thread.entityType', 'entityType')
      .leftJoinAndSelect('comment_thread.comment', 'commentThreadComment')
      .leftJoinAndSelect(
        'commentThreadComment.commentAttachments',
        'commentThreadCommentAttachments',
      )
      .leftJoinAndSelect(
        'commentThreadCommentAttachments.userAttachment',
        'commentThreadCommentUserAttachment',
      )
      .leftJoinAndSelect('comment_thread.user', 'user')
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .leftJoinAndSelect('comment_thread.community', 'community')

      .leftJoinAndSelect(
        'comment_thread.commentThreadPerticipants',
        'commentThreadPerticipants',
      )
      .leftJoinAndSelect('commentThreadPerticipants.comment', 'comment')
      .leftJoinAndSelect(
        'comment.commentAttachments',
        'commentThreadPerticipantsAttachment',
      )
      .leftJoinAndSelect('comment.user', 'commentThreadPerticipantsUser')
      .leftJoinAndSelect(
        'commentThreadPerticipantsUser.profileImage',
        'commentThreadPerticipantsUserProfileImage',
      )
      .leftJoinAndSelect('comment.commentAttachments', 'commentAttachments')
      .leftJoinAndSelect('commentAttachments.userAttachment', 'userAttachment')
      .where('comment_thread.community = :community', {
        community: options.community,
      })
      .andWhere('comment_thread.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .orderBy({
        'comment_thread.createdAt': 'DESC',
        'commentThreadPerticipants.createdAt': 'ASC',
      });

    if (options.hasOwnProperty('isDeleted')) {
      query
        .andWhere('commentThreadComment.isDeleted = :isDeleted', {
          isDeleted: options.isDeleted,
        })
        .andWhere(
          new Brackets(qb => {
            qb.orWhere('comment ISNULL').orWhere(
              'comment.isDeleted = :isDeleted',
              {
                isDeleted: options.isDeleted,
              },
            );
          }),
        );
    }
    return query.getMany();
  }

  /**
   * Add commentThread
   */
  async addCommentThread(data: {}): Promise<CommentThreadEntity> {
    const commentThreadCreated = this.commentThreadRepository.create(data);
    return this.commentThreadRepository.save(commentThreadCreated);
  }

  /**
   * Update commentThread
   */
  async updateCommentThread(options: {}, data: {}): Promise<{}> {
    return this.commentThreadRepository.update(options, data);
  }

  /**
   * Delete commentThread
   */
  async deleteCommentThread(options: {}): Promise<{}> {
    return this.commentThreadRepository.delete(options);
  }
}
