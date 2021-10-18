import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';

@Entity(TABLES.ENTITY_VISIBILITY_SETTING)
export class EntityVisibilitySettingEntity extends CommonEntity {
  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  roles: number[];

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  individuals: number[];

  @Column('integer', { array: true, nullable: true, default: () => "'{}'" })
  groups: number[];

  @Column({
    type: 'integer',
    nullable: false,
  })
  entityObjectId: number;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  entityType: EntityTypeEntity;

  @Column({
    nullable: true,
    default: false,
  })
  public: boolean;
}
