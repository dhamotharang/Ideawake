import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StageEntity } from './stage.entity';

@EntityRepository(StageEntity)
export class StageRepository extends Repository<StageEntity> {}
