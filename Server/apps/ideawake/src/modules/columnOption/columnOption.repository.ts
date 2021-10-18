import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ColumnOptionEntity } from './columnOption.entity';

@EntityRepository(ColumnOptionEntity)
export class ColumnOptionRepository extends Repository<ColumnOptionEntity> {}
