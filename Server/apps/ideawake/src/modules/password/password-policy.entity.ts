import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.PASSWORD_POLICY)
export class PasswordPolicyEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 2000 })
  description: string;

  @Column({ nullable: true })
  min: number;

  @Column({ nullable: true })
  max: number;

  @Column({ nullable: true })
  required: boolean;
}
