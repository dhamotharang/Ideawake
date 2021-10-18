import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { DashboardEntity } from './dashboard.entity';

@EntityRepository(DashboardEntity)
export class DashboardRepository extends Repository<DashboardEntity> {}
