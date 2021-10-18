import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  // Column,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
// import { EntityTypeEntity } from '../entityType/entity.entity';
import { CommunityEntity } from '../community/community.entity';
import { StageEntity } from './stage.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { ActionItemEntity } from '../actionItem/actionItem.entity';
import { StatusEntity } from '../status/status.entity';

@Entity(TABLES.STAGE_HISTORY)
export class StageHistoryEntity extends CommonEntity {
  @ManyToOne(() => StageEntity)
  @JoinColumn()
  stage: StageEntity;

  @RelationId((history: StageHistoryEntity) => history.stage)
  stageId: number;

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @RelationId((history: StageHistoryEntity) => history.opportunity)
  opportunityId: number;

  @ManyToOne(() => ActionItemEntity)
  @JoinColumn()
  actionItem: ActionItemEntity;

  @RelationId((history: StageHistoryEntity) => history.actionItem)
  actionItemId: number;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @RelationId((history: StageHistoryEntity) => history.status)
  statusId: number;

  @Column({ nullable: false, type: 'json' })
  computeObject: {};

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => null,
    nullable: true,
  })
  enteringAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => null,
    nullable: true,
  })
  exitingAt: Date;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((history: StageHistoryEntity) => history.community)
  communityId: number;
}
