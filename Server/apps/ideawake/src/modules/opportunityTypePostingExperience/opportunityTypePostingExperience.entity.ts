import { CommonEntity } from './../../common/common.entity';
import { Entity, Column } from 'typeorm';
import { TABLES } from '../../common/constants/constants';

@Entity(TABLES.OPPORTUNITY_TYPE_POSTING_EXPERIENCE)
export class OpportunityTypePostingExperienceEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;
}
