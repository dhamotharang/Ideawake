import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EntityVisibilitySettingEntity } from './entityVisibilitySetting.entity';

@EntityRepository(EntityVisibilitySettingEntity)
export class EntityVisibilitySettingRepository extends Repository<
  EntityVisibilitySettingEntity
> {}
