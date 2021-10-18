import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunityActionPointEntity } from './communityActionPoint.entity';

@EntityRepository(CommunityActionPointEntity)
export class CommunityActionPointRepository extends Repository<
  CommunityActionPointEntity
> {}
