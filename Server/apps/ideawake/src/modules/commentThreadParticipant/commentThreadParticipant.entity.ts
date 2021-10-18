import { CommonEntity } from '../../common/common.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommentThreadEntity } from '../commentThread/commentThread.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity(TABLES.COMMENT_THREAD_PARTICIPANT)
export class CommentThreadParticipantEntity extends CommonEntity {
  // Relation
  @ManyToOne(() => CommentThreadEntity, commentThread => commentThread.id)
  @JoinColumn()
  commentThread: CommentThreadEntity;

  // Relation
  @ManyToOne(() => UserEntity, at => at.id)
  @JoinColumn()
  user: UserEntity;

  // Relation
  @ManyToOne(() => CommentEntity, at => at.id)
  @JoinColumn()
  comment: CommentEntity;
}
