import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { AnnouncementAttachmentEntity } from './announcementAttachment.entity';

@EntityRepository(AnnouncementAttachmentEntity)
export class AnnouncementAttachmentRepository extends Repository<
  AnnouncementAttachmentEntity
> {}
