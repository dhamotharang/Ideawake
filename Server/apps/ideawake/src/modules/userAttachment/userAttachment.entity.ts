import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.USER_ATTACHMENTS)
export class UserAttachmentEntity extends CommonEntity {
  // Relation
  @ManyToOne(() => UserEntity, at => at.id)
  @JoinColumn()
  user: UserEntity;

  @Column({ type: 'varchar', length: 250 })
  attachmentType: string;

  @Column('text')
  url: string;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @Column({
    nullable: true,
    type: 'int',
    default: 0,
  })
  size: number;
}
