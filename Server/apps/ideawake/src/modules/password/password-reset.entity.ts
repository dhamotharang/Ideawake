import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.PASSWORD_RESET)
export class PasswordResetEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  resetCode: number;

  @Column({ nullable: true, type: 'timestamptz' })
  expiryDate: Date;

  @Column({ unique: true, type: 'varchar', length: 250 })
  userId;
}
