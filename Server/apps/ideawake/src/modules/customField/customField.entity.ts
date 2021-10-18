import { CommonEntity } from '../../common/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  Unique,
  OneToMany,
} from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { CustomFieldTypeEntity } from './customFieldType.entity';
import { CustomFieldDataEntity } from './customFieldData.entity';

@Entity(TABLES.CUSTOM_FIELD)
@Unique(['uniqueId', 'community'])
export class CustomFieldEntity extends CommonEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  placeholderText: string;

  @Column({ type: 'text' })
  uniqueId: string;

  @ManyToOne(() => CustomFieldTypeEntity)
  @JoinColumn()
  customFieldType: CustomFieldTypeEntity;

  @RelationId((customField: CustomFieldEntity) => customField.customFieldType)
  customFieldTypeId: number;

  @Column({ type: 'simple-json', nullable: true })
  fieldDataObject: {};

  @Column({ default: false })
  isRequired: boolean;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((customField: CustomFieldEntity) => customField.community)
  communityId: number;

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  editRoles: number[];

  @Column({ type: 'varchar', length: 250, default: 'Public' })
  editRolesText: string;

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  visibilityRoles: number[];

  @Column({ type: 'varchar', length: 250, default: 'Public' })
  visibilityRolesText: string;

  // TODO: use the following relation after impletenting FieldGroupModule
  // @ManyToOne(() => FieldGroupEntity)
  // @JoinColumn()
  // fieldGroup: FieldGroupEntity;

  // @RelationId((customField: CustomFieldEntity) => customField.fieldGroup)
  // fieldGroupId: number;
  @OneToMany(
    () => CustomFieldDataEntity,
    opportunityFieldData => opportunityFieldData.field,
  )
  opportunityFieldData: CustomFieldDataEntity[];

  @Column({ type: 'text', nullable: true })
  oldPlatformId: string;
}
