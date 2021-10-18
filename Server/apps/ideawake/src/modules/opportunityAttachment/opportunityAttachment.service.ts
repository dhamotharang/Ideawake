import { Injectable } from '@nestjs/common';
import { OpportunityAttachmentRepository } from './opportunityAttachment.repository';
import { OpportunityAttachmentEntity } from './opportunityAttachment.entity';
import { UserAttachmentService } from '../userAttachment/userAttachment.service';
import { get } from 'lodash';

@Injectable()
export class OpportunityAttachmentService {
  constructor(
    public readonly opportunityAttachmentRepository: OpportunityAttachmentRepository,
    private userAttachmentService: UserAttachmentService,
  ) {}

  /**
   * Get opportunityAttachments
   */
  async getOpportunityAttachments(options: {}): Promise<
    OpportunityAttachmentEntity[]
  > {
    return this.opportunityAttachmentRepository.find(options);
  }

  /**
   * Add opportunityAttachment
   */
  async addOpportunityAttachment(data: {}): Promise<
    OpportunityAttachmentEntity
  > {
    const opportunityAttachmentCreated = this.opportunityAttachmentRepository.create(
      data,
    );
    return this.opportunityAttachmentRepository.save(
      opportunityAttachmentCreated,
    );
  }

  /**
   * Add opportunityAttachment
   */
  async addOpportunityAttachments(
    data: {}[],
  ): Promise<OpportunityAttachmentEntity[]> {
    const opportunityAttachmentCreated = this.opportunityAttachmentRepository.create(
      data,
    );
    return this.opportunityAttachmentRepository.save(
      opportunityAttachmentCreated,
    );
  }

  async addOpportunityUserAttachments(
    attachments: {
      url: string;
      attachmentType: string;
      opportunityId: number;
      opportunityTypeId: number;
      size: number;
      isDeleted?: boolean;
      isSelected?: number;
      userId: number;
      communityId: number;
    }[],
  ): Promise<OpportunityAttachmentEntity[]> {
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

      return this.addOpportunityAttachments(
        attachments.map((attachment, index) => ({
          url: attachment.url,
          attachmentType: attachment.attachmentType,
          opportunity: attachment.opportunityId,
          opportunityType: attachment.opportunityTypeId,
          size: attachment.size,
          userAttachment: userAttachments[index],
          isSelected: get(attachment, 'isSelected', 0),
          isDeleted: get(attachment, 'isDeleted', false),
        })),
      );
    }
  }

  /**
   * Update opportunityAttachment
   */
  async updateOpportunityAttachment(options: {}, data: {}): Promise<{}> {
    return this.opportunityAttachmentRepository.update(options, data);
  }

  /**
   * Delete opportunityAttachment
   */
  async deleteOpportunityAttachment(options: {}): Promise<{}> {
    return this.opportunityAttachmentRepository.delete(options);
  }
}
