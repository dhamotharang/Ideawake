import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StatusEntity } from './status.entity';

@EntityRepository(StatusEntity)
export class StatusRepository extends Repository<StatusEntity> {}
