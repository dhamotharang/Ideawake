import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { AuthIntegrationEntity } from './authIntegration.entity';

@EntityRepository(AuthIntegrationEntity)
export class AuthIntegrationRepository extends Repository<
  AuthIntegrationEntity
> {}
