import { UserEntity } from '../user/user.entity';
import { BookmarkEntity } from './bookmark.entity';
import {
  Entity,
  // PrimaryColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_BOOKMARKS)
export class UserBookmarks {
  @PrimaryGeneratedColumn()
  userId: number;

  @PrimaryGeneratedColumn()
  bookmarkId: number | string;

  @ManyToOne(() => UserEntity, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => BookmarkEntity, sh => sh.id, {
    primary: true,
  })
  @JoinColumn({ name: 'bookmark_id' })
  bookmark: BookmarkEntity;
}
