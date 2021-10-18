import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { UserActionPointEntity } from './userActionPoint.entity';

@EntityRepository(UserActionPointEntity)
export class UserActionPointRepository extends Repository<
  UserActionPointEntity
> {}
