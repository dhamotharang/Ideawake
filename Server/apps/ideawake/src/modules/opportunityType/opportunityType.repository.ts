import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityTypeEntity } from './opportunityType.entity';

@EntityRepository(OpportunityTypeEntity)
export class OpportunityTypeRepository extends Repository<
  OpportunityTypeEntity
> {}
