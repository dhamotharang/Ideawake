import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { IntegrationEntity } from './integration.entity';

@EntityRepository(IntegrationEntity)
export class IntegrationRepository extends Repository<IntegrationEntity> {}
