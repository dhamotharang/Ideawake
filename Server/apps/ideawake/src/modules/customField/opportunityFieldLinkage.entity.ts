import { CommonEntity } from '../../common/common.entity';
import { Entity, JoinColumn, ManyToOne, RelationId, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CustomFieldEntity } from './customField.entity';
import { CommunityEntity } from '../community/community.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';

@Entity(TABLES.OPPORTUNITY_FIELD_LINKAGE)
export class OpportunityFieldLinkageEntity extends CommonEntity {
  @ManyToOne(() => CustomFieldEntity)
  @JoinColumn()
  field: CustomFieldEntity;

  @RelationId(
    (oppFieldLinkage: OpportunityFieldLinkageEntity) => oppFieldLinkage.field,
  )
  fieldId: number;

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @RelationId(
    (cutsomFieldData: OpportunityFieldLinkageEntity) =>
      cutsomFieldData.opportunity,
  )
  opportunityId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (cutsomFieldData: OpportunityFieldLinkageEntity) =>
      cutsomFieldData.community,
  )
  communityId: number;

  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
    default: () => "'{}'",
  })
  fieldIntegrationType: string[];
}
