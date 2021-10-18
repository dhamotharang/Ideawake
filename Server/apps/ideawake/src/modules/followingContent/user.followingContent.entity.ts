import { UserEntity } from '../user/user.entity';
import { FollowingContentEntity } from './followingContent.entity';
import {
  Entity,
  // PrimaryColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_FOLLOWING_CONTENT)
export class UserFollowingContents {
  @PrimaryGeneratedColumn()
  userId: number;

  @PrimaryGeneratedColumn()
  followingContentId: number | string;

  @ManyToOne(() => UserEntity, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => FollowingContentEntity, sh => sh.id, {
    primary: true,
  })
  @JoinColumn({ name: 'following_content_id' })
  followingContent: FollowingContentEntity;
}
