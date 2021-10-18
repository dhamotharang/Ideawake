import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EntityTypeEntity } from './entity.entity';

@EntityRepository(EntityTypeEntity)
export class EntityTypeRepository extends Repository<EntityTypeEntity> {}
