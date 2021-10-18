import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserAttachmentEntity } from '../userAttachment/userAttachment.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity(TABLES.COMMENT_ATTACHMENT)
export class CommentAttachmentEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  attachmentType: string;

  @ManyToOne(() => UserAttachmentEntity)
  @JoinColumn()
  userAttachment: UserAttachmentEntity;

  @ManyToOne(() => CommentEntity)
  @JoinColumn()
  comment: CommentEntity;
}
