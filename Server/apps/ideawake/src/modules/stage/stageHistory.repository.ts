import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StageHistoryEntity } from './stageHistory.entity';

@EntityRepository(StageHistoryEntity)
export class StageHistoryRepository extends Repository<StageHistoryEntity> {}
