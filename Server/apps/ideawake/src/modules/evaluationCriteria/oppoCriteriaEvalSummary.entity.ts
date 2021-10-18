import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { EvaluationCriteriaEntity } from './evaluationCriteria.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';

@Entity(TABLES.OPPO_CRIT_EVAL_SUMMARY)
export class OppoCriteriaEvalSummaryEntity extends CommonEntity {
  @Column({ type: 'float', nullable: true })
  avgScore: number;

  @Column({ type: 'float', nullable: true })
  avgNormalizedScore: number;

  @Column({ type: 'json', nullable: true })
  scoreDetail: {};

  @Column({ type: 'float', nullable: true })
  variance: number;

  @Column({ type: 'json', nullable: true })
  respDistribution: {};

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

  @ManyToOne(() => EvaluationCriteriaEntity, { nullable: false })
  @JoinColumn()
  criteria: EvaluationCriteriaEntity;

  @Column()
  criteriaId: number;

  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;
}
