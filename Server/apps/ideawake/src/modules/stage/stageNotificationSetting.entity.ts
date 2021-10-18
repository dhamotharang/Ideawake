import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.STAGE_NOTIFICATION_SETTING)
export class StageNotificationSettingEntity extends CommonEntity {
  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'int4',
    nullable: true,
  })
  entityObjectId: number;

  @Column('integer', { array: true, default: () => "'{}'" })
  groups: number[];

  @Column('integer', { array: true, default: () => "'{}'" })
  individuals: number[];

  @Column({
    default: false,
  })
  opportunityOwners: boolean;

  @Column({
    default: false,
  })
  opportunityTeams: boolean;

  @Column({
    default: true,
  })
  opportunitySubmitters: boolean;

  @Column({
    default: false,
  })
  followers: boolean;

  @Column({
    default: false,
  })
  voters: boolean;

  @Column({
    default: true,
  })
  sendEmail: boolean;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  message: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;
}
