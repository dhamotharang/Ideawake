import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  // ManyToOne,
  // JoinColumn
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunitySettingType } from '../../enum/community-setting-type.enum';
// import { CommunityEntity } from '../community/community.entity';
// import { CommunitySettingTypeEntity } from '../communitySettingType/communitySettingType.entity';
// import { RoleEntity } from '../role/role.entity';

@Entity(TABLES.COMMUNITY_SETTING)
export class CommunitySettingEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 300 })
  description: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CommunitySettingType,
  })
  type: CommunitySettingType;

  // @ManyToOne(() => CommunityEntity)
  // @JoinColumn()
  // community: CommunityEntity;

  // @ManyToOne(() => CommunitySettingTypeEntity)
  // @JoinColumn()
  // communitySettingType: CommunitySettingTypeEntity;

  // @ManyToOne(() => RoleEntity)
  // @JoinColumn()
  // role: RoleEntity;
}
