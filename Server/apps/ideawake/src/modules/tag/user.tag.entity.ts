import { UserEntity } from '../user/user.entity';
import { TagEntity } from './tag.entity';
import {
  Column,
  Entity,
  // PrimaryColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_TAGS)
export class UserTags {
  @PrimaryGeneratedColumn()
  userId: number;

  @PrimaryGeneratedColumn()
  tagId: number;

  @ManyToOne(() => UserEntity, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TagEntity, tag => tag.id, {
    primary: true,
  })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;
}
