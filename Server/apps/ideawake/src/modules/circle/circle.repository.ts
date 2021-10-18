import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CircleEntity } from './circle.entity';

@EntityRepository(CircleEntity)
export class CircleRepository extends Repository<CircleEntity> {}
