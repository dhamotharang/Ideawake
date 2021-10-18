import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { OppoCriteriaEvalSummaryEntity } from './oppoCriteriaEvalSummary.entity';

@EntityRepository(OppoCriteriaEvalSummaryEntity)
export class OppoCriteriaEvalSummaryRepository extends Repository<
  OppoCriteriaEvalSummaryEntity
> {}
