import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { StageAssigneeSettingsTypeEnum } from '../../enum/stage-assignee-settings.enum';

@Entity(TABLES.STAGE_ASSIGNEE_SETTINGS)
export class StageAssigneeSettingsEntity extends CommonEntity {
  @Column({
    type: 'enum',
    enum: StageAssigneeSettingsTypeEnum,
  })
  settingsType: StageAssigneeSettingsTypeEnum;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'int4',
    nullable: true,
  })
  entityObjectId: number;

  @Column({
    default: true,
  })
  unassigned: boolean;

  @Column('integer', { array: true, default: () => "'{}'" })
  groups: number[];

  @Column('integer', { array: true, default: () => "'{}'" })
  individuals: number[];

  @Column({
    default: false,
  })
  communityAdmins: boolean;

  @Column({
    default: false,
  })
  communityModerators: boolean;

  @Column({
    default: false,
  })
  communityUsers: boolean;

  @Column({
    default: false,
  })
  opportunityOwners: boolean;

  @Column({
    default: false,
  })
  opportunityTeams: boolean;

  @Column({
    default: false,
  })
  opportunitySubmitters: boolean;

  @Column({ nullable: true, type: 'json' })
  customFieldAssignee: {};

  @Column({
    default: false,
  })
  allMembers: boolean;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}
