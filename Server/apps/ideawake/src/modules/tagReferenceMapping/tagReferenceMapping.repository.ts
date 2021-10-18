import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { TagReferenceMappingEntity } from './tagReferenceMapping.entity';

@EntityRepository(TagReferenceMappingEntity)
export class TagReferenceMappingRepository extends Repository<
  TagReferenceMappingEntity
> {}
