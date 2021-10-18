import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StageAssignmentSettingsEntity } from './stageAssignmentSettings.entity';

@EntityRepository(StageAssignmentSettingsEntity)
export class StageAssignmentSettingsRepository extends Repository<
  StageAssignmentSettingsEntity
> {}
