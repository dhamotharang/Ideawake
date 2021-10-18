import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunityEntity } from './community.entity';

@EntityRepository(CommunityEntity)
export class CommunityRepository extends Repository<CommunityEntity> {}
