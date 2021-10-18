import { CommonEntity } from '../../common/common.entity';
import { Entity, ManyToOne, JoinColumn, Column, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { UserEntity } from '../user/user.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { CommunityEntity } from '../community/community.entity';

@Entity(TABLES.OPPORTUNITY_USER)
export class OpportunityUserEntity extends CommonEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @RelationId((oppUser: OpportunityUserEntity) => oppUser.user)
  userId: number;

  @ManyToOne(() => OpportunityEntity)
  @JoinColumn()
  opportunity: OpportunityEntity;

  @RelationId((oppUser: OpportunityUserEntity) => oppUser.opportunity)
  opportunityId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((oppUser: OpportunityUserEntity) => oppUser.community)
  communityId: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  message: string;

  @Column({
    type: 'enum',
    enum: OpportunityUserType,
  })
  opportunityUserType: OpportunityUserType;
}
