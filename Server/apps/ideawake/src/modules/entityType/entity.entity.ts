import { CommonEntity } from '../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.ENTITY_TYPE)
export class EntityTypeEntity extends CommonEntity {
  @Column({ unique: true, type: 'varchar', length: 250 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 250 })
  abbreviation: string;

  @Column({ unique: true, type: 'varchar', length: 250 })
  entityCode: string;

  @Column({ unique: true, type: 'varchar', length: 250 })
  entityTable: string;
}
