import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import {
  AssigneeSummaryInterface,
  CompletionStatsInterface,
} from './interface';

@Entity(TABLES.OPPO_EVAL_SUMMARY)
export class OppoEvaluationSummaryEntity extends CommonEntity {
  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'json', nullable: true })
  assignees: AssigneeSummaryInterface;

  @Column({ type: 'json', nullable: true })
  completionStats: CompletionStatsInterface;

  @ManyToOne(() => OpportunityEntity, { nullable: false })
  @JoinColumn()
  opportunity: OpportunityEntity;

  @Column()
  opportunityId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column()
  entityTypeId: number;

  @Column({ type: 'integer', nullable: true })
  entityObjectId: number;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;
}
