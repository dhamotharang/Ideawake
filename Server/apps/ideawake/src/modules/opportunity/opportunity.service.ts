import { Injectable, Logger } from '@nestjs/common';
import { OpportunityRepository } from './opportunity.repository';
import { OpportunityEntity } from './opportunity.entity';
import { Brackets, In, getRepository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import * as _ from 'lodash';
import { existsSync, mkdirSync, unlink } from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { CommunityWisePermissionEntity } from '../communityWisePermission/communityWisePermission.entity';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { EntityTypeService } from '../entityType/entity.service';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import {
  ACTION_TYPES,
  ENTITY_TYPES,
  PERMISSIONS_MAP,
  TABLES,
  MENTION_TYPES,
  ROLE_ABBREVIATIONS,
  CUSTOM_FIELD_TYPE_ABBREVIATIONS,
  REMINDER_FREQUENCY_MAPPING,
  ACTION_ITEM_ABBREVIATIONS,
  NON_PERMISSION_COLUMNS,
  INNO_BOT,
  EMAIL_BOOKMARKS,
  ENVIRONMENTS,
  EVALUATION_TYPE_ABBREVIATIONS,
} from '../../common/constants/constants';
import { CommunityActionPoints } from '../../shared/services/communityActionPoint.service';
import { UtilsService } from '../../providers/utils.service';
import { EntityVisibilitySettingService } from '../entityVisibilitySetting/entityVisibilitySetting.service';
import { RolesEnum } from '../../enum/roles.enum';
import { RoleService } from '../role/role.service';
import { OpportunityUserService } from '../opportunityUser/opportunityUser.service';
import { OpportunityUserType } from '../../enum/opportunity-user-type.enum';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { FollowingContentService } from '../followingContent/followingContent.service';
import { MentionService } from '../mention/mention.service';
import { StageAssignmentSettingService } from '../stage/stageAssignmentSettings.service';
import { StageNotificationSettingService } from '../stage/stageNotificationSetting.service';
import { StageAssigneeService } from '../stage/stageAssigneeSettings.service';
import { CommunityService } from '../community/community.service';
import { StageAssigneeSettingsTypeEnum } from '../../enum/stage-assignee-settings.enum';
import { UserService } from '../user/user.service';
import { ActionItemLogStatusEnum, RoleActorTypes, VoteType } from '../../enum';
import { CircleService } from '../circle/circle.service';
import * as camelcaseKeys from 'camelcase-keys';
import { OpportunityUserEntity } from '../opportunityUser/opportunityUser.entity';
import { CustomFieldDataService } from '../customField/customFieldData.service';
import { CommunityEntity } from '../community/community.entity';
import { OpportunityFieldLinkageService } from '../customField/opportunityFieldLinkage.service';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import * as moment from 'moment-timezone';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { AddStageAssignmentSettingsDto } from '../workflow/dto/AddStageAssignmentSettingsDto';
import { AddStageAssigneeSettingsDto } from '../workflow/dto/AddStageAssigneeSettingsDto';
import { StageAssigneeSettingsInterface } from '../stage/interface';
import { StageNotificationSettingsInterface } from '../stage/interface/stageNotificationSettings.interface';
import { VoteService } from '../vote/vote.service';
import { StageEntity } from '../stage/stage.entity';
import { EvaluationCriteriaService } from '../evaluationCriteria/evaluationCriteria.service';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { OpportunityEvaluationResponseService } from '../evaluationCriteria/opportunityEvaluationResponse.service';
import { BookmarkService } from '../bookmark/bookmark.service';
import { UserCircleService } from '../user/userCircle.service';
import { RoleActorsEntity } from '../roleActors/roleActors.entity';
import { EntityExperienceSettingEntity } from '../entityExperienceSetting/entityExperienceSetting.entity';
import { EntityVisibilitySettingEntity } from '../entityVisibilitySetting/entityVisibilitySetting.entity';
import { ConfigService } from '../../shared/services/config.service';
import { ExportOpportunitiesDto } from './dto';
import { TagService } from '../tag/tag.service';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { CommentService } from '../comment/comment.service';
import { CustomFieldService } from '../customField/customField.service';
import { decode } from 'he';
import { StageHistoryService } from '../stage/stageHistory.service';
import { StageAssigneeSettingsEntity } from '../stage/stageAssigneeSettings.entity';

@Injectable()
export class OpportunityService {
  private configService = new ConfigService();

  constructor(
    public readonly opportunityRepository: OpportunityRepository,
    public readonly roleActorService: RoleActorsService,
    public readonly entityTypeService: EntityTypeService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    public readonly entityVisibilitySettingService: EntityVisibilitySettingService,
    public readonly roleService: RoleService,
    public readonly opportunityUserService: OpportunityUserService,
    public readonly followingContentService: FollowingContentService,
    public readonly mentionService: MentionService,
    public readonly stageAssigneeService: StageAssigneeService,
    public readonly stageNotificationSettingService: StageNotificationSettingService,
    public readonly stageAssignmentSettingService: StageAssignmentSettingService,
    public readonly communityService: CommunityService,
    public readonly userService: UserService,
    public readonly circleService: CircleService,
    public readonly customFieldDataService: CustomFieldDataService,
    public readonly opportunityFieldLinkageService: OpportunityFieldLinkageService,
    public readonly customFieldIntegrationService: CustomFieldIntegrationService,
    public readonly customFieldService: CustomFieldService,
    public readonly roleActorsService: RoleActorsService,
    public readonly voteService: VoteService,
    public readonly evaluationCriteriaService: EvaluationCriteriaService,
    public readonly elasticSearchService: ElasticSearchService,
    private readonly opportunityEvaluationResponseService: OpportunityEvaluationResponseService,
    private readonly bookmarkService: BookmarkService,
    private readonly userCircleService: UserCircleService,
    private readonly tagService: TagService,
    private readonly awsS3Service: AwsS3Service,
    private readonly commentService: CommentService,
    private readonly stageHistoryService: StageHistoryService,
  ) {}

  async getCommentCount(options: {
    opportunityIds: number[];
    isDeleted?: boolean;
  }): Promise<{}[]> {
    if (!options.opportunityIds.length) return [];

    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select([
        'count(comment.id) AS comment',
        'opportunity.id',
        'opportunity.challenge',
      ])
      .leftJoin(
        'comment',
        'comment',
        `comment.entity_object_id::numeric = opportunity.id::numeric ${
          options.hasOwnProperty('isDeleted')
            ? `AND comment.isDeleted = :isDeleted`
            : ''
        }`,
        { isDeleted: options.isDeleted },
      )
      .where('opportunity.id IN (:...opportunityIds)', {
        opportunityIds: options.opportunityIds,
      })
      .groupBy('opportunity.id');

    return query.getRawMany();
  }

  async getOpportunityPermissionsBulk(params: {
    opportunityIds: number[];
    userId: number;
    community: number;
    includeStageTabPermissions?: boolean;
    includeExpSettings?: boolean;
    includeVisibilitySettings?: boolean;
  }): Promise<
    { permissions: CommunityWisePermissionEntity; opportunityId: number }[]
  > {
    // Get opportunities for the given ids.
    const opportunities = await this.getSimpleOpportunities({
      where: { id: In(params.opportunityIds), communityId: params.community },
    });

    // Calculate permissions if the opportunities are in the community.
    let finalPermissions = [];
    if (opportunities.length) {
      // Get community permissions.
      const communityPerms = await this.roleActorService.getEntityPermissions(
        null,
        null,
        params.community,
        { userId: params.userId },
      );
      let challengePermsGrouped = {};

      const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.CHALLENGE,
      );
      const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.IDEA,
      );

      // Get challenge permissions.
      const challengeIds = _.compact(
        opportunities.map(opportunity => opportunity.challengeId),
      );
      if (challengeIds.length) {
        const challengePermissions = await this.roleActorService.getEntityPermissionsBulk(
          challengeIds,
          challengeEntityType.id,
          params.community,
          params.userId,
        );
        challengePermsGrouped = _.keyBy(challengePermissions, 'entityObjectId');
      }

      // Get opportunities permissions.
      const opportunitiesPerms = await this.roleActorService.getEntityPermissionsBulk(
        params.opportunityIds,
        oppEntityType.id,
        params.community,
        params.userId,
      );
      const opportunitiesPermsGrouped = _.groupBy(
        opportunitiesPerms,
        'entityObjectId',
      );

      // Get opportunities experience settings.
      let oppExpSettingsGrouped: _.Dictionary<
        EntityExperienceSettingEntity[]
      > = {};
      if (params.includeExpSettings) {
        const oppExpSettings = await this.entityExperienceSettingService.getBulkEntityExperienceSetting(
          {
            where: {
              entityObjectIds: params.opportunityIds,
              entityType: oppEntityType.id,
              community: params.community,
            },
          },
        );
        oppExpSettingsGrouped = _.groupBy(oppExpSettings, 'entityObjectId');
      }

      // Get opportunities visibility settings.
      let visSettingsGrouped: _.Dictionary<
        EntityVisibilitySettingEntity[]
      > = {};
      let oppRoleActorsGrouped: _.Dictionary<RoleActorsEntity[]> = {};
      let challengeRoleActorsGrouped: _.Dictionary<RoleActorsEntity[]> = {};
      let userGroupIds = [];

      if (params.includeVisibilitySettings) {
        const visibilitySettings = await this.entityVisibilitySettingService.getEntityVisibilitySettings(
          {
            where: {
              entityObjectId: In(params.opportunityIds),
              entityType: oppEntityType.id,
            },
          },
        );
        visSettingsGrouped = _.groupBy(visibilitySettings, 'entityObjectId');

        // Get user's groups.
        const userGroups = await this.userCircleService.getUserCircles({
          where: { user: params.userId },
        });
        userGroupIds = _.map(userGroups, 'circleId');

        // Get user's roles for opportunities and their challenges.
        const oppRoleActors = await this.roleActorService.getEntityRoleActorsBulk(
          params.opportunityIds,
          oppEntityType.id,
          params.community,
          params.userId,
        );
        oppRoleActorsGrouped = _.groupBy(oppRoleActors, 'entityObjectId');

        if (challengeIds.length) {
          const challengeRoleActors = await this.roleActorService.getEntityRoleActorsBulk(
            challengeIds,
            challengeEntityType.id,
            params.community,
            params.userId,
          );
          challengeRoleActorsGrouped = _.groupBy(
            challengeRoleActors,
            'entityObjectId',
          );
        }
      }

      // Calculate permissions.
      finalPermissions = await Promise.all(
        opportunities.map(async opportunity => {
          const permissions = _.head(opportunitiesPermsGrouped[opportunity.id])
            .permissions;

          for (const permProperty of Object.getOwnPropertyNames(permissions)) {
            if (!NON_PERMISSION_COLUMNS.includes(permProperty)) {
              permissions[permProperty] = Math.max(
                permissions[permProperty],
                _.get(
                  challengePermsGrouped,
                  `${opportunity.challengeId}.permissions.${permProperty}`,
                  0,
                ),
                _.get(communityPerms, permProperty, 0),
              );
            }
          }

          // Opportunity edit permission.
          permissions.editOpportunity = UtilsService.checkScenarioPermission(
            permissions.editOpportunity,
            opportunity.userId === params.userId,
          );

          // checking visibility settings for viewing permissions
          if (
            params.includeVisibilitySettings &&
            permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO
          ) {
            const oppVisSettings = _.head(visSettingsGrouped[opportunity.id]);
            if (!oppVisSettings) {
              // if no visibility settings present, default to public
              permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW;
            } else {
              // if opportunity is public then allow viewing
              if (oppVisSettings.public) {
                permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW;
              }

              // if any of user's groups is in the opportunity's visibility settings'
              // groups then allow viewing
              if (
                permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
                oppVisSettings.groups &&
                oppVisSettings.groups.length
              ) {
                const diff = _.difference(oppVisSettings.groups, userGroupIds);
                if (diff.length < oppVisSettings.groups.length) {
                  permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
                }
              }

              // if user is in the opportunity's visibility settings' individuals
              // then allow viewing
              if (
                permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
                oppVisSettings.individuals &&
                oppVisSettings.individuals.length
              ) {
                const diff = _.difference(oppVisSettings.individuals, [
                  params.userId,
                ]);
                if (diff.length < oppVisSettings.individuals.length) {
                  permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
                }
              }

              // if user is in the opportunity's visibility settings' roles
              // then allow viewing
              if (
                permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
                oppVisSettings.roles &&
                oppVisSettings.roles.length
              ) {
                //
                const oppRoleIds = _.chain(oppRoleActorsGrouped)
                  .get(opportunity.id, [])
                  .map('roleId')
                  .value();
                const challengeRoleIds = _.chain(challengeRoleActorsGrouped)
                  .get(opportunity.challengeId, [])
                  .map('roleId')
                  .value();
                const roleIds = _.uniq([...oppRoleIds, ...challengeRoleIds]);

                const diff = _.difference(oppVisSettings.roles, roleIds);
                if (diff.length < oppVisSettings.roles.length) {
                  permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
                }
              }

              // if user doesn't come under any visibility settings then deny viewing
              if (permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO) {
                permissions.viewOpportunity = PERMISSIONS_MAP.DENY; // dont show
              }
            }
          }

          if (params.includeExpSettings) {
            // Permissions for experience settings.
            permissions.voteOpportunity = UtilsService.checkScenarioPermission(
              permissions.voteOpportunity,
              _.head(oppExpSettingsGrouped[opportunity.id]).allowVoting,
            );
            permissions.shareOpportunity = UtilsService.checkScenarioPermission(
              permissions.shareOpportunity,
              _.head(oppExpSettingsGrouped[opportunity.id]).allowSharing,
            );
            permissions.postComments = UtilsService.checkScenarioPermission(
              permissions.postComments,
              _.head(oppExpSettingsGrouped[opportunity.id]).allowCommenting,
            );
          }

          // Stage specific tab permissions.
          if (
            params.includeStageTabPermissions &&
            permissions.viewStageSpecificTab === PERMISSIONS_MAP.SCENARIO
          ) {
            if (opportunity.stageId) {
              const stageAssignees = await this.getCurrentStageAssignees(
                opportunity.id,
              );
              const assigneeIds = stageAssignees.map(
                assignee => assignee['id'],
              );
              if (assigneeIds.includes(params.userId)) {
                permissions.viewStageSpecificTab = PERMISSIONS_MAP.ALLOW;
              } else {
                permissions.viewStageSpecificTab = PERMISSIONS_MAP.DENY;
              }
            } else {
              permissions.viewStageSpecificTab = PERMISSIONS_MAP.DENY;
            }
          }

          return {
            permissions,
            opportunityId: opportunity.id,
          };
        }),
      );
    }

    return finalPermissions;
  }

  async getOpportunityPermissions(
    opportunityId: number,
    userId: number,
    returnWithOpportunityId?: boolean,
  ): Promise<CommunityWisePermissionEntity | {}> {
    const options = { userId };
    const opportunity = await this.getOneOpportunity({ id: opportunityId });
    const permissions = await this.roleActorService.getEntityPermissions(
      null,
      null,
      opportunity.communityId,
      options,
    );
    const otherPermissions = [];

    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    if (opportunity.challengeId) {
      otherPermissions.push(
        await this.roleActorService.getEntityPermissions(
          opportunity.challengeId,
          challengeEntityType.id,
          opportunity.communityId,
          options,
        ),
      );
    }

    otherPermissions.push(
      await this.roleActorService.getEntityPermissions(
        opportunityId,
        oppEntityType.id,
        opportunity.communityId,
        options,
      ),
    );
    for (const permProperty of Object.getOwnPropertyNames(permissions)) {
      for (const perm of otherPermissions) {
        permissions[permProperty] = Math.max(
          permissions[permProperty],
          perm[permProperty],
        );
      }
    }

    // checking visibility settings for viewing permissions
    if (permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO) {
      const visibilityPermissions = await this.entityVisibilitySettingService.getEntityVisibilitySetting(
        {
          where: {
            entityObjectId: opportunityId,
            entityType: oppEntityType.id,
          },
        },
      );
      if (!visibilityPermissions) {
        // if no visibility settings present, default to public
        permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW;
      } else {
        // if opportunity is public then allow viewing
        if (visibilityPermissions.public) {
          permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW;
        }

        // if any of user's groups is in the opportunity's visibility settings'
        // groups then allow viewing
        if (
          permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
          visibilityPermissions.groups &&
          visibilityPermissions.groups.length
        ) {
          const userGroups = await this.userCircleService.getUserCircles({
            where: { user: userId },
          });
          const userGroupIds = _.map(userGroups, 'circleId');
          const diff = _.difference(visibilityPermissions.groups, userGroupIds);
          if (diff.length < visibilityPermissions.groups.length) {
            permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
          }
        }

        // if user is in the opportunity's visibility settings' individuals
        // then allow viewing
        if (
          permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
          visibilityPermissions.individuals &&
          visibilityPermissions.individuals.length
        ) {
          const diff = _.difference(visibilityPermissions.individuals, [
            userId,
          ]);
          if (diff.length < visibilityPermissions.individuals.length) {
            permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
          }
        }

        // if user is in the opportunity's visibility settings' roles
        // then allow viewing
        if (
          permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO &&
          visibilityPermissions.roles &&
          visibilityPermissions.roles.length
        ) {
          let roles = (await this.roleActorService.getMyEntityRoles(
            opportunity.id,
            oppEntityType.id,
            opportunity.communityId,
            { user: userId },
          )).map(roleActor => roleActor.roleId);

          if (opportunity.challengeId) {
            const challengeRoles = (await this.roleActorService.getMyEntityRoles(
              opportunity.challengeId,
              challengeEntityType.id,
              opportunity.communityId,
              { user: userId },
            )).map(roleActor => roleActor.roleId);
            roles = [...roles, ...challengeRoles];
          }

          roles = _.uniq(roles);

          const diff = _.difference(visibilityPermissions.roles, roles);
          if (diff.length < visibilityPermissions.roles.length) {
            permissions.viewOpportunity = PERMISSIONS_MAP.ALLOW; // show
          }
        }

        // if user doesn't come under any visibility settings then deny viewing
        if (permissions.viewOpportunity === PERMISSIONS_MAP.SCENARIO) {
          permissions.viewOpportunity = PERMISSIONS_MAP.DENY; // dont show
        }
      }
    }
    permissions.editOpportunity = UtilsService.checkScenarioPermission(
      permissions.editOpportunity,
      opportunity.userId === userId,
    );

    const oppExpSettings = await this.entityExperienceSettingService.getEntityExperienceSetting(
      {
        where: {
          entityObjectId: opportunityId,
          entityType: oppEntityType.id,
          community: opportunity.communityId,
        },
      },
    );
    permissions.voteOpportunity = UtilsService.checkScenarioPermission(
      permissions.voteOpportunity,
      oppExpSettings.allowVoting,
    );
    permissions.shareOpportunity = UtilsService.checkScenarioPermission(
      permissions.shareOpportunity,
      oppExpSettings.allowSharing,
    );
    permissions.postComments = UtilsService.checkScenarioPermission(
      permissions.postComments,
      oppExpSettings.allowCommenting,
    );

    // Stage specific tab permissions.
    if (permissions.viewStageSpecificTab === PERMISSIONS_MAP.SCENARIO) {
      if (opportunity.stageId) {
        const stageAssignees = await this.getCurrentStageAssignees(
          opportunity.id,
        );
        const assigneeIds = stageAssignees.map(assignee => assignee['id']);
        if (assigneeIds.includes(userId)) {
          permissions.viewStageSpecificTab = PERMISSIONS_MAP.ALLOW;
        } else {
          permissions.viewStageSpecificTab = PERMISSIONS_MAP.DENY;
        }
      } else {
        permissions.viewStageSpecificTab = PERMISSIONS_MAP.DENY;
      }
    }

    if (returnWithOpportunityId) {
      return { opportunityId: opportunityId, permissions: permissions };
    }
    return permissions;
  }

  async getVoteCount(opportunityIds, voteType?: string): Promise<{}> {
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select([
        'count(vote.id) AS vote',
        'opportunity.id',
        'opportunity.challenge',
      ])
      .leftJoin(
        'vote',
        'vote',
        `vote.entity_object_id::numeric = opportunity.id::numeric AND vote.entity_type_id = :entityType ${
          voteType ? `AND vote.vote_type = '${voteType}'` : ''
        }`,
        {
          entityType: opportunityEntityType.id,
        },
      )
      .where('opportunity.id IN (:...opportunityIds)', {
        opportunityIds: opportunityIds,
      })
      .groupBy('opportunity.id') //
      .getRawMany();
  }

  /* FILTER OPPORTUNITIES */
  async getOpportunityCountsByDate(ids): Promise<any[]> {
    return this.opportunityRepository
      .createQueryBuilder(TABLES.OPPORTUNITY)
      .select([
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT CAST(${TABLES.OPPORTUNITY}.createdAt AS DATE)), ',') AS date`,
        `count(${TABLES.OPPORTUNITY}.id)::INTEGER`,
        // `ARRAY_AGG(${TABLES.OPPORTUNITY}.id) as ids`,
      ])

      .andWhere(ids ? `${TABLES.OPPORTUNITY}.id IN (:...ids)` : `1=1`, {
        ids: ids,
      })
      .groupBy(`CAST(${TABLES.OPPORTUNITY}.createdAt AS DATE)`)
      .getRawMany();
  }

  /**
   * Get current stage assignees (users) for given assignee settings.
   */
  async getAssigneesFromSettings(
    opportunityId: number,
    assigneeSetting: StageAssigneeSettingsInterface,
    community: number,
  ): Promise<Array<{}>> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: opportunityId, communityId: community },
      relations: [
        'opportunityUsers',
        'opportunityUsers.user',
        'opportunityUsers.user.profileImage',
      ],
    });
    let assignees = [];

    if (assigneeSetting && assigneeSetting.allMembers) {
      // Getting all community users.
      const communityData = await this.communityService.getCommunityUsers({
        communityId: opportunity.communityId,
      });
      assignees = assignees.concat(
        _.map(_.head(_.map(communityData, 'communityUsers')), 'user'),
      );
    } else if (assigneeSetting && !assigneeSetting.unassigned) {
      // Find group users
      if (assigneeSetting.groups && assigneeSetting.groups.length) {
        assignees = assignees.concat(
          await this.circleService.getCircleUsers({
            where: {
              id: In(assigneeSetting.groups),
              community: opportunity.communityId,
            },
          }),
        );
      }

      // Find individual users
      if (assigneeSetting.individuals && assigneeSetting.individuals.length) {
        assignees = assignees.concat(
          await this.userService.getUsers({
            where: { id: In(assigneeSetting.individuals) },
          }),
        );
      }

      // Find users for community roles
      assignees = assignees.concat(
        await this.getCommunityRolesAssignees(assigneeSetting, opportunity),
      );

      // Find users for opportunity roles
      assignees = assignees.concat(
        this.getOpportunityRoleAssignees(assigneeSetting, opportunity),
      );

      // Find custom field assignees
      if (assigneeSetting.customFieldAssignee) {
        assignees = assignees.concat(
          await this.getCustomFieldAssignees(assigneeSetting, opportunity),
        );
      }
    }

    const uniqUsers = _.uniqBy(assignees, 'id');
    const users = uniqUsers.length
      ? await this.userService.getUsersWithFilters({
          userIds: uniqUsers.map(user => user.id),
          communityId: opportunity.communityId,
          isDeleted: false,
        })
      : [];

    return users;
  }

  /**
   * Get stage assignees by custom field for given opportunity.
   * @param assigneeSetting Stage assignee settings.
   * @param opportunity Opportunity to find assignees for.
   */
  private async getCustomFieldAssignees(
    assigneeSetting: StageAssigneeSettingsInterface,
    opportunity: OpportunityEntity,
  ): Promise<UserEntity[]> {
    let assignees = [];
    const fieldData = await this.customFieldDataService.getCustomFieldData({
      where: {
        field: assigneeSetting.customFieldAssignee['fieldId'],
        opportunity: opportunity.id,
      },
      relations: ['field', 'field.customFieldType'],
    });

    let fieldUsers = [];
    let fieldGroups = [];
    if (fieldData && fieldData.length && fieldData[0].fieldData) {
      assigneeSetting.customFieldAssignee['options']
        .filter(
          (fieldAssignee: {}) =>
            // Filter selected value for Multi Select type field.
            (fieldData[0].field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT &&
              fieldData[0].fieldData['selected'].includes(
                fieldAssignee['value'],
              )) ||
            // Filter selected value for Single Select type field.
            (fieldData[0].field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT &&
              fieldData[0].fieldData['selected'] === fieldAssignee['value']) ||
            // Filter selected value for Community User or Group type field.
            (fieldData[0].field.customFieldType.abbreviation ===
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.USER_GROUP &&
              fieldData[0].fieldData['selected'].find(
                val =>
                  val['id'] == fieldAssignee['value'] &&
                  val['type'].toLowerCase() ===
                    fieldAssignee['value_type'].toLowerCase(),
              )),
        )
        .map(val => {
          fieldUsers = fieldUsers.concat(val['users'] || []);
          fieldGroups = fieldGroups.concat(val['groups'] || []);
        });
    }

    // Find selected groups' users
    if (fieldGroups && fieldGroups.length) {
      assignees = assignees.concat(
        await this.circleService.getCircleUsers({
          where: {
            id: In(fieldGroups),
            community: opportunity.communityId,
          },
        }),
      );
    }

    // Find selected users
    if (fieldUsers && fieldUsers.length) {
      assignees = assignees.concat(
        await this.userService.getUsers({
          where: { id: In(fieldUsers) },
          relations: ['profileImage'],
        }),
      );
    }

    return assignees;
  }

  /**
   * Get stage assignees by opportunity level roles for given opportunity.
   * @param assigneeSetting Stage assignee settings.
   * @param opportunity Opportunity to find assignees for.
   */
  private getOpportunityRoleAssignees(
    assigneeSetting: StageAssigneeSettingsInterface,
    opportunity: OpportunityEntity,
  ): UserEntity[] {
    let assignees = [];
    const oppUsersAbbr = [];
    if (assigneeSetting.opportunityOwners)
      oppUsersAbbr.push(OpportunityUserType.OWNER);
    if (assigneeSetting.opportunityTeams)
      oppUsersAbbr.push(OpportunityUserType.CONTRIBUTOR);
    if (assigneeSetting.opportunitySubmitters)
      oppUsersAbbr.push(OpportunityUserType.SUBMITTER);

    if (oppUsersAbbr.length) {
      const oppUsers = opportunity.opportunityUsers.filter(opUser =>
        oppUsersAbbr.includes(opUser.opportunityUserType),
      );
      assignees = _.map(oppUsers, 'user') || [];
    }
    return assignees;
  }

  /**
   * Get stage assignees by community level roles for given opportunity.
   * @param assigneeSetting Stage assignee settings.
   * @param opportunity Opportunity to find assignees for.
   */
  private async getCommunityRolesAssignees(
    assigneeSetting: StageAssigneeSettingsInterface,
    opportunity: OpportunityEntity,
  ): Promise<UserEntity[]> {
    let assignees = [];
    const commRolesAbbr = [];
    if (assigneeSetting.communityAdmins)
      commRolesAbbr.push(ROLE_ABBREVIATIONS.ADMIN);
    if (assigneeSetting.communityModerators)
      commRolesAbbr.push(ROLE_ABBREVIATIONS.MODERATOR);
    if (assigneeSetting.communityUsers)
      commRolesAbbr.push(ROLE_ABBREVIATIONS.USER);

    if (commRolesAbbr.length) {
      const roles = await this.roleService.getRoles({
        where: {
          community: opportunity.communityId,
          abbreviation: In(commRolesAbbr),
        },
      });
      const roleActorIds = _.map(
        await this.roleActorService.getRoleActors({
          where: {
            actorType: RoleActorTypes.USER,
            role: In(roles.map(role => role.id)),
            community: opportunity.communityId,
          },
        }),
        'actorId',
      );
      if (roleActorIds && roleActorIds.length) {
        assignees = assignees.concat(
          await this.userService.getUsers({
            where: { id: In(roleActorIds) },
            relations: ['profileImage'],
          }),
        );
      }
    }
    return assignees;
  }

  /**
   * Get current stage assignees (users) for given entity opportunity.
   */

  async getCurrentStageAssignees(
    id: number,
    returnOpportunityId?: boolean,
    community?: number,
  ): Promise<{}[]> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id, ...(community && { communityId: community }) },
      relations: ['stage'],
    });
    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    let assignees = [];
    if (opportunity.stage) {
      const assigneeSetting = await this.stageAssigneeService.getStageAssigneeSetting(
        {
          entityObjectId: opportunity.id,
          entityType: oppoEntityType,
          community: opportunity.communityId,
          settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
        },
      );

      assignees = await this.getAssigneesFromSettings(
        id,
        assigneeSetting,
        opportunity.communityId,
      );
    }
    if (returnOpportunityId) {
      return [{ opportunityId: id, assignees }];
    }
    return assignees;
  }

  /**
   * Get current stage assignee settings for opportunities list.
   * @param options Options to search opportunities on.
   */
  async getCurrStageAssigneeForList(options: {
    opportunityIds: number[];
    communityId: number;
    includeRawSetting?: boolean;
  }): Promise<
    {
      opportunityId: number;
      assignees?: {};
      rawSetting?: StageAssigneeSettingsEntity;
    }[]
  > {
    // If no opportunity ids given, return empty.
    if (!_.get(options.opportunityIds, 'length')) return [];

    const opportunities = await this.opportunityRepository.find({
      where: {
        id: In(options.opportunityIds),
        communityId: options.communityId,
      },
    });

    // If no opportunity found in the given community, return empty.
    if (!_.get(opportunities, 'length')) return [];

    const oppoIdsWithStages = opportunities
      .filter(oppo => oppo.stageId)
      .map(oppo => oppo.id);

    // If no opportunity has a stage attached, return without checking the
    // assignee settings.
    if (!oppoIdsWithStages.length)
      return opportunities.map(oppo => ({ opportunityId: oppo.id }));

    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const assigneeSettings = await this.stageAssigneeService.getStageAssigneeSettings(
      {
        entityObjectId: In(oppoIdsWithStages),
        entityType: oppoEntityType,
        community: options.communityId,
        settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
      },
    );
    const assSettingsByOppId = _.keyBy(assigneeSettings, 'entityObjectId');

    // Fetching custom fields data and related assignee settings.
    const assSettingsWithFields = assigneeSettings.filter(ass =>
      _.get(ass, 'customFieldAssignee.fieldId'),
    );
    let groupIds = [];
    let userIds = [];
    let fieldsDataByField = {};
    if (_.get(assSettingsWithFields, 'length')) {
      assSettingsWithFields.forEach(setting => {
        userIds = userIds.concat(
          _.map(_.get(setting.customFieldAssignee, 'options', []), 'users'),
        );
        groupIds = groupIds.concat(
          _.map(_.get(setting.customFieldAssignee, 'options', []), 'groups'),
        );
      });
      const fieldsData = await this.customFieldDataService.getCustomFieldData({
        where: assSettingsWithFields.map(setting => ({
          field: setting.customFieldAssignee['fieldId'],
          opportunity: setting.entityObjectId,
        })),
        relations: ['field', 'field.customFieldType'],
      });
      fieldsDataByField = _.keyBy(fieldsData, 'field.id');
    }

    // Fetching groups and users.
    groupIds = _.compact(
      _.uniq(
        _.concat(
          _.flatten(groupIds),
          _.flatten(assigneeSettings.map(ass => ass.groups)),
        ),
      ),
    );
    const groups = groupIds.length
      ? await this.circleService.getCircles({
          where: {
            id: In(groupIds),
            community: options.communityId,
          },
        })
      : [];
    const groupsById = _.keyBy(groups, 'id');

    userIds = _.compact(
      _.uniq(
        _.concat(
          _.flatten(userIds),
          _.flatten(assigneeSettings.map(ass => ass.individuals)),
        ),
      ),
    );
    const users = userIds.length
      ? await this.userService.getCommunityUsers({
          userIds,
          communityId: options.communityId,
          isDeleted: false,
        })
      : [];
    const usersById = _.keyBy(users, 'id');

    return opportunities.map(opportunity => {
      const rawSetting = _.get(assSettingsByOppId, opportunity.id);
      const setting = _.cloneDeep(rawSetting);

      if (setting) {
        // Selecting users & groups based on custom field data.
        if (
          _.get(setting, 'customFieldAssignee.fieldId') &&
          _.get(setting, 'customFieldAssignee.options') &&
          _.get(
            fieldsDataByField,
            `${setting.customFieldAssignee['fieldId']}.fieldData`,
          )
        ) {
          const fData =
            fieldsDataByField[setting.customFieldAssignee['fieldId']];
          _.filter(
            setting.customFieldAssignee['options'],
            (fieldAssignee: {}) =>
              // Filter selected value for Multi Select type field.
              (fData.field.customFieldType.abbreviation ===
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT &&
                fData.fieldData['selected'].includes(fieldAssignee['value'])) ||
              // Filter selected value for Single Select type field.
              (fData.field.customFieldType.abbreviation ===
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT &&
                fData.fieldData['selected'] === fieldAssignee['value']) ||
              // Filter selected value for Community User or Group type field.
              (fData.field.customFieldType.abbreviation ===
                CUSTOM_FIELD_TYPE_ABBREVIATIONS.USER_GROUP &&
                fData.fieldData['selected'].find(
                  val =>
                    val['id'] == fieldAssignee['value'] &&
                    val['type'].toLowerCase() ===
                      fieldAssignee['value_type'].toLowerCase(),
                )),
          ).forEach(fieldSetting => {
            setting.individuals = _.concat(
              setting.individuals,
              _.map(fieldSetting['users'], id => parseInt(id)),
            );
            setting.groups = _.concat(
              setting.groups,
              _.map(fieldSetting['groups'], id => parseInt(id)),
            );
          });
        }

        // Getting user and group objects for the selected assignees.
        setting.groups = _.compact(
          _.map(_.uniq(setting.groups), groupId => _.get(groupsById, groupId)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;
        setting.individuals = _.compact(
          _.map(_.uniq(setting.individuals), userId =>
            _.get(usersById, userId),
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;
      }

      return {
        opportunityId: opportunity.id,
        ...(opportunity.stageId && setting && { assignees: setting }),
        ...(options.includeRawSetting && { rawSetting }),
      };
    });
  }

  /**
   * Get role actors (users) for all opportunity roles grouped by roles.
   * @param params Opportunity options to get role actors for.
   */
  async getOpportunityRoleActors(params: {
    community: number;
    entityType?: number;
    entityObjectId?: number;
  }): Promise<{}> {
    // Find users for all opportunity roles.
    const roles = await this.roleService.getRoles({
      where: {
        community: params.community,
        abbreviation: In([
          ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER,
          ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR,
          ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER,
        ]),
      },
    });
    const roleActors = await this.roleActorsService.getRoleActors({
      where: {
        actorType: RoleActorTypes.USER,
        role: In(roles.map(role => role.id)),
        ...(params.entityType && { entityType: params.entityType }),
        ...(params.entityObjectId && { entityObjectId: params.entityObjectId }),
      },
    });

    const roleActorsGroupedByIds = _.groupBy(roleActors, 'roleId');
    const roleActorsGrouped = {};
    _.map(roleActorsGroupedByIds, (val, key) => {
      roleActorsGrouped[
        roles.find(r => r.id == parseInt(key)).abbreviation
      ] = _.uniqBy(val, 'actorId');
    });

    return roleActorsGrouped;
  }

  /**
   * Get opportunities
   */
  async getOneOpportunity(options: {}): Promise<OpportunityEntity> {
    return this.opportunityRepository.findOne({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }

  /**
   * Get opportunities
   */
  async getOpportunities(options: {}): Promise<OpportunityEntity[]> {
    return this.opportunityRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }

  /**
   * Get opportunities' count.
   * @param options Options to search opportunities on.
   * @returns Count of opportunties.
   */
  async getOpportunitiesCount(options: {}): Promise<number> {
    return this.opportunityRepository.count({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }
  /**
   * Get opportunities
   */
  async getOpportunityCount(options: {}): Promise<number> {
    return this.opportunityRepository.count({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }
  /**
   * Get opportunities
   */
  async getOpportunitiesWithCount(options: {}): Promise<
    [OpportunityEntity[], number]
  > {
    return this.opportunityRepository.findAndCount({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }

  async getSimpleOpportunities(options: {}): Promise<OpportunityEntity[]> {
    return this.opportunityRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'opportunity',
        ),
      }),
    });
  }

  /**
   * Update raw opportunity.
   * @param options Find Options to search opportunity on.
   * @param data Data to update.
   */
  async updateRawOpportunity(options: {}, data: {}): Promise<{}> {
    return this.opportunityRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'opportunity'),
      UtilsService.replaceJoinColumnsForQueries(data, 'opportunity'),
    );
  }

  /**
   * Search opportunities
   */
  async searchOpportunitiesWithCount(options: {
    mainTableWhereFilters: {};
    take: number;
    skip: number;
    orderBy?: {};
    statuses?: [];
    tags?: [];
  }): Promise<[OpportunityEntity[], number]> {
    const searchText = options.mainTableWhereFilters['search'];
    delete options.mainTableWhereFilters['search'];

    const transformedFilters = UtilsService.replaceJoinColumnsForQueries(
      options.mainTableWhereFilters,
      'opportunity',
    );

    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.community', 'community')
      .leftJoinAndSelect('opportunity.user', 'user')
      .leftJoinAndSelect('opportunity.opportunityType', 'opportunityType')
      .leftJoinAndSelect(
        'opportunity.opportunityAttachments',
        'opportunityAttachments',
      )
      .leftJoinAndSelect('opportunity.challenge', 'challenge')
      .leftJoinAndSelect('opportunity.opportunityUsers', 'opportunityUsers')
      .leftJoinAndSelect('opportunity.stage', 'stage')
      .leftJoinAndSelect('opportunity.workflow', 'workflow')

      .leftJoinAndSelect('opportunityUsers.user', 'opportunityUser')
      .leftJoinAndSelect(
        'opportunityUser.profileImage',
        'opportunityUserProfileImage',
      )
      .leftJoinAndSelect('user.profileImage', 'profileImage')
      .leftJoinAndSelect(
        'opportunityAttachments.userAttachment',
        'userAttachment',
      )
      .leftJoinAndSelect('stage.actionItem', 'actionItem')
      .leftJoinAndSelect('stage.status', 'status')
      .where(transformedFilters);

    if (_.get(options.statuses, 'length')) {
      query.andWhere(`status.id IN (:...status)`, { status: options.statuses });
    }

    if (options.tags && options.tags.length) {
      query.andWhere(':tags && opportunity.tags', {
        tags: options.tags,
      });
    }

    if (searchText) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('opportunity.title ILIKE :title', {
            title: `%${searchText}%`,
          }).orWhere('opportunity.description ILIKE :description', {
            description: `%${searchText}%`,
          });
        }),
      );
    }

    const result = query
      .take(options.take)
      .skip(options.skip)
      .orderBy(options.orderBy)
      .getManyAndCount();
    return result;
  }

  /**
   * Search opportunities
   */
  async searchOpportunitiesWithCountOptimize(options: {
    mainTableWhereFilters: {};
    orderBy?: {};
    statuses?: [];
    tags?: [];
    challenges?: [];
  }): Promise<OpportunityEntity[]> {
    const searchText = options.mainTableWhereFilters['search'];
    delete options.mainTableWhereFilters['search'];

    const transformedFilters = UtilsService.replaceJoinColumnsForQueries(
      options.mainTableWhereFilters,
      'opportunity',
    );

    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .where(transformedFilters);

    if (_.get(options.statuses, 'length')) {
      // Add stage & status joins if status filter is present;
      query
        .leftJoin('opportunity.stage', 'stage')
        .leftJoin('stage.status', 'status');

      // Query for given statuses
      query.andWhere(`status.id IN (:...status)`, { status: options.statuses });
    }
    if (options.tags && options.tags.length) {
      query.andWhere(':tags && opportunity.tags', {
        tags: options.tags,
      });
    }
    if (searchText) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('opportunity.title ILIKE :title', {
            title: `%${searchText}%`,
          }).orWhere('opportunity.description ILIKE :description', {
            description: `%${searchText}%`,
          });
        }),
      );
    }

    if (options.challenges && options.challenges.length) {
      query.andWhere(
        new Brackets(qb => {
          const chs = options.challenges.filter(ch => ch !== null);
          if (chs.length) {
            qb.where('opportunity.challengeId IN (:...challengeIds)', {
              challengeIds: chs,
            });
          }
          if (_.includes(options.challenges, null)) {
            qb.orWhere('opportunity.challengeId ISNULL');
          }
        }),
      );
    }

    return query.orderBy(options.orderBy).getMany();
  }

  /**
   * Search opportunities
   */
  async searchOpportunitiesDetailsOptimize(options: {
    community?: boolean;
    user?: boolean;
    opportunityType?: boolean;
    opportunityAttachments?: boolean;
    challenge?: boolean;
    opportunityUsers?: boolean;
    stage?: boolean;
    workflow?: boolean;
    actionItem?: boolean;
    status?: boolean;
    whereClause: {};
  }): Promise<OpportunityEntity[]> {
    const transformedWhere = UtilsService.replaceJoinColumnsForQueries(
      options.whereClause,
      'opportunity',
    );

    const query = this.opportunityRepository.createQueryBuilder('opportunity');
    if (options.community) {
      query.leftJoinAndSelect('opportunity.community', 'community');
    }
    if (options.user) {
      query
        .leftJoinAndSelect('opportunity.user', 'user')
        .leftJoinAndSelect('user.profileImage', 'profileImage');
    }
    if (options.opportunityType) {
      query.leftJoinAndSelect('opportunity.opportunityType', 'opportunityType');
    }
    if (options.opportunityAttachments) {
      query.leftJoinAndSelect(
        'opportunity.opportunityAttachments',
        'opportunityAttachments',
      );
    }
    if (options.challenge) {
      query.leftJoinAndSelect('opportunity.challenge', 'challenge');
    }
    if (options.opportunityUsers) {
      query
        .leftJoinAndSelect('opportunity.opportunityUsers', 'opportunityUsers')
        .leftJoinAndSelect('opportunityUsers.user', 'opportunityUser')
        .leftJoinAndSelect(
          'opportunityUser.profileImage',
          'opportunityUserProfileImage',
        );
    }
    if (options.stage) {
      query
        .leftJoinAndSelect('opportunity.stage', 'stage')
        .leftJoinAndSelect('stage.actionItem', 'actionItem')
        .leftJoinAndSelect('stage.status', 'status');
    }
    if (options.workflow) {
      query.leftJoinAndSelect('opportunity.workflow', 'workflow');
    }
    if (options.opportunityAttachments) {
      query.leftJoinAndSelect(
        'opportunityAttachments.userAttachment',
        'userAttachment',
      );
    }

    return query.where(transformedWhere).getMany();
  }

  /**
   * Search Duplicate Opportunites.
   * @param params Search Params (including title, description, community and others).
   */
  async searchDuplciateOpportunities(params: {
    title?: string;
    description?: string;
    challenge?: number;
    opportunityTypes?: number[];
    userId: number;
    community: number;
  }): Promise<{ opportunities: OpportunityEntity[]; total: number }> {
    try {
      const rawResults = await this.elasticSearchService.searchDuplicateOpportunities(
        {
          queries: [params.title, params.description],
          community: params.community,
          isDeleted: false,
          challenge: params.challenge,
          opportunityTypes: params.opportunityTypes,
          fields: ['title', 'description'],
        },
      );

      const searchResults = _.uniqBy(rawResults.results, 'result.id');

      // Checking permissions for visibility of the results.
      const defaultFalsyPerm = {
        permissions: { viewOpportunity: false, viewChallenge: false },
      };
      let oppoVisbleResults = [];

      // Filtering out the opportunities that are not visible to user.
      if (searchResults.length) {
        const permissions = await this.getOpportunityPermissionsBulk({
          opportunityIds: searchResults.map(oppRes =>
            parseInt(oppRes.result['id']),
          ),
          userId: params.userId,
          community: params.community,
          includeVisibilitySettings: true,
          includeStageTabPermissions: false,
          includeExpSettings: false,
        });
        const oppoPermissionsGrouped = _.keyBy(permissions, 'opportunityId');

        oppoVisbleResults = searchResults.filter(
          oppRes =>
            _.get(oppoPermissionsGrouped, oppRes.result['id'], defaultFalsyPerm)
              .permissions.viewOpportunity,
        );
      }

      const opportunities = oppoVisbleResults.length
        ? await this.getSimpleOpportunities({
            where: {
              id: In(oppoVisbleResults.map(res => res.result['id'])),
              isDeleted: false,
              draft: false,
              community: params.community,
            },
            relations: [
              'opportunityType',
              'opportunityAttachments',
              'stage',
              'stage.status',
            ],
          })
        : [];

      const opportunitiesGrouped = _.keyBy(opportunities, 'id');

      const finalResults = [];

      // Transforming the results.
      searchResults.forEach(result => {
        if (opportunitiesGrouped[result.result['id']]) {
          finalResults.push(opportunitiesGrouped[result.result['id']]);
        }
      });

      return {
        opportunities: finalResults,
        total: finalResults.length,
      };
    } catch (error) {
      Logger.error(
        'ERROR in Ideawake Opportunity Service (Search Duplicates)',
        error,
      );
      throw error;
    }
  }

  /**
   * Add opportunity
   */
  async addOpportunity(params: {
    data: {};
    actorData;
    ignoreSubmitter?: boolean;
    ignoreNotifications?: boolean;
  }): Promise<OpportunityEntity> {
    const entityExperienceSetting =
      params.data['entityExperienceSetting'] || {};
    const opportunityTypeFieldsData = _.cloneDeep(
      params.data['opportunityTypeFieldsData'],
    );
    delete params.data['opportunityTypeFieldsData'];
    delete params.data['entityExperienceSetting'];
    const mentions = params.data['mentions'] || [];
    params.data['mentions'] = [];

    const transformedData = UtilsService.replaceJoinColumnsForQueries(
      params.data,
      'opportunity',
    );

    const opportunityCreated = this.opportunityRepository.create(
      transformedData,
    );
    const opportunityAddedData = await this.opportunityRepository.save(
      opportunityCreated,
    );
    const savedOpportunity = await this.getOneOpportunity({
      where: { id: opportunityAddedData.id },
      relations: ['community'],
    });
    this.elasticSearchService.addOpportunityData(savedOpportunity);
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    // add mentions
    let addedMentions = [];
    if (mentions && mentions.length) {
      mentions.map(async mention => {
        mention['entityObjectId'] = opportunityAddedData.id;
        mention['entityType'] = oppEntityType.id;
        mention['community'] = params.data['community'];
      });
      addedMentions = await this.mentionService.bulkAddMentions(mentions);

      const addedMentionsIds = addedMentions.map(mention => mention.id);
      await this.opportunityRepository.update(
        { id: opportunityAddedData.id },
        { mentions: addedMentionsIds },
      );
      opportunityAddedData.mentions = addedMentionsIds;
    }

    // add opportunity submitter
    if (!params.ignoreSubmitter) {
      await this.opportunityUserService.addOpportunityUserWithSetting(
        [
          {
            user: params.actorData.id,
            opportunity: opportunityAddedData.id,
            community: opportunityAddedData.communityId,
            message: 'Original Submitter',
            opportunityUserType: OpportunityUserType.SUBMITTER,
          },
        ],
        params.actorData,
        false,
      );
    }

    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );

    // save opportunity experience/collaboration settings
    if (opportunityAddedData.challengeId) {
      const challengeExpSettings = await this.entityExperienceSettingService.getEntityExperienceSetting(
        {
          where: {
            entityObjectId: opportunityAddedData.challengeId,
            entityType: challengeEntityType.id,
            community: opportunityAddedData.communityId,
          },
        },
      );

      await this.entityExperienceSettingService.addEntityExperienceSetting({
        ...challengeExpSettings,
        id: undefined,
        entityType: oppEntityType,
        entityObjectId: opportunityAddedData.id,
        community: opportunityAddedData.communityId,
      });
    } else {
      await this.entityExperienceSettingService.addEntityExperienceSetting({
        ...entityExperienceSetting,
        entityType: oppEntityType,
        entityObjectId: opportunityAddedData.id,
        community: opportunityAddedData.communityId,
      });
    }

    // save opportunity visibility settings
    this.addOpportunityVisbilitySettings(
      opportunityAddedData,
      params.data['challenge'],
    );

    // assign points
    const points = await CommunityActionPoints.addUserPoints({
      actionType: ACTION_TYPES.POST,
      entityTypeName: ENTITY_TYPES.IDEA,
      community: params.data['community'],
      userId: params.actorData.id,
      entityObjectId: opportunityCreated.id,
    });

    // Saving opportunity's custom fields data.
    const linkedFields = [];

    if (opportunityTypeFieldsData && opportunityTypeFieldsData.length) {
      _.forEach(
        opportunityTypeFieldsData,
        (val: {
          field: number;
          fieldData: object;
          opportunity: number;
          community: number | CommunityEntity;
        }) => {
          val.opportunity = opportunityAddedData.id;
          val.community = opportunityAddedData.communityId;

          linkedFields.push({
            opportunity: opportunityAddedData.id,
            field: parseInt(val.field.toString()),
            community: opportunityAddedData.communityId,
            fieldIntegrationType: [
              FieldIntegrationTypeEnum.OPP_TYPE_SUBMISSION_FORM,
            ],
          });
        },
      );

      await this.customFieldDataService.addCustomFieldData(
        opportunityTypeFieldsData,
      );
    }

    // Link fields integrated with challenge or opportunity type. (Challenge's
    // fields are prefered oven opportunity type's.)
    const alreadyLinkedFields = linkedFields.map(
      linkedField => linkedField.field,
    );
    const oppTypeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );

    const oppTypeFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityType: opportunityAddedData.challengeId
          ? challengeEntityType
          : oppTypeEntityType,
        entityObjectId: opportunityAddedData.challengeId
          ? opportunityAddedData.challengeId
          : opportunityAddedData.opportunityTypeId,
        community: opportunityAddedData.communityId,
      },
    );
    oppTypeFields.forEach(typeField => {
      if (!alreadyLinkedFields.includes(typeField.fieldId)) {
        linkedFields.push({
          opportunity: opportunityAddedData.id,
          field: typeField.fieldId,
          community: opportunityAddedData.communityId,
          fieldIntegrationType: [
            FieldIntegrationTypeEnum.OPP_TYPE_SUBMISSION_FORM,
          ],
        });
      }
    });

    // Save linked opportunity fields.
    if (linkedFields.length) {
      this.opportunityFieldLinkageService.bulkAddOpportunityFieldLinkage(
        linkedFields,
      );
    }

    // Generate activity log.
    params.actorData['community'] = params.data['community'];
    const userEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.USER,
    );
    NotificationHookService.notificationHook({
      actionData: {
        ...opportunityAddedData,
        entityObjectId: opportunityAddedData.id,
        entityType: oppEntityType.id,
      },
      actorData: params.actorData,
      actionType: ACTION_TYPES.POST,
      isActivity: true,
      isNotification: false,
      isEmail: false,
    });

    // Generating related notifications.
    if (!params.ignoreNotifications) {
      // Generating notifications for poster's followers.
      const userFollowersRaw = await this.followingContentService.getFollowByEntityByEntityObjectId(
        [params.actorData.id],
        userEntityType.id,
        savedOpportunity.communityId,
      );
      const userFollowers: UserEntity[] = _.chain(userFollowersRaw)
        .map('userFollowingContents')
        .flatten()
        .map('user')
        .value();

      userFollowers.map((follower: UserEntity) =>
        NotificationHookService.notificationHook({
          actionData: {
            ...opportunityAddedData,
            entityObjectId: opportunityAddedData.id,
            entityType: oppEntityType.id,
            user: follower,
          },
          actorData: params.actorData,
          actionType: ACTION_TYPES.POST,
          isActivity: false,
          isNotification: true,
          invertUser: true,
          entityOperendObject: {
            ...this.generateOpportunityRedirectLink(savedOpportunity),
          },
        }),
      );

      // Generating notifcations for mentions.
      if (addedMentions && addedMentions.length) {
        this.mentionService.generateNotifications({
          actionData: {
            ...opportunityAddedData,
            entityObjectId: opportunityAddedData.id,
            entityType: oppEntityType.id,
          },
          actorData: params.actorData,
          mentions: addedMentions,
          mentionType: MENTION_TYPES.OPPORTUNITY_DESCRIPTION,
          mentionEntity: opportunityAddedData,
        });
      }
    }

    opportunityAddedData['points'] = {
      value: points,
      type: ACTION_TYPES.POST,
    };
    return opportunityAddedData;
  }

  /**
   * Add opportunity's visibility settings.
   * @param opportunity Opportunity to add visibility settings for.
   * @param challengeId Challenge from which visbility settings need to be inherited.
   */
  private async addOpportunityVisbilitySettings(
    opportunity: OpportunityEntity,
    challengeId?: number,
  ): Promise<{}> {
    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    let addedVisSetting;
    if (challengeId) {
      const challengeVisSetting = await this.entityVisibilitySettingService.getEntityVisibilitySetting(
        {
          where: {
            entityObjectId: challengeId,
            entityType: challengeEntityType.id,
            community: opportunity.communityId,
          },
        },
      );

      addedVisSetting = await this.entityVisibilitySettingService.addEntityVisibilitySetting(
        {
          ...challengeVisSetting,
          id: undefined,
          entityType: oppEntityType,
          entityObjectId: opportunity.id,
          community: opportunity.communityId,
        },
      );
    } else {
      addedVisSetting = await this.entityVisibilitySettingService.addEntityVisibilitySetting(
        {
          entityType: oppEntityType,
          entityObjectId: opportunity.id,
          community: opportunity.communityId,
          ...{ public: true },
        },
      );
    }
    return addedVisSetting;
  }

  /**
   * Update opportunity
   */
  async updateOpportunityBulk(options: {}, data: {}): Promise<{}> {
    return this.opportunityRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'opportunity'),
      UtilsService.replaceJoinColumnsForQueries(data, 'opportunity'),
    );
  }

  async updateOpportunity(
    options: { id: number; communityId: number },
    data: {},
    actorData,
    originUrl?,
  ): Promise<{}> {
    const stopNotifications = data['stopNotifications']
      ? data['stopNotifications']
      : false;
    const entityExperienceSetting = data['entityExperienceSetting'];
    const entityVisibilitySetting = data['entityVisibilitySetting']
      ? data['entityVisibilitySetting']
      : '';
    const opportunityTypeFieldsData = _.cloneDeep(
      data['opportunityTypeFieldsData'],
    );
    const stageAssignmentSettings = _.cloneDeep(
      data['stageAssignmentSettings'],
    );
    delete data['stageAssignmentSettings'];
    delete data['opportunityTypeFieldsData'];
    delete data['entityExperienceSetting'];
    delete data['entityVisibilitySetting'];
    delete data['stopNotifications'];
    const mentions = data['mentions'] || [];

    const existingOpportunity = await this.opportunityRepository.findOne({
      relations: ['community'],
      where: { id: options.id },
    });
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    const existingMentions =
      existingOpportunity.mentions && existingOpportunity.mentions.length
        ? await this.mentionService.getMentions({
            where: { id: In(existingOpportunity.mentions) },
          })
        : [];

    let addedMentions = [];
    if (data['mentions']) {
      // remove existing mentions
      if (existingOpportunity.mentions && existingOpportunity.mentions.length) {
        await this.mentionService.removeMention(
          existingOpportunity.mentions.map(mention => ({ id: mention })),
        );
      }

      // add new mentions
      mentions.map(async mention => {
        mention['entityObjectId'] = existingOpportunity.id;
        mention['entityType'] = entityType.id;
        mention['community'] = existingOpportunity.communityId;
        delete mention['id'];
        delete mention['createdAt'];
        delete mention['updatedAt'];
      });
      addedMentions = await this.mentionService.bulkAddMentions(
        _.compact(mentions),
      );
      data['mentions'] = addedMentions.map(
        mention => mention && mention.id && mention.id,
      );
    }

    // Updating existing custom fields data.
    if (opportunityTypeFieldsData && opportunityTypeFieldsData.length) {
      await this.customFieldDataService.addOrUpdateCustomFieldData(
        {
          opportunity: existingOpportunity.id,
          community: existingOpportunity.communityId,
        },
        opportunityTypeFieldsData,
      );
      // getStageCompletionStats
      const completionData = await this.stageCompletionStats({
        opportunityId: existingOpportunity.id,
        communityId: existingOpportunity.communityId,
        opportunity: existingOpportunity,
        stageEntityType,
        opportunityEntityType: entityType,
      });
      const percentage =
        (parseInt(completionData.total.toString()) /
          parseInt(completionData.completed.toString())) *
        100;
      const ideaEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.IDEA,
      );
      if (percentage) {
        NotificationHookService.updateStageEmailSetting({
          updateCondition: {
            community: existingOpportunity.communityId,
            stageId: existingOpportunity.stageId,
            entityObjectId: existingOpportunity.id,
            entityType: ideaEntityType.id,
          },
          dataToUpdate: { isCompleted: 1 },
        });
      }
    }

    // Save linked opportunity fields.
    if (data['opportunityType']) {
      const oppTypeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.OPPORTUNITY_TYPE,
      );

      const oppTypeFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
        {
          entityType: oppTypeEntityType,
          entityObjectId: data['opportunityType'],
          community: existingOpportunity.communityId,
        },
      );

      if (oppTypeFields && oppTypeFields.length) {
        const linkedFields = oppTypeFields.map(typeField => ({
          field: typeField.fieldId,
        }));

        this.opportunityFieldLinkageService.bulkAddOrUpdateOpportunityFieldLinkage(
          {
            opportunity: existingOpportunity.id,
            community: existingOpportunity.communityId,
            fieldIntegrationType:
              FieldIntegrationTypeEnum.OPP_TYPE_SUBMISSION_FORM,
          },
          linkedFields,
        );
      }
    }

    // Link stage custom fields with opportunity.
    const ideaEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    if (data['stage']) {
      const stageFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
        {
          entityType: stageEntityType,
          entityObjectId: data['stage'],
          community: existingOpportunity.communityId,
        },
      );

      if (stageFields && stageFields.length) {
        const integratedFields = stageFields.map(typeField => ({
          field: typeField.fieldId,
        }));

        this.opportunityFieldLinkageService.bulkAddOrUpdateOpportunityFieldLinkage(
          {
            opportunity: existingOpportunity.id,
            community: existingOpportunity.communityId,
            fieldIntegrationType: FieldIntegrationTypeEnum.STAGE,
          },
          integratedFields,
        );
      }
    }

    const resultUpdate = await this.opportunityRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'opportunity'),
      UtilsService.replaceJoinColumnsForQueries(data, 'opportunity'),
    );
    const opportunityData = await this.opportunityRepository.findOne({
      relations: [
        'community',
        'opportunityUsers',
        'opportunityUsers.user',
        'stage',
        'stage.actionItem',
        'opportunityAttachments',
      ],
      where: { id: options.id },
    });

    this.elasticSearchService.editOpportunityData({
      id: opportunityData.id,
      oppNumber: opportunityData.id,
      title: opportunityData.title,
      description: opportunityData.description,
      communityId: opportunityData.communityId,
      isDeleted: opportunityData.isDeleted,
    });
    let points;
    let reason;

    if (data['stage']) {
      // Send stage emails to assignees.
      if (
        opportunityData.stage.actionItem.abbreviation !==
        ACTION_ITEM_ABBREVIATIONS.NO_TOOL
      ) {
        const currentAssignees = await this.getCurrentStageAssignees(
          options.id,
        );
        NotificationHookService.addStageEmailHook({
          emailType: 'notification',
          entityType: ideaEntityType.id,
          entityObjectId: options.id,
          users: currentAssignees,
          stageId: data['stage'],
          reminderFrequency:
            REMINDER_FREQUENCY_MAPPING[
              _.toUpper(stageAssignmentSettings.emailReminder)
            ],
          actionType: '',
          community: existingOpportunity.communityId,
        });
      }
    }

    if (entityVisibilitySetting) {
      const dataToUpdate = { roles: [], groups: [], public: false };
      if (entityVisibilitySetting.public) {
        dataToUpdate.public = true;
      } else if (entityVisibilitySetting.private) {
        const ownerRole = await this.roleService.getRoles({
          where: {
            title: In([
              RolesEnum.admin,
              RolesEnum.moderator,
              RolesEnum.opportunityOwner,
              RolesEnum.opportunityContributor,
              RolesEnum.opportunitySubmitter,
            ]),
            community: opportunityData.community.id,
          },
        });
        const roleIds = _.map(ownerRole, 'id');
        dataToUpdate.roles = roleIds;
      } else if (
        entityVisibilitySetting.groups &&
        entityVisibilitySetting.groups.length
      ) {
        dataToUpdate.groups = entityVisibilitySetting.groups;
      } else {
        // If nothing selected, defaults to public.
        dataToUpdate.public = true;
      }
      await this.entityVisibilitySettingService.updateEntityVisibilitySetting(
        {
          entityType: entityType.id,
          entityObjectId: opportunityData.id,
          community: opportunityData.community.id,
        },
        dataToUpdate,
      );
    }
    if (resultUpdate.affected > 0) {
      // Sending Action Item notifications
      if (data['stage'] && existingOpportunity.stageId !== data['stage']) {
        this.sendActionItemNotificationOnStageChange({
          opportunity: opportunityData,
          stageAssignmentSettings,
          entityType,
          originUrl: originUrl,
        });
      }

      if (entityExperienceSetting) {
        // save opportunity experience/collaboration settings
        await this.entityExperienceSettingService.updateEntityExperienceSetting(
          {
            entityType: entityType,
            entityObjectId: opportunityData.id,
            community: opportunityData.communityId,
          },
          entityExperienceSetting,
        );
      }

      // Generate activity log and notifications
      actorData['community'] = opportunityData.community.id;
      if (!data['viewCount'] && !stopNotifications) {
        NotificationHookService.notificationHook({
          actionData: {
            ...opportunityData,
            entityObjectId: opportunityData.id,
            entityType: entityType.id,
          },
          actorData: actorData,
          actionType: ACTION_TYPES.EDIT,
          isActivity: true,
          isNotification: false,
          isEmail: false,
        });

        // Generate notifications for Opportunity Stakeholders.
        const opportunityUsers = opportunityData.opportunityUsers.map(
          oppUser => oppUser.user,
        );
        opportunityUsers.map((oppUser: UserEntity) =>
          NotificationHookService.notificationHook({
            actionData: {
              ...opportunityData,
              entityObjectId: opportunityData.id,
              entityType: entityType.id,
              user: oppUser,
            },
            actorData: actorData,
            actionType: ACTION_TYPES.EDIT,
            isActivity: false,
            isNotification: true,
            invertUser: true,
            entityOperendObject: {
              ...this.generateOpportunityRedirectLink(opportunityData),
            },
          }),
        );

        // Generate new mentions notifications.
        if (addedMentions && addedMentions.length) {
          const newMentions = this.mentionService.diffMentions(
            addedMentions,
            existingMentions,
          );
          if (newMentions && newMentions.length) {
            this.mentionService.generateNotifications({
              actionData: {
                ...opportunityData,
                entityObjectId: opportunityData.id,
                entityType: entityType.id,
              },
              actorData: actorData,
              mentions: newMentions,
              mentionType: MENTION_TYPES.OPPORTUNITY_DESCRIPTION,
              mentionEntity: opportunityData,
            });
          }
        }
      } else {
        points = await CommunityActionPoints.addUserPoints({
          actionType: ACTION_TYPES.VIEW,
          entityTypeName: ENTITY_TYPES.IDEA,
          community: opportunityData.community.id,
          userId: actorData.id,
          entityObjectId: opportunityData.id,
        });
        NotificationHookService.notificationHook({
          actionData: {
            ...opportunityData,
            entityObjectId: opportunityData.id,
            entityType: entityType.id,
            user: actorData,
          },
          actorData: actorData,
          actionType: ACTION_TYPES.VIEW,
          isActivity: false,
          isNotification: false,
          isEmail: false,
          invertUser: true,
        });
        reason = ACTION_TYPES.VIEW;
      }
    }
    resultUpdate['points'] = {
      value: points,
      type: reason,
    };
    return resultUpdate;
  }

  async generateUpdateStageNotification(params: {
    opportunity: OpportunityEntity;
    stageNotificationSettings: StageNotificationSettingsInterface;
    actionData: {};
    actorData: {};
    actionType: string;
    newStage: StageEntity;
    newWorkflow?: WorkflowEntity;
    oldStage?: StageEntity;
    oldWorkflow?: WorkflowEntity;
    autogenerated?: boolean;
    onlyActivity?: boolean;
  }): Promise<void> {
    const notifiableUsers = await this.getNotifiableUsersFromSettings(
      params.opportunity.id,
      params.stageNotificationSettings,
      params.opportunity.communityId,
    );

    const entityOperendObject = {
      ...(params.oldStage && {
        previousStage: {
          id: params.oldStage.id,
          title: params.oldStage.title,
          description: params.oldStage.description,
        },
      }),
      currentStage: {
        id: params.newStage.id,
        title: params.newStage.title,
        description: params.newStage.description,
      },
      ...(params.oldWorkflow && {
        previousWorkflow: {
          id: params.oldWorkflow.id,
          title: params.oldWorkflow.title,
          description: params.oldWorkflow.description,
        },
      }),
      ...(params.newWorkflow && {
        currentWorkflow: {
          id: params.newWorkflow.id,
          title: params.newWorkflow.title,
          description: params.newWorkflow.description,
        },
      }),

      ...(params.stageNotificationSettings.message && {
        message: params.stageNotificationSettings.message,
      }),
      ...(params.autogenerated && { autogenerated: params.autogenerated }),

      ...this.generateOpportunityRedirectLink(params.opportunity),
    };

    NotificationHookService.notificationHook({
      actionData: { ...params.actionData, user: params.actorData },
      actorData: params.actorData,
      actionType: params.actionType,
      invertUser: true,
      entityOperendObject,
      isActivity: true,
      isNotification: false,
      isEmail: false,
    });

    if (!params.onlyActivity) {
      notifiableUsers.forEach((user: UserEntity) => {
        NotificationHookService.notificationHook({
          actionData: { ...params.actionData, user },
          actorData: params.actorData,
          actionType: params.actionType,
          invertUser: true,
          entityOperendObject,
          isActivity: false,
          isNotification: true,
          isEmail: params.stageNotificationSettings.sendEmail || false,
          enableSameUserEmail: true,
        });
      });
    }
  }

  async sendActionItemNotificationOnStageChange(params: {
    opportunity: OpportunityEntity;
    stageAssignmentSettings: AddStageAssignmentSettingsDto;
    entityType: EntityTypeEntity;
    originUrl: string;
  }): Promise<void> {
    const assignees = await this.getCurrentStageAssignees(
      params.opportunity.id,
    );

    _.map(assignees, (assignee: UserEntity) =>
      NotificationHookService.actionItemLogHook({
        entityTypeId: params.entityType.id,
        entityObjectId: params.opportunity.id,
        userId: assignee.id,
        userName: assignee.userName,
        userEmail: assignee.email,
        actionItemId: params.opportunity.stage.actionItem.id,
        actionItemTitle: params.opportunity.stage.actionItem.title,
        actionItemAbbreviation:
          params.opportunity.stage.actionItem.abbreviation,
        ...((params.stageAssignmentSettings.stageTimeLimit ||
          params.stageAssignmentSettings.stageTimeLimit === 0) && {
          actionDueDate: moment(params.opportunity.stageAttachmentDate)
            .add(params.stageAssignmentSettings.stageTimeLimit, 'days')
            .endOf('day')
            .toDate(),
        }),
        entityTitle: params.opportunity.title,
        entityDescription: params.opportunity.description,
        ...(params.opportunity.opportunityAttachments &&
          params.opportunity.opportunityAttachments.length && {
            entityImageUrl: params.opportunity.opportunityAttachments[0].url,
          }),
        community: params.opportunity.communityId,
        communityName: params.opportunity.community.name,
        isEmail: params.stageAssignmentSettings.emailNotification,
        isLog: true,
        isNotification: true,
        originUrl: params.originUrl,
        entityOperendObject: {
          detailedMessage: params.stageAssignmentSettings.instructions,
        },
      }),
    );
  }

  /**
   * Permanently delete opportunity.
   */
  async deleteOpportunity(options: {}): Promise<{}> {
    return this.opportunityRepository.delete(
      UtilsService.replaceJoinColumnsForQueries(options, 'opportunity'),
    );
  }

  /**
   * Search opportunity
   */
  async getOpportunitiesCountOnOpportunity(
    community,
    type,
    tagId,
  ): Promise<{}> {
    const res = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('opportunity.id')
      .where('opportunity.communityId = :community', {
        community: community,
      })
      .andWhere('opportunity.opportunityTypeId = :type', {
        type: type,
      })
      .andWhere(':tags = ANY (opportunity.tags)', {
        tags: tagId,
      })
      .getCount();
    return { tagId: tagId, count: res };
  }

  /**
   * @deprecated in favor of elasticsearch - Use `searchDuplciateOpportunities` method instead.
   */
  async getSimilarOpportunities(
    searchKeys: { title: string },
    community,
  ): Promise<{}> {
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .where('opportunity.communityId = :community', {
        community: community,
      })
      .andWhere('opportunity.isDeleted = :isDeleted', {
        isDeleted: false,
      })
      .andWhere(
        new Brackets(qb => {
          if (searchKeys.title) {
            qb.orWhere('LOWER(opportunity.title) like :title', {
              title: `%${searchKeys.title.toLowerCase()}%`,
            });
          }
          if (!searchKeys.title) {
            qb.orWhere('1 = :trueCase', {
              trueCase: 1,
            });
          }
        }),
      )
      .getManyAndCount();
  }

  async getOpportunityCountByType(opportunityIds): Promise<{}> {
    return this.opportunityRepository
      .createQueryBuilder(TABLES.OPPORTUNITY)
      .select([
        `array_agg(${TABLES.OPPORTUNITY}.id) as ids`,
        `count(${TABLES.OPPORTUNITY}.id)`,
        `opportunityType.name as opportunityType`,
        `ARRAY_TO_STRING(ARRAY_AGG(DISTINCT opportunityType.id), ',') AS opportunityTypeId`,
      ])
      .leftJoin(`${TABLES.OPPORTUNITY}.opportunityType`, 'opportunityType')
      .andWhere(
        opportunityIds
          ? `${TABLES.OPPORTUNITY}.id IN (:...opportunityIds)`
          : `1=1`,
        {
          opportunityIds: opportunityIds,
        },
      )
      .addGroupBy(`opportunityType`)
      .getRawMany();
  }
  async addOpportunityStageData(body, id, community): Promise<void> {
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    await this.stageAssigneeService.deletestageAssignee({
      entityType: opportunityEntityType.id,
      entityObjectId: id,
    });
    await this.stageAssignmentSettingService.deleteStageAssignmentSetting({
      entityType: opportunityEntityType.id,
      entityObjectId: id,
    });
    await this.stageNotificationSettingService.deleteStageNotificationSetting({
      entityType: opportunityEntityType.id,
      entityObjectId: id,
    });
    if (body.assigneeSettings) {
      body.assigneeSettings = {
        ...body.assigneeSettings,
        id: undefined,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          settingsType: 'assignee',
          community: community,
        },
      };
      await this.stageAssigneeService.addstageAssignee(body.assigneeSettings);
    }
    if (body.stageActivityVisibilitySettings) {
      body.stageActivityVisibilitySettings = {
        ...body.stageActivityVisibilitySettings,
        id: undefined,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          settingsType: 'visibility',
          community: community,
        },
      };
      await this.stageAssigneeService.addstageAssignee(
        body.stageActivityVisibilitySettings,
      );
    }
    if (body.stageAssignmentSettings) {
      body.stageAssignmentSettings = {
        ...body.stageAssignmentSettings,
        id: undefined,
        ...(body.stageAssignmentSettings['stageTimeLimit'] && {
          stageTimeLimit: Math.abs(
            body.stageAssignmentSettings['stageTimeLimit'],
          ),
        }),
        ...(body.stageAssignmentSettings['completionTimeLimit'] && {
          completionTimeLimit: Math.abs(
            body.stageAssignmentSettings['completionTimeLimit'],
          ),
        }),
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
      };
      await this.stageAssignmentSettingService.addStageAssignmentSetting(
        body.stageAssignmentSettings,
      );
    }
    if (body.stageNotificationSettings) {
      body.stageNotificationSettings = {
        ...body.stageNotificationSettings,
        id: undefined,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
      };
      await this.stageNotificationSettingService.addStageNotificationSetting(
        body.stageNotificationSettings,
      );
    }
  }
  async editOpportunityStageData(body, id, community): Promise<void> {
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    if (body.assigneeSettings) {
      body.assigneeSettings = {
        ...body.assigneeSettings,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          settingsType: 'assignee',
          community: community,
        },
      };
      await this.stageAssigneeService.updatestageAssignee(
        {
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
          settingsType: 'assignee',
        },
        body.assigneeSettings,
      );
    }
    if (body.stageActivityVisibilitySettings) {
      body.stageActivityVisibilitySettings = {
        ...body.stageActivityVisibilitySettings,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          settingsType: 'visibility',
          community: community,
        },
      };
      await this.stageAssigneeService.updatestageAssignee(
        {
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
          settingsType: 'visibility',
        },
        body.stageActivityVisibilitySettings,
      );
    }
    if (body.stageAssignmentSettings) {
      body.stageAssignmentSettings = {
        ...body.stageAssignmentSettings,
        ...(body.stageAssignmentSettings['stageTimeLimit'] && {
          stageTimeLimit: Math.abs(
            body.stageAssignmentSettings['stageTimeLimit'],
          ),
        }),
        ...(body.stageAssignmentSettings['completionTimeLimit'] && {
          completionTimeLimit: Math.abs(
            body.stageAssignmentSettings['completionTimeLimit'],
          ),
        }),
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
      };
      await this.stageAssignmentSettingService.updateStageAssignmentSetting(
        {
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
        body.stageAssignmentSettings,
      );
    }
    if (body.stageNotificationSettings) {
      body.stageNotificationSettings = {
        ...body.stageNotificationSettings,
        ...{
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
      };
      await this.stageNotificationSettingService.updateStageNotificationSetting(
        {
          entityType: opportunityEntityType.id,
          entityObjectId: id,
          community: community,
        },
        body.stageNotificationSettings,
      );
    }
  }

  checkAssigneeAllMembersUnassingedRequest(
    settings: AddStageAssigneeSettingsDto,
  ): AddStageAssigneeSettingsDto {
    let settingsModified = _.cloneDeep(settings);
    if (
      settings.communityAdmins &&
      settings.communityModerators &&
      settings.communityUsers
    ) {
      settingsModified = {
        ...settings,
        allMembers: true,
        unassigned: false,
        communityAdmins: false,
        communityModerators: false,
        communityUsers: false,
      };
    } else if (
      !settings.communityAdmins &&
      !settings.communityModerators &&
      !settings.communityUsers &&
      !settings.opportunityOwners &&
      !settings.opportunitySubmitters &&
      !settings.opportunityTeams &&
      !settings.customFieldAssignee &&
      !settings.groups.length &&
      !settings.individuals.length
    ) {
      settingsModified = {
        ...settings,
        unassigned: true,
        allMembers: false,
      };
    } else {
      settingsModified = {
        ...settings,
        unassigned: false,
        allMembers: false,
      };
    }
    return settingsModified;
  }

  /**
   * Get Opportunity Status / Get Opportunity Status By Filters
   * @param {Object} params To Filter Data.
   * @return List of Statuses With Counts Against Opportunities
   */
  async getOpportunityStatus(params): Promise<[] | {}> {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select([
        'status.title',
        'status.id',
        'status.colorCode',
        'count(status.id) as total',
      ])
      .where('opportunity.communityId = :community', {
        community: params.community,
      });

    //Get Challenge Specific Opportunities Statuses
    if (params.challenge) {
      query.andWhere(`opportunity.challengeId = :challenge`, {
        challenge: params.challenge,
      });
    }

    // Get User Specific Opportunities Statuses
    if (params.user) {
      const oppUserSubquery = getRepository(OpportunityUserEntity)
        .createQueryBuilder('opportunityUser')
        .select('DISTINCT opportunityUser.opportunity')
        .where(`opportunityUser.user = ${params.user}`);

      query.andWhere(`opportunity.id IN (${oppUserSubquery.getQuery()})`);
    }

    //Check for isDeleted flag
    if (params.isDeleted) {
      query.andWhere(`opportunity.isDeleted = :isDeleted`, {
        isDeleted: params.isDeleted,
      });
    }

    query
      .innerJoin('opportunity.stage', 'stage')
      .innerJoin('stage.status', 'status')
      .groupBy('status.id');

    return camelcaseKeys(await query.getRawMany());
  }
  async getStageCompletionStats(opportunity: OpportunityEntity) {
    // Link stage custom fields with opportunity.
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    // Link stage custom fields with opportunity.
    const opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const dataForCustomFieldIntegrations = await this.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityObjectId: opportunity.stageId,
        entityType: stageEntityType,
        community: opportunity.communityId,
      },
    );
    const fieldIds = _.map(dataForCustomFieldIntegrations, 'fieldId');
    const whereClause = {
      opportunity: opportunity.id,
    };
    if (fieldIds.length) {
      whereClause['field'] = fieldIds;
    }
    const customFieldData = await this.customFieldDataService.getCustomFieldData(
      {
        where: whereClause,
      },
    );

    const totalAttachedFieldsWithStage = dataForCustomFieldIntegrations.length;
    const totalCompletedFieldsOfCurrentOpportunityUnderStage =
      customFieldData.length;
    const dataForOpportunity = await this.stageAssignmentSettingService.getStageAssignmentSettings(
      {
        entityObjectId: opportunity.id,
        entityType: opportunityEntityType.id,
      },
    );
    const finalData: { total?: number; completed: number } = {
      completed: totalCompletedFieldsOfCurrentOpportunityUnderStage,
    };
    if (dataForOpportunity[0].allAssigneesCompleted) {
      finalData.total = totalAttachedFieldsWithStage;
    } else if (
      !dataForOpportunity[0].allAssigneesCompleted &&
      dataForOpportunity[0].minimumResponses &&
      dataForOpportunity[0].minimumResponses <= totalAttachedFieldsWithStage
    ) {
      finalData.total = dataForOpportunity[0].minimumResponses;
    }
    return finalData;
  }

  /**
   * Get current stage assignees (users) for given assignee settings.
   */
  async getNotifiableUsersFromSettings(
    opportunityId: number,
    notificationSetting: StageNotificationSettingsInterface,
    community: number,
  ): Promise<Array<{}>> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: opportunityId, communityId: community },
      relations: [
        'opportunityUsers',
        'opportunityUsers.user',
        'opportunityUsers.user.profileImage',
      ],
    });

    let users = [];

    // Find group users
    if (notificationSetting.groups && notificationSetting.groups.length) {
      users = users.concat(
        await this.circleService.getCircleUsers({
          where: {
            id: In(notificationSetting.groups),
            community: opportunity.communityId,
          },
        }),
      );
    }

    // Find individual users
    if (
      notificationSetting.individuals &&
      notificationSetting.individuals.length
    ) {
      users = users.concat(
        await this.userService.getUsers({
          where: { id: In(notificationSetting.individuals) },
          relations: ['profileImage'],
        }),
      );
    }

    // Find users for opportunity roles
    users = users.concat(
      this.getOpportunityRoleAssignees(notificationSetting, opportunity),
    );

    // Find Followers
    if (notificationSetting.followers) {
      users = users.concat(await this.getAllFollowers(opportunity.id));
    }

    // Find Voters
    if (notificationSetting.voters) {
      users = users.concat(await this.getAllVoters(opportunity.id));
    }

    const uniqUsers = _.uniqBy(users, 'id');

    const currUsers = uniqUsers.length
      ? await this.userService.getUsersWithFilters({
          userIds: uniqUsers.map(user => user.id),
          communityId: opportunity.communityId,
          isDeleted: false,
        })
      : [];
    return currUsers;
  }

  async getAllVoters(opportunity: number): Promise<UserEntity[]> {
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    return (await this.voteService.getAllVote({
      where: {
        entityObjectId: opportunity,
        entityType: entityType.id,
        voteType: VoteType.UPVOTE,
      },
      relations: ['user'],
      order: {
        id: 'DESC',
      },
    })).map(vote => vote.user);
  }

  async getAllFollowers(opportunity: number): Promise<UserEntity[]> {
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const followingContents = await this.followingContentService.getFollowingContents(
      {
        where: {
          entityObjectId: opportunity,
          entityType: entityType,
        },
        relations: ['userFollowingContents', 'userFollowingContents.user'],
      },
    );

    let followers = [];
    if (followingContents && followingContents.length) {
      followers = followingContents[0].userFollowingContents.map(
        userFollow => userFollow.user,
      );
    }

    return followers;
  }

  /**
   * Increase View Count of a Opportunity
   * @param options FindOptions to search opportuniy on.
   * @param countToAdd Number of views to add (defaults to 1).
   */
  async increaseViewCount(options: {}, countToAdd = 1): Promise<{}> {
    return this.updateRawOpportunity(
      UtilsService.replaceJoinColumnsForQueries(options, 'opportunity'),
      {
        viewCount: () => `view_count + ${countToAdd}`,
      },
    );
  }

  /**
   * Attaches a stage with an opportunity
   * @param stage Stage to be attached with the opportunity. (Must include assignee & other settings)
   * @param opportunity Opportunity to which stage needs to be attached.
   * @param originUrl Origin Url of the request (for email and redirection purposes).
   */
  async attachStageToOpportunity(
    stage: StageEntity,
    opportunity: OpportunityEntity,
    originUrl: string,
    generateEmails = true,
    generateActionItems = true,
  ): Promise<void> {
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    // Update exiting stage history if any.
    if (opportunity.stage) {
      let computeObject = {};
      if (
        opportunity.stage.actionItem.abbreviation ===
        ACTION_ITEM_ABBREVIATIONS.SCORECARD
      ) {
        const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
          ENTITY_TYPES.STAGE,
        );
        computeObject = await this.evaluationCriteriaService.getEvaluationsEntityScores(
          {
            entityObjectId: opportunity.stage.id,
            entityType: stageEntityType.id,
            opportunity: opportunity.id,
            community: opportunity.communityId,
          },
        );
      }
      NotificationHookService.addStageHistory({
        oldStageData: {
          actionItem: opportunity.stage.actionItem,
          stage: opportunity.stage,
          status: opportunity.stage.status,
          opportunity,
          computeObject,
          enteringAt: moment().format(),
          exitingAt: moment().format(),
          community: opportunity.community,
        },
      });
    }

    // Attach stage & workflow with opportunity.
    await this.updateOpportunityBulk(
      { id: opportunity.id },
      {
        workflow: stage.workflow,
        stage: stage,
        stageAttachmentDate: moment().format('YYYY-MM-DD'),
      },
    );

    await this.addOpportunityStageData(
      {
        assigneeSettings: this.removeUncessaryColumns(
          stage['assigneeSettings'],
        ),
        stageActivityVisibilitySettings: this.removeUncessaryColumns(
          stage['stageActivityVisibilitySettings'],
        ),
        stageAssignmentSettings: this.removeUncessaryColumns(
          stage['stageAssignmentSettings'],
        ),
        stageNotificationSettings: this.removeUncessaryColumns(
          stage['stageNotificationSettings'],
        ),
      },
      opportunity.id,
      opportunity.communityId,
    );

    // Add Stage History
    NotificationHookService.addStageHistory({
      oldStageData: {
        stage,
        actionItem: stage.actionItem,
        status: stage.status,
        opportunity,
        computeObject: {},
        enteringAt: moment().format(),
        community: opportunity.community,
      },
    });

    // Save Action Item Log.
    if (generateActionItems) {
      this.sendActionItemNotificationOnStageChange({
        opportunity: { ...opportunity, stage: stage },
        stageAssignmentSettings: this.removeUncessaryColumns(
          stage['stageAssignmentSettings'],
        ) as AddStageAssignmentSettingsDto,
        entityType: oppEntityType,
        originUrl: originUrl,
      });
    }

    // Add Stage Emails.
    if (
      stage.actionItem.abbreviation !== ACTION_ITEM_ABBREVIATIONS.NO_TOOL &&
      generateEmails
    ) {
      const currentAssignees = await this.getCurrentStageAssignees(
        opportunity.id,
      );
      NotificationHookService.addStageEmailHook({
        emailType: 'notification',
        entityType: oppEntityType.id,
        entityObjectId: opportunity.id,
        users: currentAssignees,
        stageId: stage.id,
        reminderFrequency:
          REMINDER_FREQUENCY_MAPPING[
            _.toUpper(stage['stageAssignmentSettings'].emailReminder)
          ],
        actionType: '',
        community: opportunity.communityId,
      });
    }
  }

  removeUncessaryColumns(settings: {}): {} {
    return {
      ...settings,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: undefined,
      updatedBy: undefined,
    };
  }

  async getOpportunityFilteredData(params): Promise<any[]> {
    let whereClause = {};
    if (params.hasOwnProperty('challenge')) {
      whereClause = { challenge: params.challenge };
    }
    if (params.challenges) {
      whereClause = { ...{ challenge: params.challenges } };
    }
    if (params.community) {
      whereClause = { ...{ community: params.community } };
    }

    const opportunities = await this.getOpportunities({
      where: whereClause,
      relations: ['user'],
    });

    if (!opportunities.length) {
      return [];
    }

    const allOpportunitites = [];
    const postedByMeOpportunities = [];
    const tagsByOpportunity = {};
    const totalUniqueTags = [];
    _.mapKeys(opportunities, (val: OpportunityEntity) => {
      if (val.tags.length) {
        tagsByOpportunity[val.id] = val.tags;
        totalUniqueTags.push(val.tags);
      }
      allOpportunitites.push(val.id);
      if (val.user.id === params.userData.id) {
        postedByMeOpportunities.push(val.id);
      }
    });
    let bookmarks;
    let follows;
    let votes;
    // let opportunityTypes;
    let postedByMe;
    if (allOpportunitites.length) {
      if (params.bookmarkedByMe) {
        bookmarks = await this.bookmarkService.getBookmarkCounts(
          params.user || params.userData.id,
          params.entityType,
          allOpportunitites,
        );
      }
      if (params.followedByMe) {
        follows = await this.followingContentService.getFollowingCounts(
          params.user || params.userData.id,
          params.entityType,
          allOpportunitites,
        );
      }
      if (params.votedFor) {
        votes = await this.voteService.getVoteCounts(
          params.user || params.userData.id,
          params.entityType,
          allOpportunitites,
        );
      }
      if (params.postedByMe) {
        postedByMe = postedByMeOpportunities;
      }

      //   opportunityTypes = await this.opportunityService.getOpportunityCountByType(
      //     allOpportunitites,
      //   );
      const selectedOpportunities = _.flatMapDeep([
        _.map(bookmarks, 'ids'),
        _.map(follows, 'ids'),
        _.map(votes, 'ids'),
        // _.map(opportunityTypes, 'ids'),
        postedByMe,
      ]);
      return selectedOpportunities;
    }
  }

  /**
   * Get opportunity's current stage's completion stats.
   * @param params Options to search opportunity on
   * @returns Opporutnity's completion stats.
   */
  async stageCompletionStats(params: {
    opportunityId: number;
    communityId: number;
    opportunity?: OpportunityEntity;
    stageEntityType?;
    opportunityEntityType?;
  }): Promise<{ total: number; completed: number; opportunityId: number }> {
    // Fill in required data.
    if (!params.opportunity) {
      params.opportunity = await this.getOneOpportunity({
        where: { id: params.opportunityId, communityId: params.communityId },
        relations: ['stage', 'stage.actionItem'],
      });
    }
    if (!params.stageEntityType) {
      params.stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.STAGE,
      );
    }
    if (!params.opportunityEntityType) {
      params.opportunityEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.IDEA,
      );
    }

    const dataForOpportunity = await this.stageAssignmentSettingService.getStageAssignmentSettings(
      {
        entityObjectId: params.opportunity.id,
        entityType: params.opportunityEntityType.id,
      },
    );

    let finalData = {
      total: 0,
      completed: 0,
      opportunityId: params.opportunity.id,
    };

    if (
      params.opportunity.stage &&
      params.opportunity.stage.actionItem.abbreviation ===
        ACTION_ITEM_ABBREVIATIONS.REFINEMENT
    ) {
      // Calculating stage completion for Refinement stage.
      const dataForCustomFieldIntegrations = await this.customFieldIntegrationService.getCustomFieldIntegrations(
        {
          entityObjectId: params.opportunity.stageId,
          entityType: params.stageEntityType,
          community: params.opportunity.communityId,
        },
      );
      const fieldIds = _.map(dataForCustomFieldIntegrations, 'fieldId');
      let customFieldData = [];
      if (fieldIds.length) {
        customFieldData = await this.customFieldDataService.getCustomFieldData({
          where: { field: In(fieldIds), opportunity: params.opportunity.id },
        });
      }

      const totalAttachedFieldsWithStage =
        dataForCustomFieldIntegrations.length;
      const totalCompletedFieldsOfCurrentOpportunityUnderStage =
        customFieldData.length;

      const totalForCompletion = dataForOpportunity[0].allAssigneesCompleted
        ? totalAttachedFieldsWithStage
        : _.min([
            dataForOpportunity[0].minimumResponses,
            totalAttachedFieldsWithStage,
          ]);
      finalData = {
        total: totalForCompletion,
        completed: _.min([
          totalCompletedFieldsOfCurrentOpportunityUnderStage,
          totalForCompletion,
        ]),
        opportunityId: params.opportunity.id,
      };
    } else if (
      params.opportunity.stage &&
      params.opportunity.stage.actionItem.abbreviation ===
        ACTION_ITEM_ABBREVIATIONS.SCORECARD
    ) {
      const options = {
        where: {
          opportunity: params.opportunity,
          entityType: params.stageEntityType,
          entityObjectId: params.opportunity.stageId,
          community: params.opportunity.communityId,
        },
      };
      // Calculating stage completion for Scorecard stage.
      const responses = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
        options,
      );
      const uniqResp = _.uniqBy(responses, 'userId');

      const stageAssignees = await this.getCurrentStageAssignees(
        parseInt(params.opportunity.id.toString()),
      );

      const responsesCount = uniqResp.length;
      const totalResponses = dataForOpportunity[0].allAssigneesCompleted
        ? stageAssignees.length
        : _.min([
            dataForOpportunity[0].minimumResponses,
            stageAssignees.length,
          ]);

      finalData = {
        completed: _.min([responsesCount, totalResponses]),
        total: totalResponses,
        opportunityId: params.opportunity.id,
      };
    }
    return finalData;
  }

  async getDataForAnalyticsForTimeSeries(
    opportunityIds,
    communityId,
    opportunityTypeIds,
    spanType,
  ) {
    let typeIdClause = '';
    let daily = {};
    let monthly = {};
    let weekly = {};
    if (!_.isEmpty(opportunityTypeIds)) {
      typeIdClause = `AND opportunity_type_id in (${opportunityTypeIds})`;
    }
    if (spanType === 'daily') {
      daily = await this.opportunityRepository.query(
        `select opportunity_type_id, count(*),date_trunc('day', created_at) from public.opportunity where community_id = ${communityId} AND id in (${opportunityIds}) ${typeIdClause} group by opportunity_type_id, date_trunc('day', created_at);`,
      );
    }
    if (spanType === 'weekly') {
      weekly = await this.opportunityRepository.query(
        `select opportunity_type_id, count(*),date_trunc('week', created_at) from public.opportunity where community_id = ${communityId} AND id in (${opportunityIds}) ${typeIdClause} group by opportunity_type_id, date_trunc('week', created_at);`,
      );
    }
    if (spanType === 'monthly') {
      monthly = await this.opportunityRepository.query(
        `select opportunity_type_id, count(*),date_trunc('month', created_at) from public.opportunity where community_id = ${communityId} AND id in (${opportunityIds}) ${typeIdClause} group by opportunity_type_id, date_trunc('month', created_at);`,
      );
    }

    return {
      monthly,
      weekly,
      daily,
    };
  }

  /**
   * Adds Innobot activity & notifications for the automatic addition of
   * workflow to an opportunity.
   *
   * @param params Required parameters to send notifications on.
   */
  async sendStageInnobotNotification(params: {
    user;
    opportunity: OpportunityEntity;
    stage: StageEntity;
    oppoEntityType: EntityTypeEntity;
    onlyActivity?: boolean;
  }): Promise<void> {
    // Selecting InnoBot as user.
    const actorData = {
      ...params.user,
      id: 0,
      firstName: INNO_BOT.name,
      lastName: '',
      email: INNO_BOT.email,
      community: params.opportunity.communityId,
    };
    const actionData = {
      ...params.opportunity,
      entityObjectId: params.opportunity.id,
      entityType: params.oppoEntityType.id,
    };

    return this.generateUpdateStageNotification({
      opportunity: params.opportunity,
      autogenerated: true,
      stageNotificationSettings: params.stage['stageNotificationSettings'],
      actionData,
      actorData,
      actionType: ACTION_TYPES.ADD_WORKFLOW,
      newStage: params.stage,
      newWorkflow: params.stage.workflow,
      onlyActivity: params.onlyActivity,
    });
  }

  generateOpportunityRedirectLink(
    opportunity: OpportunityEntity,
  ): { redirectLink: string; redirectBtnText: string } {
    const port =
      this.configService.getEnv() === ENVIRONMENTS.DEVELOP
        ? `:${this.configService.getNumber('CLIENT_PORT')}`
        : '';

    return {
      redirectLink: `${opportunity.community.url}${port}/idea/view/${opportunity.id}`,
      redirectBtnText: `View ${EMAIL_BOOKMARKS.POST_TYPE}`,
    };
  }

  /**
   * Get counts of opportunities in the given challenges.
   * @param params Options containing the challenges for which counts have to be fetched.
   */
  async getChallengesOpportunitiesCount(params: {
    challengeIds: number[];
    communityId: number;
    isDeleted?: boolean;
  }): Promise<{ challengeId: number; count: number }[]> {
    if (!_.get(params.challengeIds, 'length')) return [];

    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select([
        'opportunity.challengeId AS challenge_id',
        'COUNT(opportunity.id) AS count',
      ])
      .where('opportunity.communityId = :communityId', {
        communityId: params.communityId,
      })
      .andWhere(`opportunity.challengeId IN (:...challengeIds)`, {
        challengeIds: params.challengeIds,
      });

    if (params.hasOwnProperty('isDeleted')) {
      query.andWhere('opportunity.isDeleted = :isDeleted', {
        isDeleted: params.isDeleted,
      });
    }

    const rawRes = await query.groupBy('opportunity.challengeId').getRawMany();

    // Mapping & parsing keys from raw results.
    return rawRes.map(res => ({
      challengeId: res['challenge_id'],
      count: parseInt(res['count']),
    }));
  }

  /**
   * Fetch assignee text against the current stages for the given opportunities.
   * @param options Opportunty Ids and related options to search opportunities.
   * @returns Assignee text to display.
   */
  async getAssigneeBulkTexts(options: {
    opportunityIds: number[];
    communityId: number;
    includeRawSetting?: boolean;
  }): Promise<
    {
      opportunityId: number;
      mergedText: string;
      rawTexts: string[];
      rawSetting?: StageAssigneeSettingsEntity;
    }[]
  > {
    const assignees = await this.getCurrStageAssigneeForList(options);
    const assigneesByOppo = _.keyBy(assignees, 'opportunityId');

    return options.opportunityIds.map(oppoId => {
      const assSetting = _.get(assigneesByOppo, oppoId, {});
      const oppoAssignees = _.get(assSetting, 'assignees', {});
      let assTexts = [];

      if (_.get(oppoAssignees, 'unassigned')) {
        assTexts.push('Unassigned');
      } else if (_.get(oppoAssignees, 'allMembers')) {
        assTexts.push('All Members');
      } else {
        if (_.get(oppoAssignees, 'communityAdmins')) {
          assTexts.push('Administrators');
        }
        if (_.get(oppoAssignees, 'communityModerators')) {
          assTexts.push('Moderators');
        }
        if (_.get(oppoAssignees, 'communityUsers')) {
          assTexts.push('All Community Users');
        }
        if (_.get(oppoAssignees, 'opportunityOwners')) {
          assTexts.push('Owners');
        }
        if (_.get(oppoAssignees, 'opportunityTeams')) {
          assTexts.push('Team');
        }
        if (_.get(oppoAssignees, 'opportunitySubmitters')) {
          assTexts.push('Submitters');
        }
        assTexts = _.concat(
          assTexts,
          _.compact(_.map(_.get(oppoAssignees, 'groups'), group => group.name)),
        );
        assTexts = _.concat(
          assTexts,
          _.compact(
            _.map(
              _.get(oppoAssignees, 'individuals'),
              user => `${user.firstName} ${user.lastName}`,
            ),
          ),
        );
      }

      // Considering as unassigned if no assignee calculated.
      if (!_.get(assTexts, 'length')) {
        assTexts = ['Unassigned'];
      }

      return {
        opportunityId: oppoId,
        mergedText: assTexts.toString(),
        rawTexts: assTexts,
        ...(options.includeRawSetting && {
          rawSetting: _.get(assSetting, 'rawSetting', {}),
        }),
      };
    });
  }

  /**
   * Export opportunities and upload the exported file to S3.
   * @param opportunities Opportunities to export.
   * @param options Export and filter options to export opportunities.
   * @param communityId Community Id.
   * @returns URL for the exported file.
   */
  async exportOpportunities(
    opportunities: OpportunityEntity[],
    options: ExportOpportunitiesDto,
    communityId: number,
  ): Promise<{ url: string; fileName: string }> {
    // Return empty if no opportunties given to export
    if (!opportunities.length) return { url: '', fileName: '' };

    const opportunityIds = _.map(opportunities, 'id');
    const submitterIds = _.map(opportunities, 'userId');

    // Fetching all community tags, community url, opportunities' users,
    // stage & idea entity types, submitters' groups, community users & groups,
    // and custom fields & thier data.
    const [
      communityTags,
      communityUrl,
      oppoUsers,
      stageEntityType,
      oppoEntityType,
      submittersGroups,
      communityUsers,
      communityGroups,
      customFields,
      fieldsData,
    ] = await Promise.all([
      this.tagService.getTags({
        where: { community: communityId },
      }),
      this.communityService.getTransformedUrl(communityId),
      this.opportunityUserService.getOpportunityUsers({
        where: { opportunity: In(opportunityIds), community: communityId },
        relations: ['user'],
      }),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.IDEA),
      this.userCircleService.getCommunityUserCircles({
        communityId: communityId,
        userIds: submitterIds,
        isCircleDeleted: false,
      }),
      this.userService.getCommunityUsers({
        communityId: communityId,
        isDeleted: false,
      }),
      this.circleService.getCircles({
        where: { community: communityId, isDeleted: false },
      }),
      this.customFieldService.getCustomFields({
        where: { community: communityId },
        relations: ['customFieldType'],
      }),
      this.customFieldDataService.getCustomFieldData({
        where: { opportunity: In(opportunityIds) },
      }),
    ]);

    // Grouping tags and users
    const tagsById = _.keyBy(communityTags, 'id');
    const commUsersById = _.keyBy(communityUsers, 'id');
    const commGroupsById = _.keyBy(communityGroups, 'id');

    // Grouping opportunities' users.
    const submittersByOppo = _.groupBy(
      oppoUsers.filter(
        oppoUser =>
          oppoUser['opportunityUserType'] === OpportunityUserType.SUBMITTER,
      ),
      'opportunityId',
    );
    const teamByOppo = _.groupBy(
      oppoUsers.filter(
        oppoUser =>
          oppoUser['opportunityUserType'] === OpportunityUserType.CONTRIBUTOR,
      ),
      'opportunityId',
    );
    const ownersByOppo = _.groupBy(
      oppoUsers.filter(
        oppoUser =>
          oppoUser['opportunityUserType'] === OpportunityUserType.OWNER,
      ),
      'opportunityId',
    );

    // Finding votes, comments & followers counts, current stage assignees,
    // evaluation criteria & thier responses and stage history.
    const [
      voteCounts,
      commentsCount,
      followersCounts,
      assignees,
      criteria,
      stageCriteriaResp,
      stageHistory,
    ] = await Promise.all([
      this.voteService.getVoteCountsByObjIds({
        entityObjectIds: opportunityIds,
        entityTypeId: oppoEntityType.id,
        communityId,
      }),
      this.commentService.getCommentCountsByObjIds({
        entityObjectIds: opportunityIds,
        entityTypeId: oppoEntityType.id,
        communityId,
      }),
      this.followingContentService.getFollowCountsByObjIds({
        entityObjectIds: opportunityIds,
        entityTypeId: oppoEntityType.id,
        communityId,
      }),
      this.getCurrStageAssigneeForList({
        opportunityIds,
        communityId,
      }),
      this.evaluationCriteriaService.getEvaluationCriterias({
        where: { community: communityId },
        relations: ['evaluationType'],
      }),
      this.opportunityEvaluationResponseService.getLatestCriteriaResponses({
        communityId,
        opportunityIds,
        entityTypeId: stageEntityType.id,
      }),
      this.stageHistoryService.getStageHistory({
        where: { opportunity: In(opportunityIds) },
        order: { id: 'DESC' },
      }),
    ]);

    // Grouping counts, submitters' groups, current stage assignees & criteria.
    const voteCountsByOppo = _.keyBy(voteCounts, 'entityObjectId');
    const commentsCountsByOppo = _.keyBy(commentsCount, 'entityObjectId');
    const followersCountsByOppo = _.keyBy(followersCounts, 'entityObjectId');
    const groupsBySubs = _.groupBy(submittersGroups, 'userId');
    const assigneesByOppo = _.keyBy(assignees, 'opportunityId');
    const criteriaById = _.keyBy(criteria, 'id');
    const stageHistoryByOppo = _.groupBy(stageHistory, 'opportunityId');

    stageCriteriaResp.forEach(resp => {
      resp.evaluationCriteria = criteriaById[resp.evaluationCriteriaId];
    });
    const criteriaRespByOppo = _.groupBy(stageCriteriaResp, 'opportunityId');

    // Custom Fields.
    const fieldsById = _.keyBy(customFields, 'id');
    const fieldsDataByOppo = _.groupBy(fieldsData, 'opportunityId');

    for (const opportunity of opportunities) {
      opportunity['createdDate'] = moment(opportunity.createdAt).format(
        'MM/DD/YYYY',
      );
      opportunity['challengeTitle'] = _.get(opportunity, 'challenge.title');
      opportunity['opportunityTypeName'] = _.get(
        opportunity,
        'opportunityType.name',
      );

      // Stage and Workflow Details.
      opportunity['workflowTitle'] = _.get(opportunity, 'workflow.title');
      opportunity['stageTitle'] = _.get(opportunity, 'stage.title');
      opportunity['statusTitle'] = _.get(opportunity, 'stage.status.title');
      opportunity['url'] = `${communityUrl}/idea/view/${opportunity.id}`;

      // Finding days in current status.
      if (opportunity.stage) {
        const oppStageHistory = _.get(stageHistoryByOppo, opportunity.id);
        if (
          _.get(oppStageHistory, 'length') &&
          _.head(oppStageHistory).statusId === opportunity.stage.statusId
        ) {
          const diffStatusIndex = _.findIndex(
            oppStageHistory,
            hist => hist.statusId !== opportunity.stage.statusId,
          );
          const lastSameStatusHist =
            diffStatusIndex !== -1
              ? _.get(oppStageHistory, diffStatusIndex - 1)
              : _.last(oppStageHistory);

          if (_.get(lastSameStatusHist, `enteringAt`)) {
            opportunity['currStatusDays'] = moment().diff(
              lastSameStatusHist.enteringAt,
              'days',
            );
          }
        }

        if (
          !opportunity['currStatusDays'] &&
          opportunity['currStatusDays'] !== 0
        ) {
          const currTime = moment();
          opportunity['currStatusDays'] = currTime.diff(
            opportunity.stageAttachmentDate || currTime,
            'days',
          );
        }
      }

      // Tags
      opportunity['tagNames'] = _.compact(
        _.map(opportunity.tags, tagId => _.get(tagsById, `${tagId}.name`)),
      );

      // Opportunity Users Details.
      let subFound = false;
      opportunity['submitters'] = _.map(
        _.get(submittersByOppo, opportunity.id, []),
        oppUser => {
          if (opportunity.userId === oppUser.userId) {
            subFound = true;
            // Handle anonymization.
            if (options.anonymizedExport && opportunity.anonymous)
              return 'Anonymous';
          }
          return `${oppUser.user.firstName} ${oppUser.user.lastName}`;
        },
      );

      // Adding initial submitter in the start if isn't already found in the
      // submitters list.
      if (!subFound) {
        // Handle anonymization.
        if (options.anonymizedExport && opportunity.anonymous)
          opportunity['submitters'].unshift('Anonymous');
        else
          opportunity['submitters'].unshift(
            `${opportunity.user.firstName} ${opportunity.user.lastName}`,
          );
      }

      // Adding submitter groups.
      if (!options.anonymizedExport || !opportunity.anonymous) {
        opportunity['submitterGroups'] = _.compact(
          _.map(_.get(groupsBySubs, opportunity.userId, []), userCircle =>
            _.get(userCircle, 'circle.name'),
          ),
        );
      }

      opportunity['team'] = _.map(
        _.get(teamByOppo, opportunity.id, []),
        oppUser => `${oppUser.user.firstName} ${oppUser.user.lastName}`,
      );
      opportunity['owners'] = _.map(
        _.get(ownersByOppo, opportunity.id, []),
        oppUser => `${oppUser.user.firstName} ${oppUser.user.lastName}`,
      );

      // Calculating opportunity assingees.
      opportunity['assignees'] = [];

      if (opportunity.stageId) {
        const oppoAssignees = _.get(
          assigneesByOppo,
          `${opportunity.id}.assignees`,
          {},
        );

        if (_.get(oppoAssignees, 'unassigned')) {
          opportunity['assignees'].push('Unassigned');
        } else if (_.get(oppoAssignees, 'allMembers')) {
          opportunity['assignees'].push('All Members');
        } else {
          if (_.get(oppoAssignees, 'communityAdmins')) {
            opportunity['assignees'].push('Administrators');
          }
          if (_.get(oppoAssignees, 'communityModerators')) {
            opportunity['assignees'].push('Moderators');
          }
          if (_.get(oppoAssignees, 'communityUsers')) {
            opportunity['assignees'].push('All Community Users');
          }
          if (_.get(oppoAssignees, 'opportunityOwners')) {
            opportunity['assignees'].push('Owners');
          }
          if (_.get(oppoAssignees, 'opportunityTeams')) {
            opportunity['assignees'].push('Team');
          }
          if (_.get(oppoAssignees, 'opportunitySubmitters')) {
            opportunity['assignees'].push('Submitters');
          }
          opportunity['assignees'] = _.concat(
            opportunity['assignees'],
            _.compact(
              _.map(_.get(oppoAssignees, 'groups'), group => group.name),
            ),
          );
          opportunity['assignees'] = _.concat(
            opportunity['assignees'],
            _.compact(
              _.map(
                _.get(oppoAssignees, 'individuals'),
                user => `${user.firstName} ${user.lastName}`,
              ),
            ),
          );
        }

        // Considering as unassigned if no assignee calculated.
        if (!_.get(opportunity, 'assignees.length')) {
          opportunity['assignees'] = ['Unassigned'];
        }
      }

      // Rounding off Total Opportunity Score & Current Stage Score.
      if (opportunity['totalScore'])
        opportunity['totalScore'] = _.round(opportunity['totalScore'], 2);
      if (opportunity['currStageScore'])
        opportunity['currStageScore'] = _.round(
          opportunity['currStageScore'],
          2,
        );

      // Votes, comments & followers count.
      opportunity['votesCount'] = _.get(
        voteCountsByOppo,
        `${opportunity.id}.count`,
        0,
      );
      opportunity['commentsCount'] = _.get(
        commentsCountsByOppo,
        `${opportunity.id}.count`,
        0,
      );
      opportunity['followersCount'] = _.get(
        followersCountsByOppo,
        `${opportunity.id}.count`,
        0,
      );

      // Parsing custom fields' data.
      const oppoFieldsData = _.get(fieldsDataByOppo, opportunity.id, []);
      for (const fData of oppoFieldsData) {
        const field = _.get(fieldsById, fData.fieldId);
        if (field) {
          let fieldStoredData;
          if (
            [
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_LINE_TEXT,
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_LINE_TEXT,
            ].includes(field['customFieldType'].abbreviation)
          ) {
            // Parsing Single & Multi Line Text fields data.
            fieldStoredData = _.get(fData.fieldData, 'text', '');
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.RICH_TEXT
          ) {
            // Parsing Rich Text field data.
            fieldStoredData = _.replace(
              _.get(fData.fieldData, 'text', ''),
              /<[^>]+>/gi,
              '',
            );
            fieldStoredData = decode(fieldStoredData);
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.NUMBER
          ) {
            // Parsing Number field data.
            const isFormatted =
              _.get(field['fieldDataObject'], 'data.format', '') ===
              'formatted_number';

            const selectedNum = _.toString(
              _.get(fData.fieldData, 'number', ''),
            ).replace(',', '');
            fieldStoredData = isFormatted
              ? parseFloat(selectedNum).toLocaleString('en')
              : selectedNum;
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.DATEPICKER
          ) {
            // Parsing Datepicker field data.
            const year = _.get(fData.fieldData, 'date.year', '');
            const month = _.get(fData.fieldData, 'date.month', '');
            const day = _.get(fData.fieldData, 'date.day', '');
            if (year && month && day) {
              fieldStoredData = moment(
                `${month}/${day}/${year}`,
                'M/D/YYYY',
              ).format('MM/DD/YYYY');
            }
          } else if (
            [
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.FILE_UPLOAD,
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.VIDEO_UPLOAD,
              CUSTOM_FIELD_TYPE_ABBREVIATIONS.IMAGE_UPLOAD,
            ].includes(field['customFieldType'].abbreviation)
          ) {
            // Parsing Upload fields data.
            fieldStoredData = _.get(fData.fieldData, 'file', '');
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.USER_GROUP
          ) {
            // Parsing User or Group field data.
            fieldStoredData = [];
            const selectedUserGroups = _.get(fData.fieldData, 'selected', []);
            _.forEach(selectedUserGroups, userGroup => {
              if (_.get(userGroup, 'type') === 'Group') {
                fieldStoredData.push(
                  _.get(_.get(commGroupsById, _.get(userGroup, 'id')), 'name'),
                );
              } else if (_.get(userGroup, 'type') === 'User') {
                const selUser = _.get(commUsersById, _.get(userGroup, 'id'));
                if (selUser) {
                  fieldStoredData.push(
                    `${_.get(selUser, 'firstName', '')} ${_.get(
                      selUser,
                      'lastName',
                      '',
                    )}`,
                  );
                }
              }
            });
            fieldStoredData = _.compact(fieldStoredData);
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT
          ) {
            // Parsing Single Select field data.
            const options = _.get(field['fieldDataObject'], 'data', []);
            fieldStoredData = _.get(
              _.find(
                options,
                option =>
                  _.get(option, 'value') ===
                  _.get(fData.fieldData, 'selected', ''),
              ),
              'label',
            );
          } else if (
            field['customFieldType'].abbreviation ===
            CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT
          ) {
            // Parsing Multi Select field data.
            const options = _.get(field['fieldDataObject'], 'data', []);
            const optionsByVal = _.keyBy(options, 'value');
            const selectedVals = _.get(fData.fieldData, 'selected', []);
            fieldStoredData = _.compact(
              _.map(selectedVals, val => _.get(optionsByVal, `${val}.label`)),
            );
          }

          opportunity[`${field['uniqueId']}-data`] = fieldStoredData;
        }
      }

      // Parsing evaluation criteria responses.
      const oppoCriteriaResp = _.get(criteriaRespByOppo, opportunity.id, []);
      if (_.get(oppoCriteriaResp, 'length')) {
        const oppoScores = this.opportunityEvaluationResponseService.getCriteriaResponseScores(
          oppoCriteriaResp,
        );
        _.forEach(oppoScores, score => {
          if (
            score.criteria.evaluationType.abbreviation ===
            EVALUATION_TYPE_ABBREVIATIONS.NUMBER
          ) {
            opportunity[`criteria-${score.criteria.id}-score`] = `${_.get(
              score,
              'criteria.criteriaObject.unit',
              '',
            )} ${score.avgScore}`.trim();
          } else {
            opportunity[`criteria-${score.criteria.id}-score`] =
              score.avgNormalizedScore;
          }
        });
      }
    }

    // Create export file and directory.
    if (!existsSync('exports')) {
      mkdirSync('exports');
    }
    const rawFileName = `opportunities-export.${options.exportFormat}`;
    const fileName = `${Date.now().toString()}_opportunities-export.${
      options.exportFormat
    }`;
    const filePath = `exports/${fileName}`;

    // Export opportunities to file.
    if (options.exportFormat === 'csv') {
      const csvWriter = createCsvWriter({
        path: filePath,
        alwaysQuote: true,
        header: [
          { id: 'id', title: 'Idea Number' },
          { id: 'opportunityTypeName', title: 'Opportunity Type' },
          { id: 'title', title: 'Opportunity Title' },
          { id: 'description', title: 'Description' },
          { id: 'totalScore', title: 'Total Score' },
          { id: 'currStageScore', title: 'Current Stage Score' },
          { id: 'challengeTitle', title: 'Challenge Name' },
          { id: 'createdDate', title: 'Created Date' },
          { id: 'assignees', title: 'Assigned To' },
          { id: 'submitters', title: 'Submitter and Co-submitters' },
          { id: 'team', title: 'Team Members' },
          { id: 'owners', title: 'Owners' },
          {
            id: 'submitterGroups',
            title: 'Groups that Submitter is a Member of',
          },
          { id: 'url', title: 'URL' },
          { id: 'tagNames', title: 'Tags' },
          { id: 'workflowTitle', title: 'Current Workflow' },
          { id: 'stageTitle', title: 'Current Stage' },
          { id: 'statusTitle', title: 'Current Status' },
          { id: 'currStatusDays', title: 'Days in Current Status' },
          { id: 'viewCount', title: 'Count of Views ' },
          { id: 'votesCount', title: 'Count of Votes' },
          { id: 'commentsCount', title: 'Count of Comments' },
          { id: 'followersCount', title: 'Count of Followers' },

          // Custom Fields.
          ...(customFields.length &&
            customFields.map(field => {
              const prefix = _.get(field['fieldDataObject'], 'data.prefix', '');
              const suffix = _.get(field['fieldDataObject'], 'data.suffix', '');
              return {
                id: `${field['uniqueId']}-data`,
                title: `${field['title']} ${
                  prefix || suffix ? `(${prefix}${suffix})` : ''
                }`.trim(),
              };
            })),

          // Review / Criteria.
          ...(criteria.length &&
            criteria.map(crit => ({
              id: `criteria-${crit.id}-score`,
              title: `${crit.title}${
                crit.evaluationType.abbreviation ===
                EVALUATION_TYPE_ABBREVIATIONS.QUESTION
                  ? ' (Max Score = 10)'
                  : ''
              }`,
            }))),
        ],
      });
      await csvWriter.writeRecords(opportunities);
    }

    // Upload the saved file to S3
    const s3FileUrl = await this.awsS3Service.uploadFile(
      fileName,
      'attachments/exports/opportunity',
      'exports',
    );

    // Remove the local file asynchronously.
    unlink(filePath, err => {
      if (err)
        Logger.error(
          `Error while deleting the exported file '${filePath}':`,
          JSON.stringify(err),
        );
    });

    // Return S3 file url and raw file name.
    return {
      url: s3FileUrl,
      fileName: rawFileName,
    };
  }

  /**
   * Updates the statuses of the action items for the current stage of the given
   * opportunity.
   *
   * @param opportunity Opportunity for which to update the action items.
   * @param stageEntityType Stage Entity Type.
   * @param oppoEntityType Opportunity Entity Type.
   * @param community Community of the user & opportunity.
   */
  async updateCurrentStageActionItemStatus(
    opportunity: OpportunityEntity,
    stageEntityType: EntityTypeEntity,
    oppoEntityType: EntityTypeEntity,
    community: number,
    updateActionItem = true,
  ): Promise<void> {
    let actionItemStatus = ActionItemLogStatusEnum.INCOMPLETE;

    // For refinement stage mark complete if the stage progress is at 100%,
    // Otherwise, mark it as incomplete.
    if (
      opportunity.stage.actionItem.abbreviation ===
      ACTION_ITEM_ABBREVIATIONS.REFINEMENT
    ) {
      const stageProgress = await this.stageCompletionStats({
        opportunityId: opportunity.id,
        communityId: community,
        opportunity,
        stageEntityType,
        opportunityEntityType: oppoEntityType,
      });
      actionItemStatus =
        stageProgress.completed / stageProgress.total === 1
          ? ActionItemLogStatusEnum.COMPLETE
          : ActionItemLogStatusEnum.INCOMPLETE;

      if (actionItemStatus === ActionItemLogStatusEnum.COMPLETE) {
        updateActionItem = true;
      }
    }

    if (updateActionItem) {
      NotificationHookService.updateActionItemLogStatus(
        {
          community,
          entityObjectId: opportunity.id,
          entityTypeId: oppoEntityType.id,
          status: ActionItemLogStatusEnum.OPEN,
        },
        {
          status: actionItemStatus,
        },
      );
    }
  }

  /**
   * Get experience settings count
   */
  async getBulkOpportunitiesExperinceSettingsCount(data): Promise<{}[]> {
    if (!_.get(data.opportunityIds, 'length')) return [];
    const rawResponse = await this.entityExperienceSettingService.getBulkOpportunityExperienceSettingsCount(
      { opportunityIds: data.opportunityIds, type: data.type },
    );
    return rawResponse.map(res => ({
      opportunityId: res['opportunityid'],
      allowVoting: res['allow_voting'],
      allowCommenting: res['allow_commenting'],
    }));
  }

  /**
   * Bulk update opportunity settings
   */
  async bulkUpdateOpportunitySettings(data, actorData): Promise<{}> {
    const entityExperienceSetting = data['entityExperienceSetting'];
    const entityVisibilitySetting = data['entityVisibilitySetting'];
    let response = null;

    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    this.getBulkOpportunitiesExperinceSettingsCount(data);

    if (entityVisibilitySetting) {
      const dataToUpdate = { roles: [], groups: [], public: false };
      if (entityVisibilitySetting.public) {
        dataToUpdate.public = true;
      } else if (entityVisibilitySetting.private) {
        const ownerRole = await this.roleService.getRoles({
          where: {
            title: In([
              RolesEnum.admin,
              RolesEnum.moderator,
              RolesEnum.opportunityOwner,
              RolesEnum.opportunityContributor,
              RolesEnum.opportunitySubmitter,
            ]),
            community: actorData['currentCommunity'],
          },
        });
        const roleIds = _.map(ownerRole, 'id');
        dataToUpdate.roles = roleIds;
      } else if (
        entityVisibilitySetting.groups &&
        entityVisibilitySetting.groups.length
      ) {
        dataToUpdate.groups = entityVisibilitySetting.groups;
      } else {
        // If nothing selected, defaults to public.
        dataToUpdate.public = true;
      }
      response = await this.entityVisibilitySettingService.updateEntityVisibilitySetting(
        {
          entityType: entityType.id,
          entityObjectId:
            data.opportunityIds !== null ? In(data.opportunityIds) : null,
          community: actorData['currentCommunity'],
        },
        dataToUpdate,
      );
    }
    if (entityExperienceSetting) {
      // save opportunity experience/collaboration settings
      response = await this.entityExperienceSettingService.updateEntityExperienceSetting(
        {
          entityType: entityType,
          entityObjectId:
            data.opportunityIds !== null ? In(data.opportunityIds) : null,
          community: actorData['currentCommunity'],
        },
        entityExperienceSetting,
      );
    }
    return response;
  }
}
