import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CustomFieldEntity } from './customField.entity';
import { CommunityEntity } from '../community/community.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';

@Entity(TABLES.CUSTOM_FIELD_DATA)
export class CustomFieldDataEntity extends CommonEntity {
  @ManyToOne(() => CustomFieldEntity)
  @JoinColumn()
  field: CustomFieldEntity;

  @RelationId((cutsomFieldData: CustomFieldDataEntity) => cutsomFieldData.field)
  fieldId: number;

  @Column({ nullable: false, type: 'json' })
  fieldData: {};

  @Column({ nullable: true, type: 'json' })
  history: {};

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @RelationId(
    (cutsomFieldData: CustomFieldDataEntity) => cutsomFieldData.opportunity,
  )
  opportunityId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (cutsomFieldData: CustomFieldDataEntity) => cutsomFieldData.community,
  )
  communityId: number;
}
