import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { RoleActorsEntity } from './roleActors.entity';

@EntityRepository(RoleActorsEntity)
export class RoleActorsRepository extends Repository<RoleActorsEntity> {}
