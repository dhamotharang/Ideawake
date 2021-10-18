import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EvaluationCriteriaEntity } from './evaluationCriteria.entity';

@EntityRepository(EvaluationCriteriaEntity)
export class EvaluationCriteriaRepository extends Repository<
  EvaluationCriteriaEntity
> {}
