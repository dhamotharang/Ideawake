import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { PrizeCategoryEntity } from './prizeCategory.entity';

@EntityRepository(PrizeCategoryEntity)
export class PrizeCategoryRepository extends Repository<PrizeCategoryEntity> {}
