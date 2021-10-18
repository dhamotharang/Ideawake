import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ChallengeEntity } from './challenge.entity';

@EntityRepository(ChallengeEntity)
export class ChallengeRepository extends Repository<ChallengeEntity> {}
