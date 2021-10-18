import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityEntity } from './opportunity.entity';

@EntityRepository(OpportunityEntity)
export class OpportunityRepository extends Repository<OpportunityEntity> {}
