import { Injectable } from '@nestjs/common';
import { CommentAttachmentRepository } from './commentAttachment.repository';
import { CommentAttachmentEntity } from './commentAttachment.entity';
import { get } from 'lodash';
import { UserAttachmentService } from '../userAttachment/userAttachment.service';

@Injectable()
export class CommentAttachmentService {
  constructor(
    public readonly commentAttachmentRepository: CommentAttachmentRepository,
    public readonly userAttachmentService: UserAttachmentService,
  ) {}

  /**
   * Get commentAttachments
   */
  async getCommentAttachments(options: {}): Promise<CommentAttachmentEntity[]> {
    return this.commentAttachmentRepository.find(options);
  }

  /**
   * Add commentAttachment
   */
  async addCommentAttachment(data: {}): Promise<CommentAttachmentEntity> {
    const commentAttachmentCreated = this.commentAttachmentRepository.create(
      data,
    );
    return this.commentAttachmentRepository.save(commentAttachmentCreated);
  }

  /**
   * Add multiple comment attachments.
   */
  async addCommentAttachments(data: {}[]): Promise<CommentAttachmentEntity[]> {
    const commentAttachmentCreated = this.commentAttachmentRepository.create(
      data,
    );
    return this.commentAttachmentRepository.save(commentAttachmentCreated);
  }

  async addCommentUserAttachments(
    attachments: {
      url: string;
      attachmentType: string;
      commentId: number;
      size: number;
      isDeleted?: boolean;
      userId: number;
      communityId: number;
    }[],
  ): Promise<CommentAttachmentEntity[]> {
    if (attachments.length) {
      const userAttachments = await this.userAttachmentService.addUserAttachments(
        attachments.map(attachment => ({
          user: attachment.userId,
          attachmentType: attachment.attachmentType,
          url: attachment.url,
          community: attachment.communityId,
          size: attachment.size,
        })),
      );

      return this.addCommentAttachments(
        attachments.map((attachment, index) => ({
          attachmentType: attachment.attachmentType,
          userAttachment: userAttachments[index],
          comment: attachment.commentId,
          isDeleted: get(attachment, 'isDeleted', false),
        })),
      );
    }
  }

  /**
   * Update commentAttachment
   */
  async updateCommentAttachment(options: {}, data: {}): Promise<{}> {
    return this.commentAttachmentRepository.update(options, data);
  }

  /**
   * Delete commentAttachment
   */
  async deleteCommentAttachment(options: {}): Promise<{}> {
    return this.commentAttachmentRepository.delete(options);
  }
}
