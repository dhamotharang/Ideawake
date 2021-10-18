import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EvaluationCriteriaEntity } from './evaluationCriteria.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { UserEntity } from '../user/user.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';

@Entity(TABLES.OPP_EVALUATION_RESPONSE)
export class OpportunityEvaluationResponseEntity extends CommonEntity {
  @ManyToOne(() => EvaluationCriteriaEntity)
  @JoinColumn()
  evaluationCriteria: EvaluationCriteriaEntity;

  @RelationId(
    (oppEvalResponseEntity: OpportunityEvaluationResponseEntity) =>
      oppEvalResponseEntity.evaluationCriteria,
  )
  evaluationCriteriaId: number;

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @RelationId(
    (oppEvalResponseEntity: OpportunityEvaluationResponseEntity) =>
      oppEvalResponseEntity.opportunity,
  )
  opportunityId: number;

  @Column({ type: 'integer', nullable: false })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @RelationId(
    (oppEvalResponseEntity: OpportunityEvaluationResponseEntity) =>
      oppEvalResponseEntity.user,
  )
  userId: number;

  @Column({ nullable: false, type: 'json' })
  criteriaRespData: {};

  @Column({ nullable: true, type: 'float' })
  finalScore: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (oppEvalResponseEntity: OpportunityEvaluationResponseEntity) =>
      oppEvalResponseEntity.community,
  )
  communityId: number;
}
