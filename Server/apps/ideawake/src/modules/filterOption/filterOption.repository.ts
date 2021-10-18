import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { FilterOptionEntity } from './filterOption.entity';

@EntityRepository(FilterOptionEntity)
export class FilterOptionRepository extends Repository<FilterOptionEntity> {}
