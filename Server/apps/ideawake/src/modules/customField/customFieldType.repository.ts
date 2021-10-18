import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CustomFieldTypeEntity } from './customFieldType.entity';

@EntityRepository(CustomFieldTypeEntity)
export class CustomFieldTypeRepository extends Repository<
  CustomFieldTypeEntity
> {}
