import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EvaluationTypeEntity } from './evaluationType.entity';

@EntityRepository(EvaluationTypeEntity)
export class EvaluationTypeRepository extends Repository<
  EvaluationTypeEntity
> {}
