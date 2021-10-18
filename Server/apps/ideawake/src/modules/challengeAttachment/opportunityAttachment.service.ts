import { Injectable } from '@nestjs/common';
import { ChallengeAttachmentRepository } from './challengeAttachment.repository';
import { ChallengeAttachmentEntity } from './challengeAttachment.entity';

@Injectable()
export class ChallengeAttachmentService {
  constructor(
    public readonly ohallengeAttachmentRepository: ChallengeAttachmentRepository,
  ) {}

  /**
   * Get ohallengeAttachments
   */
  async getChallengeAttachments(options: {}): Promise<
    ChallengeAttachmentEntity[]
  > {
    return this.ohallengeAttachmentRepository.find(options);
  }

  /**
   * Add ohallengeAttachment
   */
  async addChallengeAttachment(data: {}): Promise<ChallengeAttachmentEntity> {
    const ohallengeAttachmentCreated = this.ohallengeAttachmentRepository.create(
      data,
    );
    return this.ohallengeAttachmentRepository.save(ohallengeAttachmentCreated);
  }

  /**
   * Update ohallengeAttachment
   */
  async updateChallengeAttachment(options: {}, data: {}): Promise<{}> {
    return this.ohallengeAttachmentRepository.update(options, data);
  }

  /**
   * Delete ohallengeAttachment
   */
  async deleteChallengeAttachment(options: {}): Promise<{}> {
    return this.ohallengeAttachmentRepository.delete(options);
  }
}
