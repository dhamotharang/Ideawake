import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { InviteEntity } from './invite.entity';

@EntityRepository(InviteEntity)
export class InviteRepository extends Repository<InviteEntity> {}
