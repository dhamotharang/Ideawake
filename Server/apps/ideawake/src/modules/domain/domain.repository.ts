import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { DomainEntity } from './domain.entity';

@EntityRepository(DomainEntity)
export class DomainRepository extends Repository<DomainEntity> {}
