import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from './user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  // PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.USER_COMMUNITIES_COMMUNITY)
export class UserCommCommunities {
  @PrimaryGeneratedColumn()
  userId: number;

  @PrimaryGeneratedColumn()
  communityId: number;

  @ManyToOne(() => UserEntity, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CommunityEntity, community => community.id, {
    primary: true,
  })
  @JoinColumn({ name: 'community_id' })
  community: CommunityEntity;

  @Column({ nullable: true, default: false })
  isDeleted: boolean;

  @Column('text', { nullable: true, select: false })
  token: string;

  @Column('boolean', { default: false })
  isPending: boolean;
}
