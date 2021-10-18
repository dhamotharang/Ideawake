import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { TenantEntity } from './tenant.entity';

@EntityRepository(TenantEntity)
export class TenantRepository extends Repository<TenantEntity> {}
