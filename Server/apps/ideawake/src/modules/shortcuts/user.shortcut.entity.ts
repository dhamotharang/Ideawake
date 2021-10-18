import { UserEntity } from '../user/user.entity';
import { ShortcutEntity } from './shortcut.entity';
import {
  Entity,
  // PrimaryColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_SHORTCUTS)
export class UserShortcuts {
  @PrimaryGeneratedColumn()
  userId: number;

  @PrimaryGeneratedColumn()
  shortcutId: number | string;

  @ManyToOne(() => UserEntity, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ShortcutEntity, sh => sh.id, {
    primary: true,
  })
  @JoinColumn({ name: 'shortcut_id' })
  shortcut: ShortcutEntity;
}
