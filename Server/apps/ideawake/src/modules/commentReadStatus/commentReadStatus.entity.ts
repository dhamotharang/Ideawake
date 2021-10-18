import { CommonEntity } from '../../common/common.entity';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity(TABLES.COMMENT_READ_STATUS)
export class ThemeEntity extends CommonEntity {
  // Relation
  @ManyToOne(() => CommentEntity, at => at.id)
  @JoinColumn()
  comment: CommentEntity;

  // Relation
  @ManyToOne(() => UserEntity, at => at.id)
  @JoinColumn()
  user: UserEntity;
}
