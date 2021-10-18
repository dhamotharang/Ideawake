import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { BlacklistEmailEntity } from './blacklistEmail.entity';

@EntityRepository(BlacklistEmailEntity)
export class BlacklistEmailRepository extends Repository<
  BlacklistEmailEntity
> {}
