import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityDraftEntity } from './opportunityDraft.entity';

@EntityRepository(OpportunityDraftEntity)
export class OpportunityDraftRepository extends Repository<
  OpportunityDraftEntity
> {}
