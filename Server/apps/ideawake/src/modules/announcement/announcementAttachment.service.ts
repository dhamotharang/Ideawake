import { Injectable } from '@nestjs/common';
import { AnnouncementAttachmentRepository } from './announcementAttachment.repository';
import { AnnouncementAttachmentEntity } from './announcementAttachment.entity';

@Injectable()
export class AnnouncementAttachmentService {
  constructor(
    public readonly announcementAttachmentRepository: AnnouncementAttachmentRepository,
  ) {}

  /**
   * Get AnnouncementAttachments
   */
  async getAnnouncementAttachments(options: {}): Promise<
    AnnouncementAttachmentEntity[]
  > {
    return this.announcementAttachmentRepository.find(options);
  }

  /**
   * Get single AnnouncementAttachments
   */
  async getAnnouncementAttachment(options: {}): Promise<
    AnnouncementAttachmentEntity
  > {
    return this.announcementAttachmentRepository.findOne(options);
  }

  /**
   * Add AnnouncementAttachment
   */
  async addAnnouncementAttachment(data: {}): Promise<
    AnnouncementAttachmentEntity
  > {
    const announcementAttachmentCreated = this.announcementAttachmentRepository.create(
      data,
    );
    return this.announcementAttachmentRepository.save(
      announcementAttachmentCreated,
    );
  }

  /**
   * AnnouncementAttachment AnnouncementAttachment
   */
  async updateAnnouncementAttachment(options: {}, data: {}): Promise<{}> {
    return this.announcementAttachmentRepository.update(options, data);
  }

  /**
   * Archive AnnouncementAttachment
   */
  async archiveAnnouncementAttachment(options: {}): Promise<{}> {
    return this.updateAnnouncementAttachment(options, { isDeleted: true });
  }

  /**
   * Permanently Delete AnnouncementAttachment
   */
  async deleteAnnouncementAttachment(options: {}): Promise<{}> {
    return this.announcementAttachmentRepository.delete(options);
  }
}
