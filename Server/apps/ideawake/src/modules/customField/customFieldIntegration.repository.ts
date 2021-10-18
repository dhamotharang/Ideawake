import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CustomFieldIntegrationEntity } from './customFieldIntegration.entity';

@EntityRepository(CustomFieldIntegrationEntity)
export class CustomFieldIntegrationRepository extends Repository<
  CustomFieldIntegrationEntity
> {}
