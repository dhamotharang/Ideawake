import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { OpportunityEntity } from './opportunity.entity';

@Entity(TABLES.LINKED_OPPORTUNITY)
@Index(['community', 'opportunity', 'linkedOpportunity'])
export class OpportunityLinkEntity extends CommonEntity {
  @Column({ type: 'text' })
  relation: string;

  @Index()
  @ManyToOne(() => CommunityEntity, { nullable: false })
  @JoinColumn()
  community: CommunityEntity;

  @Column()
  communityId: number;

  @Index()
  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @Column()
  opportunityId: number;

  @Index()
  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  linkedOpportunity: OpportunityEntity;

  @Column()
  linkedOpportunityId: number;
}
