import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ChallengeAttachmentEntity } from './challengeAttachment.entity';

@EntityRepository(ChallengeAttachmentEntity)
export class ChallengeAttachmentRepository extends Repository<
  ChallengeAttachmentEntity
> {}
