import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunityAppearanceSettingEntity } from './communityAppearanceSetting.entity';

@EntityRepository(CommunityAppearanceSettingEntity)
export class CommunityAppearanceSettingRepository extends Repository<
  CommunityAppearanceSettingEntity
> {}
