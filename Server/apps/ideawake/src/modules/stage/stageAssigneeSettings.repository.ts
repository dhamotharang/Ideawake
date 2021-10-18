import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StageAssigneeSettingsEntity } from './stageAssigneeSettings.entity';

@EntityRepository(StageAssigneeSettingsEntity)
export class StageAssigneeSettingsRepository extends Repository<
  StageAssigneeSettingsEntity
> {}
