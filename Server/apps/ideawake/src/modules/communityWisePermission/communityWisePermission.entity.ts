import { CommonEntity } from '../../common/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TABLES } from '../../common/constants/constants';
import { CommunityEntity } from '../community/community.entity';
import { RoleEntity } from '../role/role.entity';

@Entity(TABLES.COMMUNITY_WISE_PERMISSION)
export class CommunityWisePermissionEntity extends CommonEntity {
  @ManyToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;

  @RelationId((perm: CommunityWisePermissionEntity) => perm.role)
  roleId: number;

  @ManyToOne(() => CommunityEntity)
  @JoinColumn()
  community: CommunityEntity;

  @RelationId((perm: CommunityWisePermissionEntity) => perm.community)
  communityId: number;

  // All Settings

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessSettings: number;

  // Community Settings

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessBasicSettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessAppearanceSettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessSecuritySettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessPointsSettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessIntegrations: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  manageScheduledEmails: number;

  @Column({
    type: 'int4',
    default: 0,
  })
  manageUserRoles: number;

  @Column({
    type: 'int4',
    default: 0,
  })
  archiveUser: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  manageJumbotron: number;

  // Tennant Settings

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  manageCommunities: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  manageBillingAndPlan: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  createNewCommunity: number;

  // Opportunity Types Management

  @Column({
    type: 'int4',
    default: 0,
  })
  manageOpportunityTypes: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  addOpportunityType: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editOpportunityType: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  deleteOpportunityType: number;

  // Basic Functionality

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  postOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  postChallenge: number;

  // Challenge Editing

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editChallengeDetails: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editChallengeSettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editChallengeTargetting: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editChallengePhaseWorkflow: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 1,
  })
  viewChallenge: number;

  // Prize Management

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  managePrize: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  awardPrize: number;

  // Opportunity Management

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  viewOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  addFilesToOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editOpportunitySettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  softDeleteOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  changeOpportunityStage: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  changeOpportunityWorkflow: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  addOpportunityOwner: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  removeOpportunityOwner: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  addOpportunityContributor: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  removeOpportunityContributor: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  addOpportunitySubmitter: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  removeOpportunitySubmitter: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  linkOpportunities: number;

  // Interact with Opportunities

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  mergeOpportunities: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  voteOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  followOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  bookmarkOpportunity: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  shareOpportunity: number;

  @Column({ type: 'int4', default: 0 })
  exportOpportunity: number;

  // Comment Management

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  postComments: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editComments: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  softDeleteComments: number;

  // @Mention

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  mentionUsers: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  mentionGroups: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  mentionChallengeUsers: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  mentionAllUsersInChallenge: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  mentionChallengeGroups: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  mentionAllGroupsInChallenge: number;

  // Custom Fields

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  accessCustomFieldSettings: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  createCustomField: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editCustomField: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editCustomFieldOptions: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  softDeleteCustomField: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  editCustomFieldData: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 0,
  })
  viewCustomFieldData: number;

  @Column({
    type: 'int4',
    nullable: true,
    default: 1,
  })
  viewStageSpecificTab: number;

  // Bookmarked Views

  @Column({
    type: 'smallint',
    default: 0,
  })
  viewBookmarkedView: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  manageBookmarkedView: number;

  // Announcements

  @Column({ type: 'smallint', default: 0 })
  viewAnnouncement: number;

  @Column({ type: 'smallint', default: 0 })
  manageAnnouncement: number;

  // Column Options
  @Column({ type: 'smallint', default: 0 })
  manageOpportunityColumns: number;

  // filter Options
  @Column({ type: 'smallint', default: 0 })
  manageOpportunityFilters: number;
}
