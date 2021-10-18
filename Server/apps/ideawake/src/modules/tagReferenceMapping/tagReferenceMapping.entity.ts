import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { TagEntity } from '../tag/tag.entity';

@Entity(TABLES.TAG_REFERENCE_MAPPING)
export class TagReferenceMappingEntity extends CommonEntity {
  // Relation
  @ManyToOne(() => TagEntity, tag => tag.id)
  @JoinColumn()
  tag: TagEntity;

  // Entity Relation
  @ManyToOne(() => EntityTypeEntity, en => en.id)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  entityObjectId: string;
}
