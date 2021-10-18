import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ChallengeParticipantEntity } from './challengeParticipant.entity';

@EntityRepository(ChallengeParticipantEntity)
export class ChallengeParticipantRepository extends Repository<
  ChallengeParticipantEntity
> {}
