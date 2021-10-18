import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EntityExperienceSettingEntity } from './entityExperienceSetting.entity';

@EntityRepository(EntityExperienceSettingEntity)
export class EntityExperienceSettingRepository extends Repository<
  EntityExperienceSettingEntity
> {}
