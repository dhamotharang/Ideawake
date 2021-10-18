import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from '../user/user.entity';
import { AnnouncementTargetingEntity } from './announcementTargeting.entity';
import { AnnouncementAttachmentEntity } from './announcementAttachment.entity';
import { AnnouncementStatuses } from '../../enum';
import { EntityExperienceSettingEntity } from '../entityExperienceSetting/entityExperienceSetting.entity';

@Entity(TABLES.ANNOUNCEMENT)
export class AnnouncementEntity extends CommonEntity {
  // Basics

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: AnnouncementStatuses,
    default: AnnouncementStatuses.SCHEDULED,
  })
  status: AnnouncementStatuses;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  scheduledAt: Date;

  @Column({ type: 'int8', default: 0 })
  viewCount;

  // Announcement Settings

  @Column({ default: true })
  sendEmail: boolean;

  @Column({ default: true })
  sendFeed: boolean;

  // Relations

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  poster: UserEntity;

  // 'entityObjectId' & 'entityType' defines for which entity/level the announcement
  // is for. (Note: Both of these columns being NULL means that announcement is for
  // community level.

  @Column({ type: 'integer', nullable: true })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @ManyToOne(() => EntityExperienceSettingEntity)
  @JoinColumn({ name: 'exp_setting_id' })
  experienceSetting: EntityExperienceSettingEntity;

  @OneToOne(() => AnnouncementTargetingEntity, target => target.announcement)
  targetSetting: AnnouncementTargetingEntity;

  @OneToMany(
    () => AnnouncementAttachmentEntity,
    attachment => attachment.announcement,
  )
  attachments: AnnouncementAttachmentEntity[];
}
