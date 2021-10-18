import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { AnnouncementEntity } from './announcement.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.ANNOUNCEMENT_TARGETTING)
export class AnnouncementTargetingEntity extends CommonEntity {
  @Column('integer', { array: true, default: () => "'{}'" })
  roles: number[];

  @Column('integer', { array: true, default: () => "'{}'" })
  individuals: number[];

  @Column('integer', { array: true, default: () => "'{}'" })
  groups: number[];

  @Column({ default: false })
  public: boolean;

  @Column({ default: false })
  followers: boolean;

  @Column({ default: false })
  voters: boolean;

  @Column({ default: false })
  challengeParticipants: boolean;

  @Column({ type: 'simple-json', nullable: true })
  actionItemRelated: {};

  @OneToOne(
    () => AnnouncementEntity,
    announcement => announcement.targetSetting,
  )
  @JoinColumn()
  announcement: AnnouncementEntity;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;
}
