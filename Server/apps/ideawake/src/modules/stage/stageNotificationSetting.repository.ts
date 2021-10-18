import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { StageNotificationSettingEntity } from './stageNotificationSetting.entity';

@EntityRepository(StageNotificationSettingEntity)
export class StageNotificationSettingRepository extends Repository<
  StageNotificationSettingEntity
> {}
