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
import { EvaluationTypeEntity } from './evaluationType.entity';
import { CommunityEntity } from '../community/community.entity';
import { OpportunityEvaluationResponseEntity } from './opportunityEvaluationResponse.entity';

@Entity(TABLES.EVALUATION_CRITERIA)
export class EvaluationCriteriaEntity extends CommonEntity {
  @ManyToOne(() => EvaluationTypeEntity)
  @JoinColumn()
  evaluationType: EvaluationTypeEntity;

  @Column({ type: 'text' })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: false, type: 'json' })
  criteriaObject: {};

  @Column({ nullable: false, type: 'float' })
  criteriaWeight: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (evaluationCriteriaEntity: EvaluationCriteriaEntity) =>
      evaluationCriteriaEntity.community,
  )
  communityId: number;

  @RelationId(
    (evaluationCriteriaEntity: EvaluationCriteriaEntity) =>
      evaluationCriteriaEntity.evaluationType,
  )
  evaluationTypeId: number;

  @OneToMany(
    () => OpportunityEvaluationResponseEntity,
    oppEvaluationResponse => oppEvaluationResponse.evaluationCriteria,
  )
  oppEvaluationResponse: OpportunityEvaluationResponseEntity[];

  @Column({ type: 'text', nullable: true })
  oldPlatformId: string;
}
