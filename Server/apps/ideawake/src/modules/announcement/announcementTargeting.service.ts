import { Injectable } from '@nestjs/common';
import { AnnouncementTargetingRepository } from './announcementTargeting.repository';
import { AnnouncementTargetingEntity } from './announcementTargeting.entity';
import { AnnouncementEntity } from './announcement.entity';
import {
  concat,
  Dictionary,
  difference,
  forEach,
  get,
  groupBy,
  isEmpty,
  keyBy,
  max,
  pick,
  uniq,
} from 'lodash';
import * as moment from 'moment';
import {
  ENTITY_TYPES,
  PERMISSIONS_MAP,
  ROLE_ABBREVIATIONS,
} from '../../common/constants/constants';
import { RoleService } from '../role/role.service';
import { In, UpdateResult } from 'typeorm';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UserCircleService } from '../user/userCircle.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeParticipantEntity } from '../challenge/challengeParticipant.entity';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { ActionItemLogStatusEnum, RoleActorTypes } from '../../enum';
import { StageService } from '../stage/stage.service';
import { ActionItemLogService } from '../actionItem/actionItemLog.service';
import { GetPotentialTargetsCountDto } from './dto/GetPotentialTargetsCountDto';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AnnouncementTargetingService {
  constructor(
    public readonly announcementTargetingRepository: AnnouncementTargetingRepository,
    private roleService: RoleService,
    private roleActorService: RoleActorsService,
    private userService: UserService,
    private userCircleService: UserCircleService,
    private stageService: StageService,
    private challengeService: ChallengeService,
    private opportunityService: OpportunityService,
    private actionItemLogService: ActionItemLogService,
  ) {}

  /**
   * Get AnnouncementTargetings
   */
  async getAnnouncementTargetings(options: {}): Promise<
    AnnouncementTargetingEntity[]
  > {
    return this.announcementTargetingRepository.find(options);
  }

  /**
   * Get single AnnouncementTargetings
   */
  async getAnnouncementTargeting(options: {}): Promise<
    AnnouncementTargetingEntity
  > {
    return this.announcementTargetingRepository.findOne(options);
  }

  /**
   * Add Raw AnnouncementTargeting
   */
  async addRawAnnouncementTargeting(data: {}): Promise<
    AnnouncementTargetingEntity
  > {
    const announcementTargetingCreated = this.announcementTargetingRepository.create(
      data,
    );
    return this.announcementTargetingRepository.save(
      announcementTargetingCreated,
    );
  }

  /**
   * Add announcement targeting from configuration.
   */
  async addAnnouncementTargeting(data: {
    targetingSetting: {};
    announcement: AnnouncementEntity;
    community: number;
  }): Promise<AnnouncementTargetingEntity> {
    const parsedTargetSettings = await this.parseAnnouncementTargetingConfig(
      data,
    );
    return this.addRawAnnouncementTargeting(parsedTargetSettings);
  }

  /**
   * Update Raw AnnouncementTargeting
   */
  async updateRawAnnouncementTargeting(
    options: {},
    data: {},
  ): Promise<UpdateResult> {
    return this.announcementTargetingRepository.update(options, data);
  }

  /**
   * Update announcement targeting from configuration
   */
  async updateAnnouncementTargeting(data: {
    targetingSetting: {};
    announcement: AnnouncementEntity;
    community: number;
  }): Promise<UpdateResult> {
    const parsedTargetSettings = await this.parseAnnouncementTargetingConfig(
      data,
    );
    return this.updateRawAnnouncementTargeting(
      { announcement: data.announcement, community: data.community },
      parsedTargetSettings,
    );
  }

  /**
   * Parse announcement targeting configuration to raw setting.
   * Note: This is a wrapper around parseConfigToRawTargeting method and caters
   * announcement object as well.
   *
   * @param data Targeting configuration.
   */
  async parseAnnouncementTargetingConfig(data: {
    targetingSetting: {};
    announcement: AnnouncementEntity;
    community: number;
  }): Promise<{}> {
    return {
      ...(await this.parseConfigToRawTargeting({
        targetingSetting: data.targetingSetting,
        community: data.community,
      })),
      announcement: data.announcement,
      community: data.community,
    };
  }

  /**
   * Parse announcement targeting configuration to raw setting.
   * @param data Targeting configuration.
   */
  async parseConfigToRawTargeting(data: {
    targetingSetting: {};
    community: number;
  }): Promise<{}> {
    const parsedTargeting = {
      ...pick(data.targetingSetting, [
        'individuals',
        'groups',
        'followers',
        'voters',
        'challengeParticipants',
        'actionItemRelated',
      ]),
      community: data.community,
    };

    // Handle roles targeting.
    const rolesMap = {
      allCommunityUsers: ROLE_ABBREVIATIONS.USER,
      admins: ROLE_ABBREVIATIONS.ADMIN,
      moderators: ROLE_ABBREVIATIONS.MODERATOR,
      challengeAdmins: ROLE_ABBREVIATIONS.CHALLENGE_ADMIN,
      challengeModerators: ROLE_ABBREVIATIONS.CHALLENGE_MODERATOR,
      challengeParticipants: ROLE_ABBREVIATIONS.CHALLENGE_USER,
      opportunityOwners: ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER,
      opportunityTeam: ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR,
      opportunitySubmitters: ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER,
    };
    const communityRoles = await this.roleService.getRoles({
      where: { community: data.community },
    });
    const rolesGrouped = keyBy(communityRoles, 'abbreviation');

    const targetedRoles = [];
    for (const settingKey of Object.keys(data.targetingSetting)) {
      if (
        data.targetingSetting[settingKey] &&
        get(rolesMap, settingKey) &&
        get(rolesGrouped, rolesMap[settingKey])
      ) {
        targetedRoles.push(get(rolesGrouped, `${rolesMap[settingKey]}.id`));
      }
    }
    parsedTargeting['roles'] = targetedRoles;

    return parsedTargeting;
  }

  /**
   * Parse raw announcement targeting setting to configuration.
   */
  async parseRawTargetingToConfig(
    targeting: AnnouncementTargetingEntity,
  ): Promise<{}> {
    const parsedData = pick(targeting, [
      'individuals',
      'groups',
      'followers',
      'voters',
      'challengeParticipants',
      'actionItemRelated',
    ]);

    // Handle roles targeting.
    const rolesMap = {
      [ROLE_ABBREVIATIONS.USER]: 'allCommunityUsers',
      [ROLE_ABBREVIATIONS.ADMIN]: 'admins',
      [ROLE_ABBREVIATIONS.MODERATOR]: 'moderators',
      [ROLE_ABBREVIATIONS.CHALLENGE_ADMIN]: 'challengeAdmins',
      [ROLE_ABBREVIATIONS.CHALLENGE_MODERATOR]: 'challengeModerators',
      [ROLE_ABBREVIATIONS.CHALLENGE_USER]: 'challengeParticipants',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER]: 'opportunityOwners',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR]: 'opportunityTeam',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER]: 'opportunitySubmitters',
    };
    const communityRoles = await this.roleService.getRoles({
      where: { community: targeting.community },
    });
    const rolesGrouped = keyBy(communityRoles, 'id');

    // Mapping roles to boolean values.
    targeting.roles.forEach(role => {
      if (
        get(rolesGrouped, role) &&
        get(rolesMap, rolesGrouped[role].abbreviation)
      ) {
        parsedData[rolesMap[rolesGrouped[role].abbreviation]] = true;
      }
    });

    // Mapping remaining roles' mapped boolean values.
    forEach(rolesMap, mappedVal => {
      if (!parsedData[mappedVal]) parsedData[mappedVal] = false;
    });

    return parsedData;
  }

  /**
   * Parse multiple raw announcement targeting settings to configurations.
   */
  async parseRawTargetingToConfigBulk(
    targetings: AnnouncementTargetingEntity[],
    community: number,
  ): Promise<{ targetingId: number; parsedConfig: {} }[]> {
    const communityRoles = await this.roleService.getRoles({
      where: { community },
    });
    const rolesGrouped = keyBy(communityRoles, 'id');

    // Predefined role map.
    const rolesMap = {
      [ROLE_ABBREVIATIONS.USER]: 'allCommunityUsers',
      [ROLE_ABBREVIATIONS.ADMIN]: 'admins',
      [ROLE_ABBREVIATIONS.MODERATOR]: 'moderators',
      [ROLE_ABBREVIATIONS.CHALLENGE_ADMIN]: 'challengeAdmins',
      [ROLE_ABBREVIATIONS.CHALLENGE_MODERATOR]: 'challengeModerators',
      [ROLE_ABBREVIATIONS.CHALLENGE_USER]: 'challengeParticipants',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER]: 'opportunityOwners',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR]: 'opportunityTeam',
      [ROLE_ABBREVIATIONS.OPPORTUNITY_SUBMITTER]: 'opportunitySubmitters',
    };

    return targetings.map(targeting => {
      const parsedData = pick(targeting, [
        'individuals',
        'groups',
        'followers',
        'voters',
        'challengeParticipants',
        'actionItemRelated',
      ]);

      // Handle roles targeting.
      targeting.roles.forEach(role => {
        if (
          get(rolesGrouped, role) &&
          get(rolesMap, rolesGrouped[role].abbreviation)
        ) {
          parsedData[rolesMap[rolesGrouped[role].abbreviation]] = true;
        }
      });

      // Mapping remaining roles' mapped boolean values.
      forEach(rolesMap, mappedVal => {
        if (!parsedData[mappedVal]) parsedData[mappedVal] = false;
      });

      return { targetingId: targeting.id, parsedConfig: parsedData };
    });
  }

  /**
   * Archive AnnouncementTargeting
   */
  async archiveAnnouncementTargeting(options: {}): Promise<{}> {
    return this.updateRawAnnouncementTargeting(options, { isDeleted: true });
  }

  /**
   * Permanently Delete AnnouncementTargeting
   */
  async deleteAnnouncementTargeting(options: {}): Promise<{}> {
    return this.announcementTargetingRepository.delete(options);
  }

  async getPotentialTargetsCount(
    params: GetPotentialTargetsCountDto & { communityId: number },
  ): Promise<number> {
    const parsedTargeting = {
      ...(await this.parseConfigToRawTargeting({
        targetingSetting: params.targeting,
        community: params.communityId,
      })),
      entityObjectId: params.entityObjectId,
      entityType: params.entityType,
      communityId: params.communityId,
    };
    let selectedUserIds = [];

    const [allCommUsers, entityTypes, commRoleActors] = await Promise.all([
      this.userService.getUsersWithFilters({
        communityId: params.communityId,
        isDeleted: false,
      }),
      EntityMetaService.getEntityTypesMetaByAbbreviations([
        ENTITY_TYPES.CHALLENGE,
        ENTITY_TYPES.IDEA,
      ]),
      this.roleActorService.getRoleActors({
        where: { community: params.communityId },
        relations: ['role', 'entityType'],
      }),
    ]);

    const entityTypesGrouped = keyBy(entityTypes, 'abbreviation');
    const challengeEntityType = entityTypesGrouped[ENTITY_TYPES.CHALLENGE];
    const oppoEntityType = entityTypesGrouped[ENTITY_TYPES.IDEA];

    const allUserGroups = await this.userCircleService.getUserCircles({
      where: { user: In(allCommUsers.map(user => user.id)) },
    });
    const userIdsByGroups = {};
    allUserGroups.forEach(ug => {
      userIdsByGroups[ug.circleId] = (
        userIdsByGroups[ug.circleId] || []
      ).concat([ug.userId]);
    });

    const userRolesByEntites = {};
    const userIdsByRoles = {};

    commRoleActors.forEach(roleActor => {
      const enType = get(roleActor, 'entityType.id', null);
      const enObjId = get(roleActor, 'entityObjectId', null);

      let roleUserIds = [];
      if (roleActor.actorType === RoleActorTypes.GROUP) {
        roleUserIds = get(userIdsByGroups, roleActor.actorId, []);
      } else {
        roleUserIds = [roleActor.actorId];
      }

      if (get(userRolesByEntites, roleActor.role.id)) {
        if (get(userRolesByEntites, `${roleActor.role.id}.${enType}`)) {
          userRolesByEntites[roleActor.role.id][enType][enObjId] = (
            userRolesByEntites[roleActor.role.id][enType][enObjId] || []
          ).concat(roleUserIds);
        } else {
          userRolesByEntites[roleActor.role.id][enType] = {};
          userRolesByEntites[roleActor.role.id][enType][enObjId] = roleUserIds;
        }
      } else {
        userRolesByEntites[roleActor.role.id] = {};
        userRolesByEntites[roleActor.role.id][enType] = {};
        userRolesByEntites[roleActor.role.id][enType][enObjId] = roleUserIds;
      }

      userIdsByRoles[roleActor.role.id] = (
        userIdsByRoles[roleActor.role.id] || []
      ).concat(roleUserIds);
    });

    let chlngPrtcpnts = [];
    let chlngOppos = [];
    if (
      parsedTargeting.entityType &&
      parsedTargeting.entityObjectId &&
      parsedTargeting.entityType === challengeEntityType.id
    ) {
      [chlngPrtcpnts, chlngOppos] = await Promise.all([
        this.challengeService.getRawChallengeParticipants({
          where: {
            challenge: parsedTargeting.entityObjectId,
            community: params.communityId,
          },
        }),
        this.opportunityService.getSimpleOpportunities({
          where: {
            challenge: parsedTargeting.entityObjectId,
            community: params.communityId,
          },
        }),
      ]);
    }

    // Parsing action items stage ids.
    let checkAllStages = false;
    let stageIdsToCheck = [];
    if (parsedTargeting['actionItemRelated'] && !checkAllStages) {
      checkAllStages =
        parsedTargeting['actionItemRelated']['allOpenItemsStages'] ||
        parsedTargeting['actionItemRelated']['allPastDueStages'] ||
        false;
      if (!checkAllStages) {
        stageIdsToCheck = concat(
          stageIdsToCheck,
          get(parsedTargeting['actionItemRelated'], 'openItemsStages', []),
          get(parsedTargeting['actionItemRelated'], 'openPastDueStages', []),
        );
      }
    }
    if (checkAllStages) {
      const allCommStages = await this.stageService.getStages({
        where: { community: params.communityId },
      });
      stageIdsToCheck = allCommStages.map(stage => stage.id);
    } else {
      stageIdsToCheck = uniq(stageIdsToCheck);
    }

    // Getting opportunites currently in the given stages.
    const oppoIdsByStages = {};
    let stageOpposGrouped = {};

    let openItems = [];
    let pastDueItems = [];
    const openItemsUsersByStages = {};
    const openItemsUsersByChlngStages = {};
    const pastDueItemsUsersByStages = {};
    const pastDueItemsUsersByChlngStages = {};
    if (stageIdsToCheck.length) {
      const stageOppos = await this.opportunityService.getSimpleOpportunities({
        where: { stage: In(stageIdsToCheck), community: params.communityId },
      });
      stageOpposGrouped = keyBy(stageOppos, 'id');
      stageOppos.forEach(oppo => {
        if (oppoIdsByStages[oppo.stageId]) {
          oppoIdsByStages[oppo.stageId].push(oppo.id);
        } else {
          oppoIdsByStages[oppo.stageId] = [oppo.id];
        }
      });

      // Fetching open action items and attaching their respective stage
      // (& challenge) ids with them by using opportunity ids.
      if (stageOppos.length) {
        const itemLogsResp = await this.actionItemLogService.searchActionItemLogs(
          {
            options: {
              entities: stageOppos.map(oppo => ({
                entityObjectId: oppo.id,
                entityType: oppoEntityType.id,
              })),
              community: params.communityId,
              status: ActionItemLogStatusEnum.OPEN,
              isNotification: true,
            },
          },
        );
        const actionItemLogs = get(itemLogsResp, 'actionItemLogs', []);

        // Attaching stage & challenge ids with action items.
        for (const item of actionItemLogs) {
          item['stageId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.stageId`,
          );
          item['challengeId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.challengeId`,
          );
        }

        // Filtering open & past due action items.
        openItems = actionItemLogs.filter(
          item =>
            !item['actionDueDate'] ||
            moment(item['actionDueDate']).isSameOrAfter(moment()),
        );
        pastDueItems = actionItemLogs.filter(
          item =>
            item['actionDueDate'] &&
            moment(item['actionDueDate']).isBefore(moment()),
        );

        // Grouping action items by stages.
        openItems.forEach(item => {
          openItemsUsersByStages[item.stageId] = (
            openItemsUsersByStages[item.stageId] || []
          ).concat([item.userId]);

          if (item['challengeId']) {
            if (get(openItemsUsersByChlngStages, item['challengeId'])) {
              openItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = (
                openItemsUsersByChlngStages[item['challengeId']][
                  item['stageId']
                ] || []
              ).concat([item.userId]);
            } else {
              openItemsUsersByChlngStages[item['challengeId']] = {};
              openItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = [item.userId];
            }
          }
        });

        pastDueItems.forEach(item => {
          pastDueItemsUsersByStages[item.stageId] = (
            pastDueItemsUsersByStages[item.stageId] || []
          ).concat([item.userId]);

          if (item['challengeId']) {
            if (get(pastDueItemsUsersByChlngStages, item['challengeId'])) {
              pastDueItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = (
                pastDueItemsUsersByChlngStages[item['challengeId']][
                  item['stageId']
                ] || []
              ).concat([item.userId]);
            } else {
              pastDueItemsUsersByChlngStages[item['challengeId']] = {};
              pastDueItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = [item.userId];
            }
          }
        });
      }
    }

    if (
      parsedTargeting['public'] ||
      (parsedTargeting.entityType &&
        parsedTargeting.entityObjectId &&
        parsedTargeting.entityType === challengeEntityType.id &&
        parsedTargeting['challengeParticipants'] &&
        !get(chlngPrtcpnts, 'length'))
    ) {
      selectedUserIds = allCommUsers.map(user => user.id);
    } else {
      selectedUserIds = get(parsedTargeting, 'individuals', []);

      get(parsedTargeting, 'groups', []).forEach(groupId => {
        selectedUserIds = selectedUserIds.concat(
          get(userIdsByGroups, groupId, []),
        );
      });

      // Check announcement roles
      if (!parsedTargeting.entityType) {
        get(parsedTargeting, 'roles', []).forEach(roleId => {
          selectedUserIds = selectedUserIds.concat(
            get(userIdsByRoles, roleId, []),
          );
        });
      } else {
        get(parsedTargeting, 'roles', []).forEach(roleId => {
          selectedUserIds = selectedUserIds.concat(
            get(
              userRolesByEntites,
              `${roleId}.${parsedTargeting.entityType}.${parsedTargeting.entityObjectId}`,
              [],
            ),
          );
        });

        if (parsedTargeting.entityType === challengeEntityType.id) {
          for (const oppo of chlngOppos) {
            get(parsedTargeting, 'roles', []).forEach(roleId => {
              selectedUserIds = selectedUserIds.concat(
                get(
                  userRolesByEntites,
                  `${roleId}.${oppoEntityType.id}.${oppo.id}`,
                  [],
                ),
              );
            });
          }

          // Check action items for challenge level announcements.
          if (!isEmpty(parsedTargeting['actionItemRelated'])) {
            const aiTarget = parsedTargeting['actionItemRelated'];

            if (aiTarget['allOpenItemsStages']) {
              forEach(openItemsUsersByChlngStages, itemsByStages => {
                forEach(itemsByStages, userIds => {
                  selectedUserIds = selectedUserIds.concat(userIds);
                });
              });
            } else if (get(aiTarget, 'openItemsStages.length')) {
              aiTarget['openItemsStages'].forEach(stageId => {
                selectedUserIds = selectedUserIds.concat(
                  get(
                    openItemsUsersByChlngStages,
                    `${parsedTargeting.entityObjectId}.${stageId}`,
                    [],
                  ),
                );
              });
            }

            if (aiTarget['allPastDueStages']) {
              forEach(pastDueItemsUsersByChlngStages, itemsByStages => {
                forEach(itemsByStages, userIds => {
                  selectedUserIds = selectedUserIds.concat(userIds);
                });
              });
            } else if (get(aiTarget, 'openPastDueStages.length')) {
              aiTarget['openPastDueStages'].forEach(stageId => {
                selectedUserIds = selectedUserIds.concat(
                  get(
                    pastDueItemsUsersByChlngStages,
                    `${parsedTargeting.entityObjectId}.${stageId}`,
                    [],
                  ),
                );
              });
            }
          }
        }
      }

      // Check action items for community level announcements.
      if (
        !parsedTargeting.entityType &&
        !isEmpty(parsedTargeting['actionItemRelated'])
      ) {
        const aiTarget = parsedTargeting['actionItemRelated'];

        if (aiTarget['allOpenItemsStages']) {
          forEach(openItemsUsersByStages, userIds => {
            selectedUserIds = selectedUserIds.concat(userIds);
          });
        } else if (get(aiTarget, 'openItemsStages.length')) {
          aiTarget['openItemsStages'].forEach(stageId => {
            selectedUserIds = selectedUserIds.concat(
              get(openItemsUsersByStages, stageId, []),
            );
          });
        }

        if (aiTarget['allPastDueStages']) {
          forEach(pastDueItemsUsersByStages, userIds => {
            selectedUserIds = selectedUserIds.concat(userIds);
          });
        } else if (get(aiTarget, 'openPastDueStages.length')) {
          aiTarget['openPastDueStages'].forEach(stageId => {
            selectedUserIds = selectedUserIds.concat(
              get(pastDueItemsUsersByStages, stageId, []),
            );
          });
        }
      }

      // TODO: For opportunities level announcements, check followers & voters.

      selectedUserIds = uniq(selectedUserIds);
    }

    const selectedUsers = allCommUsers.filter(user =>
      selectedUserIds.includes(user.id),
    );

    return selectedUsers.length;
  }

  /**
   * Calculates visibility permissions for a user against the given announcements
   * based on their targeting setting.
   *
   * @param announcements Announcements for which visibility permissions need to be calculated.
   * @param userId User id for which permissions are required.
   * @param communityId Community id of user.
   */
  async getViewPermOnTargeting(
    announcements: AnnouncementEntity[],
    userId: number,
    communityId: number,
  ): Promise<{ announcement: number; viewAnnouncement: number }[]> {
    if (!get(announcements, 'length')) return [];

    const [announceTargeting, entityTypes, userGroups] = await Promise.all([
      this.getAnnouncementTargetings({
        where: {
          community: communityId,
          announcement: In(announcements.map(ann => ann.id)),
        },
        relations: ['announcement'],
      }),
      EntityMetaService.getEntityTypesMetaByAbbreviations([
        ENTITY_TYPES.CHALLENGE,
        ENTITY_TYPES.IDEA,
      ]),
      this.userCircleService.getUserCircles({
        where: { user: userId },
      }),
    ]);
    const targetingGrouped = keyBy(announceTargeting, 'announcement.id');
    const entityTypesGrouped = keyBy(entityTypes, 'abbreviation');
    const challengeEntityType = entityTypesGrouped[ENTITY_TYPES.CHALLENGE];
    const oppoEntityType = entityTypesGrouped[ENTITY_TYPES.IDEA];

    // Get user's group ids.
    const userGroupIds = userGroups.map(ug => ug.circleId);

    // Get user's roles.
    const userRoleActors = await this.roleActorService.getRoleActors({
      where: [
        {
          actorId: userId,
          actorType: RoleActorTypes.USER,
          community: communityId,
        },
        ...(userGroupIds.length
          ? [
              {
                actorId: In(userGroupIds),
                actorType: RoleActorTypes.GROUP,
                community: communityId,
              },
            ]
          : []),
      ],
      relations: ['role', 'entityType'],
    });
    const userRoleIds = userRoleActors.map(roleActor => roleActor.role.id);

    // Group roles into an obj of pattern:
    // {entityTypeId: { entityObjectId: roleId[] } }
    const userRolesByEntites = {};
    userRoleActors.forEach(roleActor => {
      const enType = get(roleActor, 'entityType.id', null);
      const enObjId = get(roleActor, 'entityObjectId', null);
      if (get(userRolesByEntites, enType)) {
        if (get(userRolesByEntites, `${enType}.${enObjId}`)) {
          userRolesByEntites[enType][enObjId].push(roleActor.role.id);
        } else {
          userRolesByEntites[enType][enObjId] = [roleActor.role.id];
        }
      } else {
        userRolesByEntites[enType] = {};
        userRolesByEntites[enType][enObjId] = [roleActor.role.id];
      }
    });

    const challengeIds = [];
    const opportunityIds = [];
    let chlngPrtcpntGrouped: Dictionary<ChallengeParticipantEntity[]> = {};
    const chlngOppoIdsGrouped = {};

    announcements.forEach(announcement => {
      if (get(announcement, 'entityType.id') === challengeEntityType.id) {
        challengeIds.push(announcement.entityObjectId);
      } else if (get(announcement, 'entityType.id') === oppoEntityType.id) {
        opportunityIds.push(announcement.entityObjectId);
      }
    });

    if (challengeIds.length) {
      const [challengeParts, chlngOppos] = await Promise.all([
        this.challengeService.getRawChallengeParticipants({
          where: { challenge: In(challengeIds), community: communityId },
          relations: ['challenge'],
        }),
        this.opportunityService.getSimpleOpportunities({
          where: { challenge: In(challengeIds), community: communityId },
        }),
      ]);
      chlngPrtcpntGrouped = groupBy(challengeParts, 'challenge.id');

      // Grouping opportunity ids on challenge ids.
      chlngOppos.forEach(oppo => {
        if (chlngOppoIdsGrouped[oppo.challengeId]) {
          chlngOppoIdsGrouped[oppo.challengeId].push(oppo.id);
        } else {
          chlngOppoIdsGrouped[oppo.challengeId] = [oppo.id];
        }
      });
    }

    // Parsing action items stage ids.
    let checkAllStages = false;
    let stageIdsToCheck = [];
    announceTargeting.forEach(targeting => {
      if (targeting.actionItemRelated && !checkAllStages) {
        checkAllStages =
          targeting.actionItemRelated['allOpenItemsStages'] ||
          targeting.actionItemRelated['allPastDueStages'] ||
          false;
        if (!checkAllStages) {
          stageIdsToCheck = concat(
            stageIdsToCheck,
            get(targeting.actionItemRelated, 'openItemsStages', []),
            get(targeting.actionItemRelated, 'openPastDueStages', []),
          );
        }
      }
    });
    if (checkAllStages) {
      const allCommStages = await this.stageService.getStages({
        where: { community: communityId },
      });
      stageIdsToCheck = allCommStages.map(stage => stage.id);
    } else {
      stageIdsToCheck = uniq(stageIdsToCheck);
    }

    // Getting opportunites currently in the given stages.
    const oppoIdsByStages = {};
    let stageOpposGrouped = {};

    let openItems = [];
    let pastDueItems = [];
    let openItemsByStages = {};
    let openItemsByChlngStages = {};
    let pastDueItemsByStages = {};
    let pastDueItemsByChlngStages = {};
    if (stageIdsToCheck.length) {
      const stageOppos = await this.opportunityService.getSimpleOpportunities({
        where: { stage: In(stageIdsToCheck), community: communityId },
      });
      stageOpposGrouped = keyBy(stageOppos, 'id');
      stageOppos.forEach(oppo => {
        if (oppoIdsByStages[oppo.stageId]) {
          oppoIdsByStages[oppo.stageId].push(oppo.id);
        } else {
          oppoIdsByStages[oppo.stageId] = [oppo.id];
        }
      });

      // Fetching open action items and attaching their respective stage
      // (& challenge) ids with them by using opportunity ids.
      if (stageOppos.length) {
        const itemLogsResp = await this.actionItemLogService.searchActionItemLogs(
          {
            options: {
              entities: stageOppos.map(oppo => ({
                entityObjectId: oppo.id,
                entityType: oppoEntityType.id,
              })),
              community: communityId,
              userId: userId,
              status: ActionItemLogStatusEnum.OPEN,
              isNotification: true,
            },
          },
        );
        const actionItemLogs = get(itemLogsResp, 'actionItemLogs', []);

        // Attaching stage & challenge ids with action items.
        for (const item of actionItemLogs) {
          item['stageId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.stageId`,
          );
          item['challengeId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.challengeId`,
          );
        }

        // Filtering open & past due action items.
        openItems = actionItemLogs.filter(
          item =>
            !item['actionDueDate'] ||
            moment(item['actionDueDate']).isSameOrAfter(moment()),
        );
        pastDueItems = actionItemLogs.filter(
          item =>
            item['actionDueDate'] &&
            moment(item['actionDueDate']).isBefore(moment()),
        );

        // Grouping action items by stages.
        openItemsByStages = groupBy(openItems, 'stageId');
        pastDueItemsByStages = groupBy(pastDueItems, 'stageId');

        // Grouping action items by challenge & stages.
        openItemsByChlngStages = this.groupActionItemByChallengeStages(
          openItems,
        );
        pastDueItemsByChlngStages = this.groupActionItemByChallengeStages(
          pastDueItems,
        );
      }
    }

    return announcements.map(ann => {
      let viewPerm = PERMISSIONS_MAP.DENY;
      const targeting = targetingGrouped[ann.id];

      if (targeting) {
        if (targeting.public) {
          viewPerm = PERMISSIONS_MAP.ALLOW;
        } else {
          if (
            get(targeting, 'individuals', []).includes(userId) ||
            difference(get(targeting, 'groups', []), userGroupIds).length <
              get(targeting, 'groups.length', 0) ||
            (targeting.challengeParticipants &&
              ann.entityType &&
              ann.entityType.id === challengeEntityType.id &&
              !get(chlngPrtcpntGrouped, `${ann.entityObjectId}.length`))
          ) {
            viewPerm = PERMISSIONS_MAP.ALLOW;
          }

          // Check announcement roles
          const annEnType = get(ann, 'entityType.id', null);
          if (
            (!annEnType &&
              difference(get(targeting, 'roles', []), userRoleIds).length <
                get(targeting, 'roles.length', 0)) ||
            (annEnType &&
              difference(
                get(targeting, 'roles', []),
                get(
                  userRolesByEntites,
                  `${annEnType}.${ann.entityObjectId}`,
                  [],
                ),
              ).length < get(targeting, 'roles.length', 0))
          ) {
            viewPerm = PERMISSIONS_MAP.ALLOW;
          }

          if (
            annEnType &&
            ann.entityType.id === challengeEntityType.id &&
            get(chlngOppoIdsGrouped, `${ann.entityObjectId}.length`)
          ) {
            for (const oppoId of chlngOppoIdsGrouped[ann.entityObjectId]) {
              if (
                difference(
                  get(targeting, 'roles', []),
                  get(userRolesByEntites, `${oppoEntityType.id}.${oppoId}`, []),
                ).length < get(targeting, 'roles.length', 0)
              ) {
                viewPerm = PERMISSIONS_MAP.ALLOW;
                break;
              }
            }

            // Check action items for challenge level announcements.
            if (!isEmpty(targeting.actionItemRelated)) {
              viewPerm = max([
                viewPerm,
                this.getViewPermOnActionItem(
                  targeting.actionItemRelated,
                  get(openItemsByChlngStages, `${ann.entityObjectId}`)
                    ? true
                    : false,
                  get(pastDueItemsByChlngStages, `${ann.entityObjectId}`)
                    ? true
                    : false,
                  get(openItemsByChlngStages, ann.entityObjectId),
                  get(pastDueItemsByChlngStages, ann.entityObjectId),
                ),
              ]);
            }
          }

          // Check action items for community level announcements.
          if (!annEnType && !isEmpty(targeting.actionItemRelated)) {
            viewPerm = max([
              viewPerm,
              this.getViewPermOnActionItem(
                targeting.actionItemRelated,
                openItems.length > 0,
                pastDueItems.length > 0,
                openItemsByStages,
                pastDueItemsByStages,
              ),
            ]);
          }

          // TODO: For opportunities level announcements, check followers & voters.
        }
      }

      return { announcement: ann.id, viewAnnouncement: viewPerm };
    });
  }

  /**
   * Helper method to group action items into an object of following format:
   * { challengeId: { stageId: ActionItem[] } }
   *
   * @param actionItems Action Items having stage and challenge ids.
   */
  private groupActionItemByChallengeStages(actionItems: {}[]): {} {
    const actionItemsByChlngStages = {};
    actionItems.forEach(item => {
      if (item['challengeId']) {
        if (get(actionItemsByChlngStages, item['challengeId'])) {
          actionItemsByChlngStages[item['challengeId']][item['stageId']] = (
            actionItemsByChlngStages[item['challengeId']][item['stageId']] || []
          ).concat([item]);
        } else {
          actionItemsByChlngStages[item['challengeId']] = {};
          actionItemsByChlngStages[item['challengeId']][item['stageId']] = [
            item,
          ];
        }
      }
    });
    return actionItemsByChlngStages;
  }

  /**
   * Helper method to get view permission based on action item targeting setting
   * and given action items.
   * Note: This works for a single user only.
   *
   * @param actionItemTargeting Action item related targeting setting.
   * @param hasEntityOpenItems Boolean to check whether the announcement entity has any open items.
   * @param hasEntityPastDueItems Boolean to check whether the announcement entity has any past due items or not.
   * @param openItemsByStages Open action items grouped by stage ids.
   * @param pastDueItemsByStages Past due action items grouped by stage ids.
   */
  private getViewPermOnActionItem(
    actionItemTargeting: {},
    hasEntityOpenItems: boolean,
    hasEntityPastDueItems: boolean,
    openItemsByStages: {},
    pastDueItemsByStages: {},
  ): number {
    let viewPerm = PERMISSIONS_MAP.DENY;
    if (
      (actionItemTargeting['allOpenItemsStages'] && hasEntityOpenItems) ||
      (actionItemTargeting['allPastDueStages'] && hasEntityPastDueItems)
    ) {
      viewPerm = PERMISSIONS_MAP.ALLOW;
    } else {
      if (get(actionItemTargeting, 'openItemsStages.length')) {
        for (const stageId of actionItemTargeting['openItemsStages']) {
          if (get(openItemsByStages, `${stageId}.length`)) {
            viewPerm = PERMISSIONS_MAP.ALLOW;
          }
        }
      }
      if (get(actionItemTargeting, 'openPastDueStages.length')) {
        for (const stageId of actionItemTargeting['openPastDueStages']) {
          if (get(pastDueItemsByStages, `${stageId}.length`)) {
            viewPerm = PERMISSIONS_MAP.ALLOW;
          }
        }
      }
    }
    return viewPerm;
  }

  /**
   * Get targeted users for the given annoucements.
   *
   * @param announcements Announcements to calculate targeted users on. (These
   * must be from the same community as the given communityId and must have
   * entityType & targetSetting joins).
   * @param communityId Community id for the given announcements.
   */
  async getAnnouncementsTargetedUsers(
    announcements: AnnouncementEntity[],
    communityId: number,
  ): Promise<{ announcementId: number; targetedUsers: UserEntity[] }[]> {
    if (!announcements.length) return [];

    let selectedUserIds = [];

    const [allCommUsers, entityTypes, commRoleActors] = await Promise.all([
      this.userService.getUsersWithFilters({
        communityId: communityId,
        isDeleted: false,
      }),
      EntityMetaService.getEntityTypesMetaByAbbreviations([
        ENTITY_TYPES.CHALLENGE,
        ENTITY_TYPES.IDEA,
      ]),
      this.roleActorService.getRoleActors({
        where: { community: communityId },
        relations: ['role', 'entityType'],
      }),
    ]);

    const entityTypesGrouped = keyBy(entityTypes, 'abbreviation');
    const challengeEntityType = entityTypesGrouped[ENTITY_TYPES.CHALLENGE];
    const oppoEntityType = entityTypesGrouped[ENTITY_TYPES.IDEA];

    const allUserGroups = await this.userCircleService.getUserCircles({
      where: { user: In(allCommUsers.map(user => user.id)) },
    });
    const userIdsByGroups = {};
    allUserGroups.forEach(ug => {
      userIdsByGroups[ug.circleId] = (
        userIdsByGroups[ug.circleId] || []
      ).concat([ug.userId]);
    });

    const userRolesByEntites = {};
    const userIdsByRoles = {};

    commRoleActors.forEach(roleActor => {
      const enType = get(roleActor, 'entityType.id', null);
      const enObjId = get(roleActor, 'entityObjectId', null);

      let roleUserIds = [];
      if (roleActor.actorType === RoleActorTypes.GROUP) {
        roleUserIds = get(userIdsByGroups, roleActor.actorId, []);
      } else {
        roleUserIds = [roleActor.actorId];
      }

      if (get(userRolesByEntites, roleActor.role.id)) {
        if (get(userRolesByEntites, `${roleActor.role.id}.${enType}`)) {
          userRolesByEntites[roleActor.role.id][enType][enObjId] = (
            userRolesByEntites[roleActor.role.id][enType][enObjId] || []
          ).concat(roleUserIds);
        } else {
          userRolesByEntites[roleActor.role.id][enType] = {};
          userRolesByEntites[roleActor.role.id][enType][enObjId] = roleUserIds;
        }
      } else {
        userRolesByEntites[roleActor.role.id] = {};
        userRolesByEntites[roleActor.role.id][enType] = {};
        userRolesByEntites[roleActor.role.id][enType][enObjId] = roleUserIds;
      }

      userIdsByRoles[roleActor.role.id] = (
        userIdsByRoles[roleActor.role.id] || []
      ).concat(roleUserIds);
    });

    const challengeIds = [];
    const opportunityIds = [];
    let chlngPrtcpntGrouped = {};
    const chlngOppoIdsGrouped = {};
    announcements.forEach(announcement => {
      if (get(announcement, 'entityType.id') === challengeEntityType.id) {
        challengeIds.push(announcement.entityObjectId);
      } else if (get(announcement, 'entityType.id') === oppoEntityType.id) {
        opportunityIds.push(announcement.entityObjectId);
      }
    });

    if (challengeIds.length) {
      const [challengeParts, chlngOppos] = await Promise.all([
        this.challengeService.getRawChallengeParticipants({
          where: { challenge: In(challengeIds), community: communityId },
          relations: ['challenge'],
        }),
        this.opportunityService.getSimpleOpportunities({
          where: { challenge: In(challengeIds), community: communityId },
        }),
      ]);
      chlngPrtcpntGrouped = groupBy(challengeParts, 'challenge.id');

      // Grouping opportunity ids on challenge ids.
      chlngOppos.forEach(oppo => {
        if (chlngOppoIdsGrouped[oppo.challengeId]) {
          chlngOppoIdsGrouped[oppo.challengeId].push(oppo.id);
        } else {
          chlngOppoIdsGrouped[oppo.challengeId] = [oppo.id];
        }
      });
    }

    // Parsing action items stage ids.
    let checkAllStages = false;
    let stageIdsToCheck = [];
    announcements.forEach(ann => {
      if (ann.targetSetting.actionItemRelated && !checkAllStages) {
        checkAllStages =
          ann.targetSetting.actionItemRelated['allOpenItemsStages'] ||
          ann.targetSetting.actionItemRelated['allPastDueStages'] ||
          false;
        if (!checkAllStages) {
          stageIdsToCheck = concat(
            stageIdsToCheck,
            get(ann.targetSetting.actionItemRelated, 'openItemsStages', []),
            get(ann.targetSetting.actionItemRelated, 'openPastDueStages', []),
          );
        }
      }
    });
    if (checkAllStages) {
      const allCommStages = await this.stageService.getStages({
        where: { community: communityId },
      });
      stageIdsToCheck = allCommStages.map(stage => stage.id);
    } else {
      stageIdsToCheck = uniq(stageIdsToCheck);
    }

    // Getting opportunites currently in the given stages.
    const oppoIdsByStages = {};
    let stageOpposGrouped = {};

    let openItems = [];
    let pastDueItems = [];
    const openItemsUsersByStages = {};
    const openItemsUsersByChlngStages = {};
    const pastDueItemsUsersByStages = {};
    const pastDueItemsUsersByChlngStages = {};
    if (stageIdsToCheck.length) {
      const stageOppos = await this.opportunityService.getSimpleOpportunities({
        where: { stage: In(stageIdsToCheck), community: communityId },
      });
      stageOpposGrouped = keyBy(stageOppos, 'id');
      stageOppos.forEach(oppo => {
        if (oppoIdsByStages[oppo.stageId]) {
          oppoIdsByStages[oppo.stageId].push(oppo.id);
        } else {
          oppoIdsByStages[oppo.stageId] = [oppo.id];
        }
      });

      // Fetching open action items and attaching their respective stage
      // (& challenge) ids with them by using opportunity ids.
      if (stageOppos.length) {
        const itemLogsResp = await this.actionItemLogService.searchActionItemLogs(
          {
            options: {
              entities: stageOppos.map(oppo => ({
                entityObjectId: oppo.id,
                entityType: oppoEntityType.id,
              })),
              community: communityId,
              status: ActionItemLogStatusEnum.OPEN,
              isNotification: true,
            },
          },
        );
        const actionItemLogs = get(itemLogsResp, 'actionItemLogs', []);

        // Attaching stage & challenge ids with action items.
        for (const item of actionItemLogs) {
          item['stageId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.stageId`,
          );
          item['challengeId'] = get(
            stageOpposGrouped,
            `${item['entityObjectId']}.challengeId`,
          );
        }

        // Filtering open & past due action items.
        openItems = actionItemLogs.filter(
          item =>
            !item['actionDueDate'] ||
            moment(item['actionDueDate']).isSameOrAfter(moment()),
        );
        pastDueItems = actionItemLogs.filter(
          item =>
            item['actionDueDate'] &&
            moment(item['actionDueDate']).isBefore(moment()),
        );

        // Grouping action items by stages.
        openItems.forEach(item => {
          openItemsUsersByStages[item.stageId] = (
            openItemsUsersByStages[item.stageId] || []
          ).concat([item.userId]);

          if (item['challengeId']) {
            if (get(openItemsUsersByChlngStages, item['challengeId'])) {
              openItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = (
                openItemsUsersByChlngStages[item['challengeId']][
                  item['stageId']
                ] || []
              ).concat([item.userId]);
            } else {
              openItemsUsersByChlngStages[item['challengeId']] = {};
              openItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = [item.userId];
            }
          }
        });

        pastDueItems.forEach(item => {
          pastDueItemsUsersByStages[item.stageId] = (
            pastDueItemsUsersByStages[item.stageId] || []
          ).concat([item.userId]);

          if (item['challengeId']) {
            if (get(pastDueItemsUsersByChlngStages, item['challengeId'])) {
              pastDueItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = (
                pastDueItemsUsersByChlngStages[item['challengeId']][
                  item['stageId']
                ] || []
              ).concat([item.userId]);
            } else {
              pastDueItemsUsersByChlngStages[item['challengeId']] = {};
              pastDueItemsUsersByChlngStages[item['challengeId']][
                item['stageId']
              ] = [item.userId];
            }
          }
        });
      }
    }

    return announcements.map(ann => {
      const target = ann.targetSetting;
      if (
        target.public ||
        (ann.entityType &&
          ann.entityObjectId &&
          ann.entityType.id === challengeEntityType.id &&
          target.challengeParticipants &&
          !get(chlngPrtcpntGrouped, `${ann.entityObjectId}.length`))
      ) {
        selectedUserIds = allCommUsers.map(user => user.id);
      } else {
        selectedUserIds = get(target, 'individuals', []);

        get(target, 'groups', []).forEach(groupId => {
          selectedUserIds = selectedUserIds.concat(
            get(userIdsByGroups, groupId, []),
          );
        });

        // Check announcement roles
        if (!ann.entityType) {
          get(target, 'roles', []).forEach(roleId => {
            selectedUserIds = selectedUserIds.concat(
              get(userIdsByRoles, roleId, []),
            );
          });
        } else {
          get(target, 'roles', []).forEach(roleId => {
            selectedUserIds = selectedUserIds.concat(
              get(
                userRolesByEntites,
                `${roleId}.${ann.entityType.id}.${ann.entityObjectId}`,
                [],
              ),
            );
          });

          if (ann.entityType.id === challengeEntityType.id) {
            for (const oppoId of chlngOppoIdsGrouped[ann.entityObjectId]) {
              get(target, 'roles', []).forEach(roleId => {
                selectedUserIds = selectedUserIds.concat(
                  get(
                    userRolesByEntites,
                    `${roleId}.${oppoEntityType.id}.${oppoId}`,
                    [],
                  ),
                );
              });
            }

            // Check action items for challenge level announcements.
            if (!isEmpty(target.actionItemRelated)) {
              const aiTarget = target.actionItemRelated;

              if (aiTarget['allOpenItemsStages']) {
                forEach(openItemsUsersByChlngStages, itemsByStages => {
                  forEach(itemsByStages, userIds => {
                    selectedUserIds = selectedUserIds.concat(userIds);
                  });
                });
              } else if (get(aiTarget, 'openItemsStages.length')) {
                aiTarget['openItemsStages'].forEach(stageId => {
                  selectedUserIds = selectedUserIds.concat(
                    get(
                      openItemsUsersByChlngStages,
                      `${ann.entityObjectId}.${stageId}`,
                      [],
                    ),
                  );
                });
              }

              if (aiTarget['allPastDueStages']) {
                forEach(pastDueItemsUsersByChlngStages, itemsByStages => {
                  forEach(itemsByStages, userIds => {
                    selectedUserIds = selectedUserIds.concat(userIds);
                  });
                });
              } else if (get(aiTarget, 'openPastDueStages.length')) {
                aiTarget['openPastDueStages'].forEach(stageId => {
                  selectedUserIds = selectedUserIds.concat(
                    get(
                      pastDueItemsUsersByChlngStages,
                      `${ann.entityObjectId}.${stageId}`,
                      [],
                    ),
                  );
                });
              }
            }
          }
        }

        // Check action items for community level announcements.
        if (!ann.entityType && !isEmpty(target.actionItemRelated)) {
          const aiTarget = target.actionItemRelated;

          if (aiTarget['allOpenItemsStages']) {
            forEach(openItemsUsersByStages, userIds => {
              selectedUserIds = selectedUserIds.concat(userIds);
            });
          } else if (get(aiTarget, 'openItemsStages.length')) {
            aiTarget['openItemsStages'].forEach(stageId => {
              selectedUserIds = selectedUserIds.concat(
                get(openItemsUsersByStages, stageId, []),
              );
            });
          }

          if (aiTarget['allPastDueStages']) {
            forEach(pastDueItemsUsersByStages, userIds => {
              selectedUserIds = selectedUserIds.concat(userIds);
            });
          } else if (get(aiTarget, 'openPastDueStages.length')) {
            aiTarget['openPastDueStages'].forEach(stageId => {
              selectedUserIds = selectedUserIds.concat(
                get(pastDueItemsUsersByStages, stageId, []),
              );
            });
          }
        }

        // TODO: For opportunities level announcements, check followers & voters.

        selectedUserIds = uniq(selectedUserIds);
      }

      return {
        announcementId: ann.id,
        targetedUsers: allCommUsers.filter(user =>
          selectedUserIds.includes(user.id),
        ),
      };
    });
  }
}
