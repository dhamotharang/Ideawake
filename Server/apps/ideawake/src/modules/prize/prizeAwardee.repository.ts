import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { PrizeAwardeeEntity } from './prizeAwardee.entity';

@EntityRepository(PrizeAwardeeEntity)
export class PrizeAwardeeRepository extends Repository<PrizeAwardeeEntity> {}
