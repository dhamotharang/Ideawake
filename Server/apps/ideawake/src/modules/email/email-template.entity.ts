import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.EMAIL_TEMPLATE)
export class EmailTemplateEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 250 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true, type: 'varchar', length: 2000 })
  description: string;

  @Column({ nullable: true, type: 'simple-array' })
  agendaTag: string[];

  @Column({ type: 'varchar', length: 250 })
  senderName: string;

  @Column({ type: 'varchar', length: 200 })
  senderEmail: string;
}
