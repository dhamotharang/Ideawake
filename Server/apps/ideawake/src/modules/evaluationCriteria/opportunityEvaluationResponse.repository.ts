import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OpportunityEvaluationResponseEntity } from './opportunityEvaluationResponse.entity';

@EntityRepository(OpportunityEvaluationResponseEntity)
export class OpportunityEvaluationResponseRepository extends Repository<
  OpportunityEvaluationResponseEntity
> {}
