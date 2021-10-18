import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CustomFieldDataEntity } from './customFieldData.entity';

@EntityRepository(CustomFieldDataEntity)
export class CustomFieldDataRepository extends Repository<
  CustomFieldDataEntity
> {}
