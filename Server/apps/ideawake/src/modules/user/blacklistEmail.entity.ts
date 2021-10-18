import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.BLACKLIST_EMAIL)
@Unique(['email', 'community'])
export class BlacklistEmailEntity extends CommonEntity {
  @Column({ type: 'text', nullable: false })
  email: string;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;
}
