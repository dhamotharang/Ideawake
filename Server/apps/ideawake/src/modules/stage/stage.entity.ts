import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  OneToMany,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { StatusEntity } from '../status/status.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { ActionItemEntity } from '../actionItem/actionItem.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';

@Entity(TABLES.STAGE)
export class StageEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ nullable: true, type: 'varchar', length: 2000 })
  description: string;

  @Column({
    type: 'int8',
  })
  orderNumber: number;

  @ManyToOne(() => StatusEntity)
  @JoinColumn()
  status: StatusEntity;

  @RelationId((stage: StageEntity) => stage.status)
  statusId: number;

  @ManyToOne(() => WorkflowEntity)
  @JoinColumn()
  workflow: WorkflowEntity;

  @RelationId((stage: StageEntity) => stage.workflow)
  workflowId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((stage: StageEntity) => stage.community)
  communityId: number;

  @ManyToOne(() => ActionItemEntity)
  @JoinColumn()
  actionItem: ActionItemEntity;

  @OneToMany(() => OpportunityEntity, opp => opp.stage)
  opportunities: OpportunityEntity[];

  @Column({ type: 'text', nullable: true })
  oldPlatformId: string;
}
