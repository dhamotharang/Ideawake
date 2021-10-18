import { CommonEntity } from './../../common/common.entity';
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  Index,
  RelationId,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { SubscriptionHookEvents, SubscriptionHookSource } from '../../enum';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.HOOK_SUBSCRIPTION)
@Index(['event', 'community'])
@Index(['event', 'community', 'createdBy'])
export class HooksSubscriptionEntity extends CommonEntity {
  @Column({
    type: 'enum',
    enum: SubscriptionHookSource,
    default: SubscriptionHookSource.ZAPIER,
  })
  source: SubscriptionHookSource;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  hookUrl: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  status: boolean;

  @Column({
    type: 'enum',
    enum: SubscriptionHookEvents,
    default: SubscriptionHookEvents.NEW_OPPORTUNITY,
  })
  event: SubscriptionHookEvents;

  @Column({ type: 'simple-json', nullable: true })
  inputData;

  @Column({ nullable: true })
  hookId: number;

  @Index()
  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (hookSubscription: HooksSubscriptionEntity) => hookSubscription.community,
  )
  communityId: number;
}
