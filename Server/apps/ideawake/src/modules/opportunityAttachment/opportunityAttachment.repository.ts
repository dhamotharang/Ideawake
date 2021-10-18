import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityAttachmentEntity } from './opportunityAttachment.entity';

@EntityRepository(OpportunityAttachmentEntity)
export class OpportunityAttachmentRepository extends Repository<
  OpportunityAttachmentEntity
> {}
