import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { EvaluationCriteriaEntity } from './evaluationCriteria.entity';

@Entity(TABLES.EVALUATION_CRITERIA_INTEGRATION)
export class EvaluationCriteriaIntegrationEntity extends CommonEntity {
  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'int4',
    nullable: true,
  })
  entityObjectId: number;

  @ManyToOne(() => EvaluationCriteriaEntity)
  @JoinColumn()
  evaluationCriteria: EvaluationCriteriaEntity;

  @Column({ nullable: false })
  order: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (
      evaluationCriteriaIntegrationEntity: EvaluationCriteriaIntegrationEntity,
    ) => evaluationCriteriaIntegrationEntity.community,
  )
  communityId: number;
  @RelationId(
    (
      evaluationCriteriaIntegrationEntity: EvaluationCriteriaIntegrationEntity,
    ) => evaluationCriteriaIntegrationEntity.evaluationCriteria,
  )
  evaluationCriteriaId: number;
  @RelationId(
    (
      evaluationCriteriaEntityIntegration: EvaluationCriteriaIntegrationEntity,
    ) => evaluationCriteriaEntityIntegration.entityType,
  )
  entityTypeId: number;
}
