import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommentAttachmentEntity } from './commentAttachment.entity';

@EntityRepository(CommentAttachmentEntity)
export class CommentAttachmentRepository extends Repository<
  CommentAttachmentEntity
> {}
