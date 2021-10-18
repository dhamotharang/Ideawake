import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommentThreadParticipantEntity } from './commentThreadParticipant.entity';

@EntityRepository(CommentThreadParticipantEntity)
export class CommentThreadParticipantRepository extends Repository<
  CommentThreadParticipantEntity
> {}
