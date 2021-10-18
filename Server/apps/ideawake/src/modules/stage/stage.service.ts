import { Injectable } from '@nestjs/common';
import { StageRepository } from './stage.repository';
import { StageEntity } from './stage.entity';
import { StageAssigneeSettingsRepository } from './stageAssigneeSettings.repository';
import { StageAssignmentSettingsRepository } from './stageAssignmentSettings.repository';
import { StageNotificationSettingRepository } from './stageNotificationSetting.repository';
import {
  ENTITY_TYPES,
  ROLE_ABBREVIATIONS,
  TABLES,
} from '../../common/constants/constants';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { StageAssigneeSettingsTypeEnum } from '../../enum/stage-assignee-settings.enum';
import { RoleActorTypes } from '../../enum';
import { groupBy, map, uniqBy, head, forEach, keyBy, get } from 'lodash';
import { CommunityService } from '../community/community.service';
import { RoleService } from '../role/role.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { In } from 'typeorm';
import { UpdateStageOrderDto } from '../workflow/dto/UpdateStageOrderDto';
import { OpportunityService } from '../opportunity/opportunity.service';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { StageAssigneeSettingsEntity } from './stageAssigneeSettings.entity';
import { StageAssignmentSettingsEntity } from './stageAssignmentSettings.entity';
import { StageNotificationSettingEntity } from './stageNotificationSetting.entity';
import { OpportunityFieldLinkageService } from '../customField/opportunityFieldLinkage.service';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { EvaluationCriteriaIntegrationService } from '../evaluationCriteria/evaluationCriteriaIntegration.service';
import { FollowingContentService } from '../followingContent/followingContent.service';
import { VoteService } from '../vote/vote.service';
import { CircleService } from '../circle/circle.service';
import { StageAssignmentSettingService } from './stageAssignmentSettings.service';
import { StageAssigneeService } from './stageAssigneeSettings.service';
import { StageNotificationSettingService } from './stageNotificationSetting.service';

@Injectable()
export class StageService {
  constructor(
    public readonly stageRepository: StageRepository,
    public readonly stageAssigneeSettingsRepository: StageAssigneeSettingsRepository,
    public readonly stageAssignmentSettingsRepository: StageAssignmentSettingsRepository,
    public readonly stageNotificationSettingRepository: StageNotificationSettingRepository,
    public readonly communityService: CommunityService,
    public readonly roleService: RoleService,
    public readonly roleActorsService: RoleActorsService,
    public readonly opportunityService: OpportunityService,
    public readonly customFieldIntegrationService: CustomFieldIntegrationService,
    public readonly opportunityFieldLinkageService: OpportunityFieldLinkageService,
    public readonly evaluationCriteriaIntegrationService: EvaluationCriteriaIntegrationService,
    public readonly followingContentService: FollowingContentService,
    public readonly voteService: VoteService,
    public readonly circleService: CircleService,
    public readonly stageAssigneeService: StageAssigneeService,
    public readonly stageAssignmentSettingService: StageAssignmentSettingService,
    public readonly stageNotificationSettingService: StageNotificationSettingService,
  ) {}

  /**
   * Get stages
   */
  async getStages(options: {}): Promise<StageEntity[]> {
    return this.stageRepository.find(options);
  }

  /**
   * Get stages
   */
  async getStagesWithCounts(options: {}): Promise<StageEntity[]> {
    const challenge = options['challenge'];
    delete options['challenge'];

    const stages = await this.getStages(options);

    if (stages && stages.length) {
      const stageIds = stages.map(stage => stage.id);

      const oppOptions: {} = {
        where: { stage: In(stageIds), isDeleted: false },
      };
      if (challenge) {
        oppOptions['where'] = { ...oppOptions['where'], challenge };
      }

      const opportunities = await this.opportunityService.getOpportunities(
        oppOptions,
      );
      const opportunitiesGrouped = groupBy(opportunities, 'stageId');
      stages.map(stage => {
        stage['opportunitiesCount'] = opportunitiesGrouped[stage.id]
          ? opportunitiesGrouped[stage.id].length
          : 0;
      });
    }

    return stages;
  }

  /**
   * Get one stage
   */
  async getOneStage(options: {}): Promise<StageEntity> {
    let stage = await this.stageRepository.findOne(options);

    if (stage) {
      const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.STAGE,
      );
      const stageSettings = await this.getStageSettings({
        entityObjectId: stage.id,
        entityType: stageEntityType,
      });
      stage = {
        ...stage,
        ...stageSettings,
      };
    }

    return stage;
  }

  /**
   * Get stages with settings
   */
  async getStagesWithSettings(stages): Promise<any> {
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    const stageIds = stages.map(stage => stage.id);

    const options: {} = {
      where: {
        entityObjectId: In(stageIds),
        entityType: stageEntityType,
      },
    };

    const stageSettings = await this.getBulkStageSettings(options);

    const assigneeSettingsById = keyBy(
      stageSettings.assigneeSettings,
      'entityObjectId',
    );
    const stageActivityVisibilitySettingsById = keyBy(
      stageSettings.stageActivityVisibilitySettings,
      'entityObjectId',
    );
    const stageAssignmentSettingsById = keyBy(
      stageSettings.stageAssignmentSettings,
      'entityObjectId',
    );
    const stageNotificationSettingsById = keyBy(
      stageSettings.stageNotificationSettings,
      'entityObjectId',
    );

    const updatedStages = stages.map(stage => {
      const assigneeSettings = assigneeSettingsById[stage.id];
      const stageActivityVisibilitySettings =
        stageActivityVisibilitySettingsById[stage.id];
      const stageAssignmentSettings = stageAssignmentSettingsById[stage.id];
      const stageNotificationSettings = stageNotificationSettingsById[stage.id];
      const updatedStage = {
        ...stage,
        assigneeSettings,
        stageActivityVisibilitySettings,
        stageAssignmentSettings,
        stageNotificationSettings,
      };
      return updatedStage;
    });
    return updatedStages;
  }

  /**
   * Get stage settings for multiple entity object ids and entity type.
   */
  async getBulkStageSettings(options: {}): Promise<{
    assigneeSettings: StageAssigneeSettingsEntity[];
    stageActivityVisibilitySettings: StageAssigneeSettingsEntity[];
    stageAssignmentSettings: StageAssignmentSettingsEntity[];
    stageNotificationSettings: StageNotificationSettingEntity[];
  }> {
    const assigneeOptions = options;
    assigneeOptions['where'] = {
      ...assigneeOptions['where'],
      settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
    };

    const visibilityOptions = options;
    visibilityOptions['where'] = {
      ...visibilityOptions['where'],
      settingsType: StageAssigneeSettingsTypeEnum.VISIBILITY,
    };

    const [
      assigneeSettings,
      stageActivityVisibilitySettings,
      stageAssignmentSettings,
      stageNotificationSettings,
    ] = await Promise.all([
      this.stageAssigneeSettingsRepository.find({
        ...assigneeOptions,
      }),
      this.stageAssigneeSettingsRepository.find({
        ...visibilityOptions,
      }),
      this.stageAssignmentSettingsRepository.find(options),
      this.stageNotificationSettingRepository.find(options),
    ]);

    return {
      assigneeSettings,
      stageActivityVisibilitySettings,
      stageAssignmentSettings,
      stageNotificationSettings,
    };
  }
  /**
   * Get stage settings for given entity object id and entity type.
   */
  async getStageSettings(options: {}): Promise<{
    assigneeSettings: StageAssigneeSettingsEntity;
    stageActivityVisibilitySettings: StageAssigneeSettingsEntity;
    stageAssignmentSettings: StageAssignmentSettingsEntity;
    stageNotificationSettings: StageNotificationSettingEntity;
  }> {
    const [
      assigneeSettings,
      stageActivityVisibilitySettings,
      stageAssignmentSettings,
      stageNotificationSettings,
    ] = await Promise.all([
      this.stageAssigneeSettingsRepository.findOne({
        ...options,
        settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
      }),
      this.stageAssigneeSettingsRepository.findOne({
        ...options,
        settingsType: StageAssigneeSettingsTypeEnum.VISIBILITY,
      }),
      this.stageAssignmentSettingsRepository.findOne(options),
      this.stageNotificationSettingRepository.findOne(options),
    ]);

    return {
      assigneeSettings,
      stageActivityVisibilitySettings,
      stageAssignmentSettings,
      stageNotificationSettings,
    };
  }

  /**
   * Get settings and details for given stages.
   * @param stages Stages against settings need to be fetched.
   */
  async getStagesSettingsDetails(
    stages: StageEntity[],
  ): Promise<
    {
      stage: number;
      assigneeSettings?: StageAssigneeSettingsEntity;
      assignmentSettings?: StageAssignmentSettingsEntity;
      criteria?: {}[];
      customFields?: {}[];
    }[]
  > {
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    const stageIds = stages.map(stage => stage.id);

    const [
      assigneeSettings,
      assignmentSettings,
      criteria,
      customFields,
      communityUsersData,
      allGroups,
    ] = await Promise.all([
      // Getting assignee settings.
      this.stageAssigneeSettingsRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
          settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
        },
      }),

      // Getting assignment settings.
      this.stageAssignmentSettingsRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
        },
      }),

      // Getting all integrated evaluation criteria against staged.
      this.evaluationCriteriaIntegrationService.getEvaluationCriteriaIntegrations(
        {
          where: {
            entityObjectId: In(stageIds),
            entityType: stageEntityType,
          },
          relations: ['evaluationCriteria'],
        },
      ),

      // Getting all integrated custom fields against staged.
      this.customFieldIntegrationService.getCustomFieldIntegrations({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
        },
        relations: ['field', 'field.customFieldType'],
      }),

      // Getting all community users
      this.communityService.getCommunityUsers({
        communityId: stages[0].communityId,
      }),

      // Getting all community groups.
      this.circleService.getCircles({
        where: {
          community: stages[0].communityId,
        },
      }),
    ]);

    // Mapping groups and user ids to their respective objcects.
    const allUsers = map(communityUsersData[0]['communityUsers'], 'user');
    const allUsersGrouped = groupBy(allUsers, 'id');
    const allGroupsGrouped = groupBy(allGroups, 'id');

    forEach(assigneeSettings, (setting: {}) => {
      setting['groups'] = setting['groups'].map(groupId =>
        head(allGroupsGrouped[groupId]),
      );
      setting['individuals'] = setting['individuals'].map(user =>
        head(allUsersGrouped[user]),
      );
    });

    // Grouping settings and details by stage ids.
    const assigneeSettingsGrouped = groupBy(assigneeSettings, 'entityObjectId');
    const assignmentSettingsGrouped = groupBy(
      assignmentSettings,
      'entityObjectId',
    );
    const criteriaGrouped = groupBy(criteria, 'entityObjectId');
    const customFieldsGrouped = groupBy(customFields, 'entityObjectId');

    // Structuring data to be returned.
    const stageData = [];
    for (const stage of stages) {
      stageData.push({
        stage: stage.id,
        assigneeSettings: head(assigneeSettingsGrouped[stage.id]),
        assignmentSettings: head(assignmentSettingsGrouped[stage.id]),
        criteria: criteriaGrouped[stage.id],
        customFields: customFieldsGrouped[stage.id],
      });
    }

    return stageData;
  }

  /**
   * Fetches raw settings for the given stages.
   * @param stageIds Stage ids against which settings need to be fetched.
   */
  async getRawStagesSettings(
    stageIds: number[],
  ): Promise<
    {
      stageId: number;
      assigneeSettings: StageAssigneeSettingsEntity;
      stageAssignmentSettings?: StageAssignmentSettingsEntity;
      stageNotificationSettings?: StageNotificationSettingEntity;
      stageActivityVisibilitySettings?: StageAssigneeSettingsEntity;
    }[]
  > {
    if (!stageIds.length) {
      return [];
    }

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    const [
      assigneeSettings,
      assignmentSettings,
      notificationSettings,
      activityVisSettings,
    ] = await Promise.all([
      // Getting assignee settings.
      this.stageAssigneeSettingsRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
          settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
        },
      }),

      // Getting assignment settings.
      this.stageAssignmentSettingsRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
        },
      }),

      // Getting notification settings.
      this.stageNotificationSettingRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
        },
      }),

      // Getting activity visibility settings.
      this.stageAssigneeSettingsRepository.find({
        where: {
          entityObjectId: In(stageIds),
          entityType: stageEntityType,
          settingsType: StageAssigneeSettingsTypeEnum.VISIBILITY,
        },
      }),
    ]);

    // Grouping settings by stage ids.
    const assigneeSettingsGrouped = keyBy(assigneeSettings, 'entityObjectId');
    const assignmentSettingsGrouped = keyBy(
      assignmentSettings,
      'entityObjectId',
    );
    const notificationSetGrouped = keyBy(
      notificationSettings,
      'entityObjectId',
    );
    const activityVisSetGrouped = keyBy(activityVisSettings, 'entityObjectId');

    // Structuring data to be returned.
    return stageIds.map(stageId => ({
      stageId,
      assigneeSettings: get(assigneeSettingsGrouped, stageId),
      stageAssignmentSettings: get(assignmentSettingsGrouped, stageId),
      stageNotificationSettings: get(notificationSetGrouped, stageId),
      stageActivityVisibilitySettings: get(activityVisSetGrouped, stageId),
    }));
  }

  /**
   * Get one stage
   */
  async getStagePotentialAssigneesCount(params: {
    community: number;
    entityType?: number;
    entityObjectId?: number;
  }): Promise<{}> {
    // Getting all community users.
    const communityData = await this.communityService.getCommunityUsers({
      communityId: params.community,
      isDeleted: false,
    });
    const communityUsers = head(map(communityData, 'communityUsers'));

    // Getting all required roles to find number of users for each one.
    const roles = await this.roleService.getRoles({
      where: {
        community: params.community,
        abbreviation: In([
          ROLE_ABBREVIATIONS.ADMIN,
          ROLE_ABBREVIATIONS.MODERATOR,
          ROLE_ABBREVIATIONS.USER,
        ]),
      },
    });
    const roleActors = communityUsers.length
      ? await this.roleActorsService.getRoleActors({
          where: {
            actorId: In(communityUsers.map(commUser => commUser.user.id)),
            actorType: RoleActorTypes.USER,
            role: In(roles.map(role => role.id)),
          },
        })
      : [];
    const roleActorsGroupedByIds = groupBy(roleActors, 'roleId');

    // Getting Opportunity Roles' Actores
    const roleActorsGrouped = await this.opportunityService.getOpportunityRoleActors(
      params,
    );

    // Adding in Community Roles' Actors.
    map(roleActorsGroupedByIds, (val, key) => {
      roleActorsGrouped[
        roles.find(r => r.id == parseInt(key)).abbreviation
      ] = uniqBy(val, 'actorId');
    });

    return {
      allCommunityMembers: communityUsers.length,
      communityAdmins: roleActorsGrouped[ROLE_ABBREVIATIONS.ADMIN]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.ADMIN].length
        : 0,
      communityModerators: roleActorsGrouped[ROLE_ABBREVIATIONS.MODERATOR]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.MODERATOR].length
        : 0,
      communityUsers: roleActorsGrouped[ROLE_ABBREVIATIONS.USER]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.USER].length
        : 0,
      opportunityOwners: roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER].length
        : 0,
      opportunityTeamMembers: roleActorsGrouped[
        ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR
      ]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR].length
        : 0,
      opportunitySubmitters: roleActorsGrouped[
        ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER
      ]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER].length
        : 0,
    };
  }

  /**
   * Get Notifiable users count for the given entity.
   * @param params Entity options to find users for.
   */
  async getNotifiableUsersCount(params: {
    community: number;
    entityType: number;
    entityObjectId: number;
  }): Promise<{}> {
    // Find users for all opportunity roles.
    const roleActorsGrouped = await this.opportunityService.getOpportunityRoleActors(
      params,
    );

    // Find followers.
    const followingContents = await this.followingContentService.getFollowingContents(
      {
        where: {
          entityObjectId: params.entityObjectId,
          entityType: params.entityType,
          community: params.community,
        },
        relations: ['userFollowingContents'],
      },
    );
    let followers = [];
    if (followingContents && followingContents.length) {
      followers = followingContents[0].userFollowingContents;
    }

    // Find voters.
    const voters = await this.voteService.getAllVote({
      where: {
        entityObjectId: params.entityObjectId,
        entityType: params.entityType,
        community: params.community,
      },
    });

    return {
      opportunityOwners: roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER].length
        : 0,
      opportunityTeamMembers: roleActorsGrouped[
        ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR
      ]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR].length
        : 0,
      opportunitySubmitters: roleActorsGrouped[
        ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER
      ]
        ? roleActorsGrouped[ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER].length
        : 0,
      followers: followers.length,
      voters: voters.length,
    };
  }

  /**
   * Add stage
   */
  async addStage(data: {}): Promise<StageEntity> {
    const assigneeSettings = data['assigneeSettings'];
    const activityVisibilitySettings = data['stageActivityVisibilitySettings'];
    const assignmentSettings = data['stageAssignmentSettings'];
    const notificationSettings = data['stageNotificationSettings'] || {};
    const attachedCustomFields = data['attachedCustomFields'] || [];
    const attachedEvaluationCriteria = data['attachedEvaluationCriteria'] || [];
    delete data['assigneeSettings'];
    delete data['stageActivityVisibilitySettings'];
    delete data['stageAssignmentSettings'];
    delete data['stageNotificationSettings'];
    delete data['attachedCustomFields'];
    delete data['attachedEvaluationCriteria'];

    data['isDeleted'] = false;
    if (!data['orderNumber']) {
      const result = await this.stageRepository
        .createQueryBuilder(TABLES.STAGE)
        .select(`MAX(${TABLES.STAGE}.orderNumber) as max`)
        .andWhere(`${TABLES.STAGE}.workflow = :workflow`, {
          workflow: data['workflow'],
        })
        .andWhere(`${TABLES.STAGE}.community = :community`, {
          community: data['community'],
        })
        .getRawOne();
      data['orderNumber'] = result && result.max ? parseInt(result.max) + 1 : 1;
    }
    const stageCreated = this.stageRepository.create(data);
    const stageSaved = await this.stageRepository.save(stageCreated);

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    // Attaching Evaluation Criteria for refinement stage.
    const evaluationCriteriaIntegrations = attachedEvaluationCriteria.map(
      field => ({
        ...field,
        entityType: stageEntityType,
        entityObjectId: stageSaved.id,
        community: stageSaved.community,
      }),
    );
    await this.evaluationCriteriaIntegrationService.addEvaluationCriteriaIntegration(
      evaluationCriteriaIntegrations,
    );
    // Attaching Custom Fields for refinement stage.
    const customFieldsIntegrations = attachedCustomFields.map(field => ({
      ...field,
      entityType: stageEntityType,
      entityObjectId: stageSaved.id,
      community: stageSaved.community,
    }));
    await this.customFieldIntegrationService.addCustomFieldIntegration(
      customFieldsIntegrations,
    );

    // Add stage notification settings
    const notiSettingsCreated = this.stageNotificationSettingRepository.create({
      ...notificationSettings,
      entityType: stageEntityType,
      entityObjectId: stageSaved.id,
      community: stageSaved.community,
    });
    stageSaved[
      'stageNotificationSettings'
    ] = await this.stageNotificationSettingRepository.save(notiSettingsCreated);

    // Add stage assignee settings.
    if (assigneeSettings) {
      stageSaved['assigneeSettings'] = await this.addAssigneeSettings(
        assigneeSettings,
        stageEntityType,
        stageSaved,
        StageAssigneeSettingsTypeEnum.ASSIGNEE,
      );
    }

    // Add stage activity visibility settings.
    if (activityVisibilitySettings) {
      stageSaved[
        'stageActivityVisibilitySettings'
      ] = await this.addAssigneeSettings(
        activityVisibilitySettings,
        stageEntityType,
        stageSaved,
        StageAssigneeSettingsTypeEnum.VISIBILITY,
      );
    }

    // Add stage assignment and completion settings
    if (assignmentSettings) {
      if (assignmentSettings['stageTimeLimit']) {
        assignmentSettings['stageTimeLimit'] = Math.abs(
          assignmentSettings['stageTimeLimit'],
        );
      }
      if (assignmentSettings['completionTimeLimit']) {
        assignmentSettings['completionTimeLimit'] = Math.abs(
          assignmentSettings['completionTimeLimit'],
        );
      }
      const assignmentSettingsCreated = this.stageAssignmentSettingsRepository.create(
        {
          ...assignmentSettings,
          entityType: stageEntityType,
          entityObjectId: stageSaved.id,
          community: stageSaved.community,
        },
      );
      stageSaved[
        'stageAssignmentSettings'
      ] = await this.stageAssignmentSettingsRepository.save(
        assignmentSettingsCreated,
      );
    }

    return stageSaved;
  }

  private async addAssigneeSettings(
    settings,
    stageEntityType,
    stage,
    settingsType,
  ): Promise<{}> {
    settings['entityType'] = stageEntityType;
    settings['entityObjectId'] = stage.id;
    settings['community'] = stage.community;
    settings['settingsType'] = settingsType;
    const settingsCreated = this.stageAssigneeSettingsRepository.create(
      settings,
    );
    return this.stageAssigneeSettingsRepository.save(settingsCreated);
  }

  async simpleUpdateStage(options: {}, data: {}): Promise<{}> {
    return this.stageRepository.update(options, data);
  }

  /**
   * Update stage
   */
  async updateStage(options: {}, data: {}): Promise<{}> {
    const assigneeSettings = data['assigneeSettings'] || {};
    const activityVisibilitySettings =
      data['stageActivityVisibilitySettings'] || {};
    const assignmentSettings = data['stageAssignmentSettings'] || {};
    const notificationSettings = data['stageNotificationSettings'] || {};
    const attachedCustomFields = data['attachedCustomFields'] || [];
    const attachedEvaluationCriteria = data['attachedEvaluationCriteria'] || [];

    delete data['assigneeSettings'];
    delete data['stageActivityVisibilitySettings'];
    delete data['stageAssignmentSettings'];
    delete data['stageNotificationSettings'];
    delete data['attachedCustomFields'];
    delete data['attachedEvaluationCriteria'];

    const existingStage = await this.stageRepository.findOne({
      where: options,
    });

    const stageUpdated = await this.stageRepository.update(options, data);

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    // Update existing (current) opportunities with udpated custom fields.
    this.updateExistingOpportunitiesLinkedFields({
      stageId: existingStage.id,
      updatedFields: attachedCustomFields,
      stageEntityType,
    });

    // Updating attached Custom Fields for refinement stage.
    await this.customFieldIntegrationService.deleteCustomFieldIntegration({
      entityType: stageEntityType,
      entityObjectId: options['id'],
      community: existingStage.communityId,
    });
    const customFieldsIntegrations = attachedCustomFields.map(field => ({
      ...field,
      entityType: stageEntityType,
      entityObjectId: options['id'],
      community: existingStage.communityId,
    }));
    await this.customFieldIntegrationService.addCustomFieldIntegration(
      customFieldsIntegrations,
    );
    // Updating attached Evaluation Criteria for refinement stage.
    await this.evaluationCriteriaIntegrationService.deleteEvaluationCriteriaIntegration(
      {
        entityType: stageEntityType,
        entityObjectId: options['id'],
        community: existingStage.communityId,
      },
    );

    const evaluationCriteriaIntegrations = attachedEvaluationCriteria.map(
      field => ({
        ...field,
        entityType: stageEntityType,
        entityObjectId: options['id'],
        community: existingStage.communityId,
      }),
    );
    await this.evaluationCriteriaIntegrationService.addEvaluationCriteriaIntegration(
      evaluationCriteriaIntegrations,
    );

    // Update notification settings,
    this.stageNotificationSettingService.addOrUpdateStageNotificationSetting(
      {
        entityObjectId: options['id'],
        entityType: stageEntityType,
      },
      {
        ...notificationSettings,
        entityObjectId: options['id'],
        entityType: stageEntityType,
      },
    );

    // Update stage assignee settings.
    this.stageAssigneeService.addOrUpdateStageAssigneeSetting(
      {
        entityObjectId: options['id'],
        entityType: stageEntityType,
        settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
      },
      {
        ...assigneeSettings,
        entityObjectId: options['id'],
        entityType: stageEntityType,
        settingsType: StageAssigneeSettingsTypeEnum.ASSIGNEE,
      },
    );

    // Update stage activity visibility settings.
    this.stageAssigneeService.addOrUpdateStageAssigneeSetting(
      {
        entityObjectId: options['id'],
        entityType: stageEntityType,
        settingsType: StageAssigneeSettingsTypeEnum.VISIBILITY,
      },
      {
        ...activityVisibilitySettings,
        entityObjectId: options['id'],
        entityType: stageEntityType,
        settingsType: StageAssigneeSettingsTypeEnum.VISIBILITY,
      },
    );

    // Update stage assignment settings.
    if (assignmentSettings['stageTimeLimit']) {
      assignmentSettings['stageTimeLimit'] = Math.abs(
        assignmentSettings['stageTimeLimit'],
      );
    }
    if (assignmentSettings['completionTimeLimit']) {
      assignmentSettings['completionTimeLimit'] = Math.abs(
        assignmentSettings['completionTimeLimit'],
      );
    }
    this.stageAssignmentSettingService.addOrUpdateStageAssignmentSetting(
      {
        entityObjectId: options['id'],
        entityType: stageEntityType,
      },
      {
        ...assignmentSettings,
        entityObjectId: options['id'],
        entityType: stageEntityType,
      },
    );

    return stageUpdated;
  }

  async updateExistingOpportunitiesLinkedFields(params: {
    stageId: number;
    updatedFields: Array<{}>;
    stageEntityType: EntityTypeEntity;
  }): Promise<{}> {
    const exisitngIntegratedFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityObjectId: params.stageId,
        entityType: params.stageEntityType,
      },
    );

    const opportunities = await this.opportunityService.getOpportunities({
      where: { stage: params.stageId },
    });

    return this.opportunityFieldLinkageService.updateExistingOpportunitiesLinkedFields(
      {
        opportunities,
        updatedFields: params.updatedFields,
        exisitngIntegratedFields,
        fieldIntegrationType: FieldIntegrationTypeEnum.STAGE,
      },
    );
  }

  /**
   * Update stages order
   */
  async updateStagesOrder(
    data: UpdateStageOrderDto,
    community: number,
  ): Promise<{}> {
    let orderNumber = 0;
    const updatedStages = await Promise.all(
      data.stages.map(stage => {
        orderNumber += 1;
        return this.simpleUpdateStage(
          { id: stage, workflow: data.workflow, community },
          { orderNumber },
        );
      }),
    );
    const aggregatedResult = updatedStages.reduce((a, b) => ({
      generatedMaps: (a['generatedMaps'] || []).concat(
        b['generatedMaps'] || [],
      ),
      raw: (a['raw'] || []).concat(b['raw'] || []),
      affected: (a['affected'] || 0) + (b['affected'] || 0),
    }));
    return aggregatedResult;
  }

  /**
   * Delete stage
   */
  async deleteStage(options: {}): Promise<{}> {
    return this.updateStage(options, { isDeleted: true });
  }
}
