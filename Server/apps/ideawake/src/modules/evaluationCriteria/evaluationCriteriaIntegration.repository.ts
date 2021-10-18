import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EvaluationCriteriaIntegrationEntity } from './evaluationCriteriaIntegration.entity';

@EntityRepository(EvaluationCriteriaIntegrationEntity)
export class EvaluationCriteriaIntegrationRepository extends Repository<
  EvaluationCriteriaIntegrationEntity
> {}
