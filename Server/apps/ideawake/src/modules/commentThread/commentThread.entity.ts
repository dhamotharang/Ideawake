import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommentThreadParticipantEntity } from '../commentThreadParticipant/commentThreadParticipant.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity(TABLES.COMMENT_THREAD)
export class CommentThreadEntity extends CommonEntity {
  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;

  // Relation
  @ManyToOne(() => UserEntity, at => at.id)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  // Relation
  @OneToMany(
    () => CommentThreadParticipantEntity,
    commentThreadPart => commentThreadPart.commentThread,
  )
  commentThreadPerticipants: CommentThreadParticipantEntity[];

  // Relation
  @OneToOne(() => CommentEntity, comment => comment.commentThread)
  comment: CommentEntity[];
}
