import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityFieldLinkageEntity } from './opportunityFieldLinkage.entity';

@EntityRepository(OpportunityFieldLinkageEntity)
export class OpportunityFieldLinkageRepository extends Repository<
  OpportunityFieldLinkageEntity
> {}
