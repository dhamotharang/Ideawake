import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { VoteEntity } from './vote.entity';

@EntityRepository(VoteEntity)
export class VoteRepository extends Repository<VoteEntity> {}
