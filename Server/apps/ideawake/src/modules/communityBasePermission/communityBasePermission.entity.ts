import { CommonEntity } from '../../common/common.entity';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { CommunitySettingEntity } from '../communitySetting/communitySetting.entity';
import { RoleEntity } from '../role/role.entity';
@Entity(TABLES.COMMUNITY_BASE_PERMISSION)
export class CommunityBasePermissionEntity extends CommonEntity {
  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @ManyToOne(() => CommunitySettingEntity)
  @JoinColumn()
  communitySetting: CommunitySettingEntity;

  @ManyToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;
}
