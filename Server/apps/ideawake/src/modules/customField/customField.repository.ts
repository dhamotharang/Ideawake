import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CustomFieldEntity } from './customField.entity';

@EntityRepository(CustomFieldEntity)
export class CustomFieldRepository extends Repository<CustomFieldEntity> {}
