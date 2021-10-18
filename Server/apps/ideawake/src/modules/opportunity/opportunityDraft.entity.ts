import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { UserEntity } from '../user/user.entity';
import { OpportunityTypeEntity } from '../opportunityType/opportunityType.entity';
import { ChallengeEntity } from '../challenge/challenge.entity';
import { StageEntity } from '../stage/stage.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';

@Entity(TABLES.OPPORTUNITY_DRAFT)
@Index(['challenge', 'community'])
export class OpportunityDraftEntity extends CommonEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: false, type: 'smallint', default: 0 })
  anonymous: number;

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  tags: [];

  @Column({ type: 'json', nullable: true })
  mentions: {};

  @Column({ type: 'json', nullable: true })
  attachments: {};

  @Column({ type: 'json', nullable: true })
  customFieldsData: {};

  @ManyToOne(() => OpportunityTypeEntity, { nullable: false })
  @JoinColumn()
  opportunityType: OpportunityTypeEntity;

  @Column()
  opportunityTypeId: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity;

  @Column()
  userId: number;

  @Index()
  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;

  @Index()
  @ManyToOne(() => ChallengeEntity)
  @JoinColumn()
  challenge: ChallengeEntity;

  @Column({ nullable: true })
  challengeId: number;

  @ManyToOne(() => StageEntity)
  @JoinColumn()
  stage: StageEntity;

  @Column({ nullable: true })
  stageId: number;

  @ManyToOne(() => WorkflowEntity)
  @JoinColumn()
  workflow: WorkflowEntity;

  @Column({ nullable: true })
  workflowId: number;
}
