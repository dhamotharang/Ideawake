import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserAttachmentEntity } from '../userAttachment/userAttachment.entity';
import { ChallengeEntity } from '../challenge/challenge.entity';

@Entity(TABLES.CHALLENGE_ATTACHMENT)
export class ChallengeAttachmentEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  attachmentType: string;

  @ManyToOne(() => UserAttachmentEntity)
  @JoinColumn()
  userAttachment: UserAttachmentEntity;

  @ManyToOne(() => ChallengeEntity)
  @JoinColumn()
  challenge: ChallengeEntity;

  @Column('text')
  url: string;

  @Column({
    nullable: true,
    type: 'int',
    default: 0,
  })
  size: number;

  @Column({
    nullable: false,
    type: 'smallint',
    default: 0,
  })
  isSelected: number;
}
