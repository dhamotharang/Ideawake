import { CommonEntity } from '../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.EVALUATION_TYPE)
export class EvaluationTypeEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 250 })
  icon: string;

  @Column({ type: 'varchar', length: 250 })
  color: string;

  @Column({ type: 'varchar', length: 250 })
  abbreviation: string;

  @Column({ type: 'text', nullable: true })
  exampleImageUrl: string;
}
