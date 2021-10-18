import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityUserEntity } from './opportunityUser.entity';

@EntityRepository(OpportunityUserEntity)
export class OpportunityUserRepository extends Repository<
  OpportunityUserEntity
> {}
