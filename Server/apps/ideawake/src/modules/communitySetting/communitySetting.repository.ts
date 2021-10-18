import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { CommunitySettingEntity } from './communitySetting.entity';

@EntityRepository(CommunitySettingEntity)
export class CommunitySettingRepository extends Repository<
  CommunitySettingEntity
> {}
