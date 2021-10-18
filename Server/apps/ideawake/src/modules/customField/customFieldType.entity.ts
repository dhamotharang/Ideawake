import { CommonEntity } from '../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CustomFieldCategory } from '../../enum/custom-field-category.enum';

@Entity(TABLES.CUSTOM_FIELD_TYPE)
export class CustomFieldTypeEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'varchar', length: 250 })
  abbreviation: string;

  @Column({ type: 'varchar', length: 250 })
  description: string;

  @Column({
    type: 'enum',
    enum: CustomFieldCategory,
    default: CustomFieldCategory.UserFields,
  })
  category: CustomFieldCategory;

  @Column({ type: 'varchar', length: 250 })
  icon: string;
}
