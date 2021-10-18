import { Injectable } from '@nestjs/common';
import { UserAttachmentRepository } from './userAttachment.repository';
import { UserAttachmentEntity } from './userAttachment.entity';

@Injectable()
export class UserAttachmentService {
  constructor(
    public readonly userAttachmentRepository: UserAttachmentRepository,
  ) {}

  /**
   * Get userAttachments
   */
  async getUserAttachments(options: {}): Promise<UserAttachmentEntity[]> {
    return this.userAttachmentRepository.find(options);
  }

  /**
   * Add userAttachment
   */
  async addUserAttachment(data: {}): Promise<UserAttachmentEntity> {
    const userAttachmentCreated = this.userAttachmentRepository.create(data);
    return this.userAttachmentRepository.save(userAttachmentCreated);
  }

  /**
   * Add userAttachments
   */
  async addUserAttachments(data: {}[]): Promise<UserAttachmentEntity[]> {
    const userAttachmentCreated = this.userAttachmentRepository.create(data);
    return this.userAttachmentRepository.save(userAttachmentCreated);
  }

  /**
   * Update userAttachment
   */
  async updateUserAttachment(options: {}, data: {}): Promise<{}> {
    return this.userAttachmentRepository.update(options, data);
  }

  /**
   * Delete userAttachment
   */
  async deleteUserAttachment(options: {}): Promise<{}> {
    return this.userAttachmentRepository.delete(options);
  }
}
