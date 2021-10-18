import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OppoEvaluationSummaryEntity } from './oppoEvaluationSummary.entity';

@EntityRepository(OppoEvaluationSummaryEntity)
export class OppoEvaluationSummaryRepository extends Repository<
  OppoEvaluationSummaryEntity
> {}
