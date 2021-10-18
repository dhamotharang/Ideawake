import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { UserAttachmentEntity } from './userAttachment.entity';

@EntityRepository(UserAttachmentEntity)
export class UserAttachmentRepository extends Repository<
  UserAttachmentEntity
> {}
