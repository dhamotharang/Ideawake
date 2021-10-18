import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { OpportunityTypeEntity } from '../opportunityType/opportunityType.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { UserAttachmentEntity } from '../userAttachment/userAttachment.entity';

@Entity(TABLES.OPPORTUNITY_ATTACHMENT)
export class OpportunityAttachmentEntity extends CommonEntity {
  @Column({ type: 'varchar', length: 250 })
  attachmentType: string;

  @ManyToOne(() => UserAttachmentEntity)
  @JoinColumn()
  userAttachment: UserAttachmentEntity;

  // @ManyToOne(
  //   () => OpportunityTypeEntity,
  //   opportunityType => opportunityType.typeId,
  //   { primary: true },
  // )
  // @JoinColumn({ name: 'type_id' })
  // opportunityType: OpportunityTypeEntity;
  @ManyToOne(() => OpportunityTypeEntity)
  @JoinColumn()
  opportunityType: OpportunityTypeEntity;

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @Column('text')
  url: string;

  @Column({
    nullable: true,
    type: 'int',
    default: 0,
  })
  size: number;

  @Column({
    nullable: false,
    type: 'smallint',
    default: 0,
  })
  isSelected: number;
}
