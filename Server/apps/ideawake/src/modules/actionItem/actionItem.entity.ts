import { CommonEntity } from '../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.ACTION_ITEM)
export class ActionItemEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 250 })
  abbreviation: string;
}
