import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { PrizeEntity } from './prize.entity';

@EntityRepository(PrizeEntity)
export class PrizeRepository extends Repository<PrizeEntity> {}
