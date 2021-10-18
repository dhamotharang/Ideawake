import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.THEME)
export class ThemeEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 250 })
  colorCode: string;
}
