import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserAttachmentEntity } from '../userAttachment/userAttachment.entity';
import { AnnouncementEntity } from './announcement.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.ANNOUNCEMENT_ATTACHMENT)
export class AnnouncementAttachmentEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 1024 })
  attachmentType: string;

  @Column('text')
  url: string;

  @Column({ nullable: true, type: 'int', default: 0 })
  size: number;

  @ManyToOne(() => UserAttachmentEntity)
  @JoinColumn()
  userAttachment: UserAttachmentEntity;

  @ManyToOne(() => AnnouncementEntity, announcement => announcement.attachments)
  @JoinColumn()
  announcement: AnnouncementEntity;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;
}
