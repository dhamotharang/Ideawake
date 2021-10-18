import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.ACTION_TYPE)
export class ActionTypeEntity extends CommonEntity {
  @Column({ unique: true, type: 'varchar', length: 250 })
  name: string;

  @Column({ unique: true, type: 'varchar', length: 250 })
  abbreviation: string;
}
