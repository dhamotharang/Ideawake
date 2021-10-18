import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityLinkEntity } from './opportunityLink.entity';

@EntityRepository(OpportunityLinkEntity)
export class OpportunityLinkRepository extends Repository<
  OpportunityLinkEntity
> {}
