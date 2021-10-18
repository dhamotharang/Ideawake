import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { MentionEntity } from './mention.entity';

@EntityRepository(MentionEntity)
export class MentionRepository extends Repository<MentionEntity> {}
