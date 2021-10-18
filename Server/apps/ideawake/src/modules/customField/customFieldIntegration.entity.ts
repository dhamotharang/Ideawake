import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CustomFieldEntity } from './customField.entity';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { VisibilityExpFieldIntegrationEnum } from '../../enum/visibility-exp-field-integration.enum';

@Entity(TABLES.CUSTOM_FIELD_INTEGRATION)
export class CustomFieldIntegrationEntity extends CommonEntity {
  @Column({
    type: 'integer',
    nullable: false,
  })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => CustomFieldEntity)
  @JoinColumn()
  field: CustomFieldEntity;

  @RelationId(
    (fieldIntegration: CustomFieldIntegrationEntity) => fieldIntegration.field,
  )
  fieldId: number;

  @Column({ nullable: true, type: 'integer' })
  order: number;

  @Column({
    type: 'enum',
    enum: VisibilityExpFieldIntegrationEnum,
    nullable: true,
  })
  visibilityExperience: VisibilityExpFieldIntegrationEnum;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId(
    (fieldIntegration: CustomFieldIntegrationEntity) =>
      fieldIntegration.community,
  )
  communityId: number;
}
