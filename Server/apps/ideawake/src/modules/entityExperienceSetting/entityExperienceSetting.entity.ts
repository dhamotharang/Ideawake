import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { DefaultSort } from '../../enum/default-sort.enum';

@Entity(TABLES.ENTITY_EXPERIENCE_SETTING)
export class EntityExperienceSettingEntity extends CommonEntity {
  @Column({
    type: 'int4',
    nullable: false,
  })
  entityObjectId: number;

  @ManyToOne(() => EntityTypeEntity)
  @JoinColumn()
  entityType: EntityTypeEntity;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @Column({
    nullable: true,
    default: true,
  })
  allowVoting: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  allowCommenting: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  allowSharing: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  allowAnonymousIdea: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  allowAnonymousComment: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  allowAnonymousVote: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  defaultAnonymousSubmissions: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  defaultAnonymousComments: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  defaultAnonymousVotes: boolean;

  // opportunityType Experience Settings

  @Column({
    nullable: true,
    default: false,
  })
  allowOpportunityOwnership: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  assignOpportunitySubmitterAsOwner: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  allowOpportunityTeams: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  allowTeamBasedOpportunity: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  assignOpportunitySubmitterAsContributor: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  assignMergedContributorsToParent: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  allowOpportunityCosubmitters: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  assignMergedCosubmittersToParent: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  allowSubmissions: boolean;

  @Column({
    nullable: true,
    default: false,
  })
  displayAlert: boolean;

  @Column({
    type: 'enum',
    enum: DefaultSort,
    nullable: true,
  })
  defaultSort: DefaultSort;
}
