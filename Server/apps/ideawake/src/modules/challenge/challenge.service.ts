import * as _ from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ENTITY_TYPES,
  NON_PERMISSION_COLUMNS,
  PERMISSIONS_MAP,
} from '../../common/constants/constants';
import { EntityTypeEnum } from '../../enum/entity-type.enum';
import { ParticipantTypeEnum } from '../../enum/participant-type.enum';
import { RoleActorTypes } from '../../enum/role-actor-type.enum';
import { RolesEnum } from '../../enum/roles.enum';
import { UtilsService } from '../../providers/utils.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { CommunityWisePermissionEntity } from '../communityWisePermission/communityWisePermission.entity';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { EntityTypeService } from '../entityType/entity.service';
import { FollowingContentService } from '../followingContent/followingContent.service';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { OpportunityService } from '../opportunity/opportunity.service';
import { PrizeService } from '../prize/prize.service';
import { RoleService } from '../role/role.service';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { ChallengeEntity } from './challenge.entity';
import { ChallengeRepository } from './challenge.repository';
import { ChallengeParticipantRepository } from './challengeParticipant.repository';
import { Brackets, In } from 'typeorm';
import { EntityVisibilitySettingService } from '../entityVisibilitySetting/entityVisibilitySetting.service';
import { CommunityEntity } from '../community/community.entity';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { DefaultSort } from '../../enum/default-sort.enum';
import { StageService } from '../stage/stage.service';
import { ElasticSearchService } from '../../shared/services/elasticSearchHook';
import { EntityExperienceSettingEntity } from '../entityExperienceSetting/entityExperienceSetting.entity';
import { ChallengeStatuses } from '../../enum/cahllenge-status.enum';
import { ChallengeParticipantEntity } from './challengeParticipant.entity';
import { Logger } from '@nestjs/common/services/logger.service';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { VisibilityExpFieldIntegrationEnum } from '../../enum';
import { OpportunityFieldLinkageService } from '../customField/opportunityFieldLinkage.service';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';

@Injectable()
export class ChallengeService {
  constructor(
    public readonly challengeRepository: ChallengeRepository,
    public readonly challengeParticipantRepository: ChallengeParticipantRepository,
    public readonly opportunityService: OpportunityService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    public readonly entityTypeService: EntityTypeService,
    public readonly roleActorsService: RoleActorsService,
    public readonly roleService: RoleService,
    public readonly prizeService: PrizeService,
    public readonly followingContentService: FollowingContentService,
    public readonly entityVisibilitySettingService: EntityVisibilitySettingService,
    public readonly stageService: StageService,
    public readonly elasticSearchService: ElasticSearchService,
    public readonly customFieldIntegrationService: CustomFieldIntegrationService,
    public readonly opportunityFieldLinkageService: OpportunityFieldLinkageService,
  ) {}

  /**
   * Get challenges
   */
  async getOneChallenge(options: {}): Promise<ChallengeEntity> {
    return this.challengeRepository.findOne({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'challenge',
        ),
      }),
    });
  }

  async getChallengeCount(options: {}): Promise<number> {
    return this.challengeRepository.count({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'challenge',
        ),
      }),
    });
  }

  async getChallenges(options: {}): Promise<ChallengeEntity[]> {
    return this.challengeRepository.find({
      ...options,
      ...(options['where'] && {
        where: UtilsService.replaceJoinColumnsForQueries(
          options['where'],
          'challenge',
        ),
      }),
    });
  }

  /**
   * Get community challenges based on given filters.
   * @param options Options and filters to fetch challenges on.
   */
  async getCommunityChallenges(options: {
    filters: {
      status?: string;
      isDeleted?: boolean;
      draft?: boolean;
    };
    userId: number;
    communityId: number;
    take?: number;
    skip?: number;
  }): Promise<{ challenges: ChallengeEntity[]; totalCount: number }> {
    const query = this.challengeRepository
      .createQueryBuilder('challenge')
      .where('challenge.communityId = :communityId', {
        communityId: options.communityId,
      });

    // Optional Filters.
    if (options.filters.hasOwnProperty('isDeleted')) {
      query.andWhere('challenge.isDeleted = :isDeleted', {
        isDeleted: options.filters.isDeleted,
      });
    }
    if (options.filters.hasOwnProperty('draft')) {
      query.andWhere('challenge.draft = :draft', {
        draft: options.filters.draft,
      });
    }
    if (options.filters.status) {
      if (options.filters.status === ChallengeStatuses.OPEN) {
        // Open status filter will fetch both open & in evaluation challenges.
        query.andWhere(
          new Brackets(qb => {
            qb.where('challenge.status = :openStatus', {
              openStatus: ChallengeStatuses.OPEN,
            });
            qb.orWhere('challenge.status = :evalStatus', {
              evalStatus: ChallengeStatuses.EVALUATION,
            });
          }),
        );
      } else {
        query.andWhere('challenge.status = :status', {
          status: options.filters.status,
        });
      }
    }

    let challenges = await query.orderBy('challenge.id', 'DESC').getMany();

    // Filtering only visible challenges.
    if (challenges.length) {
      const permissions = await this.getPermissionsBulk({
        challengeIds: challenges.map(challenge => challenge.id),
        userId: options.userId,
        community: options.communityId,
        includeVisibilitySettings: true,
        includeExpSettings: false,
      });
      const permissionGrouped = _.keyBy(permissions, 'challengeId');

      challenges = challenges.filter(
        challenge =>
          _.get(permissionGrouped, challenge.id, {
            permissions: { viewChallenge: false },
          }).permissions.viewChallenge,
      );
    }

    // Slicing the paginated data.
    const totalCount = challenges.length;
    if (options.take) {
      challenges = challenges.slice(
        options.skip || 0,
        (options.skip || 0) + options.take,
      );
    }

    if (challenges.length) {
      const challengeIds = challenges.map(challenge => challenge.id);

      // Joining required data on the filtered challenges.
      challenges = await this.challengeRepository
        .createQueryBuilder('challenge')
        .leftJoinAndSelect(
          'challenge.challengeParticipant',
          'challengeParticipant',
        )
        .leftJoinAndSelect('challenge.opportunityType', 'opportunityType')
        .where('challenge.id IN (:...challengeIds)', { challengeIds })
        .orderBy('challenge.id', 'DESC')
        .getMany();

      // Finding challenge opportunities & prizes counts
      const oppoCounts = await this.opportunityService.getChallengesOpportunitiesCount(
        { isDeleted: false, challengeIds, communityId: options.communityId },
      );
      const oppoCountsByChallengeIds = _.keyBy(oppoCounts, 'challengeId');

      const prizeCounts = await this.prizeService.getChallengesPrizesCount({
        isDeleted: false,
        challengeIds,
        communityId: options.communityId,
      });
      const prizeCountsByChallengeIds = _.keyBy(prizeCounts, 'challengeId');

      _.forEach(challenges, (challenge: ChallengeEntity) => {
        challenge['prizesCount'] = _.get(
          prizeCountsByChallengeIds,
          `${challenge.id}.count`,
          0,
        );
        challenge['opportunityCount'] = _.get(
          oppoCountsByChallengeIds,
          `${challenge.id}.count`,
          0,
        );
      });
    }

    return { challenges, totalCount };
  }

  async searchChallenges(options: {
    where: {
      community: number;
      isDeleted?: boolean;
      id?: number;
      status?: string;
      draft?: boolean;
    };
    opportunityData?: boolean;
    userId: number;
  }): Promise<{}> {
    const query = this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect(
        'challenge.challengeParticipant',
        'challengeParticipant',
      )
      .leftJoinAndSelect(
        'challenge.challengeOpportunities',
        'challengeOpportunities',
      )
      .leftJoinAndSelect(
        'challenge.challengeAttachments',
        'challengeAttachments',
      )
      .leftJoinAndSelect(
        'challengeAttachments.userAttachment',
        'userAttachment',
      )
      .leftJoinAndSelect('challenge.opportunityType', 'opportunityType')
      .leftJoinAndSelect('challenge.workflow', 'workflow');

    // Optional Filters.
    if (options.where.community) {
      query.andWhere('challenge.communityId = :community', {
        community: options.where.community,
      });
    }
    if (options.where.hasOwnProperty('isDeleted')) {
      query.andWhere('challenge.isDeleted = :isDeleted', {
        isDeleted: options.where.isDeleted,
      });
    }
    if (options.where.hasOwnProperty('draft')) {
      query.andWhere('challenge.draft = :draft', {
        draft: options.where.draft,
      });
    }
    if (options.where.id) {
      query.andWhere('challenge.id = :id', { id: options.where.id });
    }
    if (options.where.status) {
      if (options.where.status === ChallengeStatuses.OPEN) {
        // Open status filter will fetch both open & in evaluation challenges.
        query.andWhere(
          new Brackets(qb => {
            qb.where('challenge.status = :openStatus', {
              openStatus: ChallengeStatuses.OPEN,
            });
            qb.orWhere('challenge.status = :evalStatus', {
              evalStatus: ChallengeStatuses.EVALUATION,
            });
          }),
        );
      } else {
        query.andWhere('challenge.status = :status', {
          status: options.where.status,
        });
      }
    }

    let challenges = await query.orderBy('challenge.id', 'DESC').getMany();

    // Filtering only visible challenges.
    if (challenges.length) {
      const permissions = await this.getPermissionsBulk({
        challengeIds: challenges.map(challenge => challenge.id),
        userId: options.userId,
        community: options.where.community,
        includeVisibilitySettings: true,
        includeExpSettings: false,
      });
      const permissionGrouped = _.keyBy(permissions, 'challengeId');

      challenges = challenges.filter(
        challenge =>
          _.get(permissionGrouped, challenge.id, {
            permissions: { viewChallenge: false },
          }).permissions.viewChallenge,
      );
    }

    const opportunityIds = {};
    const getCommentCountArr = [];
    const getVoteCountArr = [];
    _.map(challenges, (val: ChallengeEntity) => {
      const challengeOpportunities = _.filter(val.challengeOpportunities, [
        'isDeleted',
        false,
      ]);
      if (challengeOpportunities.length) {
        opportunityIds[val.id] = _.map(challengeOpportunities, 'id');
        val['opportunityCount'] = challengeOpportunities.length;
        getCommentCountArr.push(
          this.opportunityService.getCommentCount({
            opportunityIds: opportunityIds[val.id],
            isDeleted: false,
          }),
        );
        getVoteCountArr.push(
          this.opportunityService.getVoteCount(opportunityIds[val.id]),
        );
        if (!options.opportunityData) {
          delete val.challengeOpportunities;
        }
      }
    });
    let opportunityCommentCounts = await Promise.all(getCommentCountArr);
    let opportunityVoteCounts = await Promise.all(getVoteCountArr);

    opportunityCommentCounts = _.flatMap(opportunityCommentCounts);
    opportunityVoteCounts = _.flatMap(opportunityVoteCounts);

    // Finding followed challenges
    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const challengeIds = challenges.map(challenge => challenge.id);

    let challengeFollowersGrouped;
    let allChallengeFollowersGrouped;
    let prizeCounts = {};

    if (challenges && challenges.length) {
      const challengeFollowers = await this.followingContentService.getUserFollowByEntityObjectIds(
        challengeIds,
        options.userId,
        challengeEntityType.id,
      );
      challengeFollowersGrouped = _.groupBy(
        challengeFollowers,
        'entityObjectId',
      );
      const allChallengeFollowers = await this.followingContentService.getFollowByEntityByEntityObjectId(
        challengeIds,
        challengeEntityType.id,
      );
      allChallengeFollowersGrouped = _.groupBy(
        allChallengeFollowers,
        'entityObjectId',
      );

      prizeCounts = _.keyBy(
        await this.prizeService.getChallengesPrizesCount({
          isDeleted: false,
          challengeIds,
          communityId: options.where.community,
        }),
        'challengeId',
      );
    }

    _.map(challenges, (val: ChallengeEntity) => {
      const foundComments = _.filter(opportunityCommentCounts, function(o) {
        return o.challenge_id == val.id;
      });
      const foundVotes = _.filter(opportunityVoteCounts, function(o) {
        return o.challenge_id == val.id;
      });

      if (foundComments) {
        val['opportunityCommentCounts'] = parseInt(
          _.sumBy(foundComments, 'comment').toString(),
        );
      }
      if (foundVotes) {
        val['opportunityVoteCounts'] = parseInt(
          _.sumBy(foundVotes, 'vote').toString(),
        );
      }

      if (
        allChallengeFollowersGrouped &&
        allChallengeFollowersGrouped[val.id]
      ) {
        const followersCount = (_.head(allChallengeFollowersGrouped[val.id])[
          'userFollowingContents'
        ] as Array<{}>).length;
        val['followersCount'] = followersCount;
      } else {
        val['followersCount'] = 0;
      }

      if (challengeFollowersGrouped && challengeFollowersGrouped[val.id]) {
        val['following'] = true;
        val['followId'] = _.head(challengeFollowersGrouped[val.id])['id'];
      } else {
        val['following'] = false;
      }

      val['prizesCount'] = _.get(prizeCounts, `${val.id}.count`, 0);
    });

    return challenges;
  }

  /**
   * Add a challenge with additional settings and prize detail.s
   * @param data Data to add.
   */
  async addChallenge(data: {}): Promise<ChallengeEntity> {
    const challengeParticipants = data['participants'];
    const entityExperienceSetting = data['entityExperienceSetting'] || {};
    const submissionVisibilitySetting = data['submissionVisibilitySetting'] || {
      public: true,
    };
    const subFormFields = data['subFormFields'];
    let prizes = data['prizes'];
    delete data['subFormFields'];
    delete data['prizes'];
    delete data['participants'];
    delete data['entityExperienceSetting'];
    delete data['submissionVisibilitySetting'];

    const challengeCreated = this.challengeRepository.create(
      UtilsService.replaceJoinColumnsForQueries(data, 'challenge'),
    );
    const challenge = await this.challengeRepository.save(challengeCreated);
    this.elasticSearchService.addChallengeData({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      additionalBrief: challenge.additionalBrief,
      communityId: challenge.communityId,
      isDeleted: challenge.isDeleted,
    });

    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );

    // save challenge participants
    if (challengeParticipants) {
      for (const participant of challengeParticipants) {
        participant.challenge = challenge.id;
      }
      await this.challengeParticipantRepository.save(
        this.challengeParticipantRepository.create(challengeParticipants),
      );
    }

    // save challenge experience settings
    entityExperienceSetting['community'] = challenge.communityId;
    entityExperienceSetting['entityObjectId'] = challenge.id;
    entityExperienceSetting['entityType'] = challengeEntityType.id;

    entityExperienceSetting['allowCommenting'] = true;
    entityExperienceSetting['allowSharing'] = true;
    entityExperienceSetting['defaultSort'] = DefaultSort.NEWEST;
    entityExperienceSetting['allowSubmissions'] = true;
    await this.entityExperienceSettingService.addEntityExperienceSetting(
      entityExperienceSetting,
    );

    // Adding Submissions Visibiility Settings
    this.addSubmissionVisibilitySettings(
      submissionVisibilitySetting,
      challenge.id,
      challenge.communityId,
    );

    // save challenge prizes
    if (prizes) {
      prizes = prizes.map(prize => ({
        ...prize,
        challenge: challenge.id,
        community: challenge.communityId,
      }));
      await this.prizeService.bulkAddPrizes(prizes);
    }

    // assign users required roles
    const adminRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeAdmin,
        community: challenge.communityId,
      },
    });
    const modRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeModerator,
        community: challenge.communityId,
      },
    });
    const userRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeUser,
        community: challenge.communityId,
      },
    });

    let userRoleActors = challenge.sponsors.map(sp => {
      return {
        role: adminRole,
        actorType: RoleActorTypes.USER,
        actorId: sp,
        entityObjectId: challenge.id,
        entityType: entityExperienceSetting['entityType'],
        community: challenge.communityId,
      };
    });
    userRoleActors = userRoleActors.concat(
      challenge.moderators.map(mod => {
        return {
          role: modRole,
          actorType: RoleActorTypes.USER,
          actorId: mod,
          entityObjectId: challenge.id,
          entityType: entityExperienceSetting['entityType'],
          community: challenge.communityId,
        };
      }),
    );
    if (challengeParticipants) {
      userRoleActors = userRoleActors.concat(
        challengeParticipants.map(participant => {
          return {
            role: userRole,
            actorType:
              participant.type === ParticipantTypeEnum.USER
                ? RoleActorTypes.USER
                : RoleActorTypes.GROUP,
            actorId: participant.participantId,
            entityObjectId: challenge.id,
            entityType: entityExperienceSetting['entityType'],
            community: challenge.communityId,
          };
        }),
      );
    }

    await this.roleActorsService.addRoleActors(userRoleActors);

    // Integrating custom field submission form settings.
    if (subFormFields) {
      // Mapping the request data into CustomFieldIntegration object.
      const updatedIntegrationData = _.map(subFormFields, fieldData => ({
        field: fieldData.field,
        order: fieldData.order,
        community: data['community'],
        entityObjectId: challenge.id,
        entityType: challengeEntityType,
        visibilityExperience:
          fieldData.visibilityExperience ||
          VisibilityExpFieldIntegrationEnum.SUBMISSION_FORM,
      }));

      await this.customFieldIntegrationService.addCustomFieldIntegration(
        updatedIntegrationData,
      );
    }

    return challenge;
  }

  /**
   * Add submission visibility settings for a challenge.
   * @param visibilitySetting Submission visbility settings to add.
   * @param challenge Challenge id for which visibility settings need to be added.
   * @param community Community id for the challenge.
   */
  async addSubmissionVisibilitySettings(
    visibilitySetting: {},
    challenge: number,
    community: number | CommunityEntity,
  ): Promise<{}> {
    const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const visibility = { ...visibilitySetting };
    if (visibilitySetting['private']) {
      const ownerRole = await this.roleService.getRoles({
        where: {
          title: In([
            RolesEnum.admin,
            RolesEnum.moderator,
            RolesEnum.challengeAdmin,
            RolesEnum.challengeModerator,
            RolesEnum.opportunityOwner,
            RolesEnum.opportunityContributor,
            RolesEnum.opportunitySubmitter,
          ]),
          community: community,
        },
      });
      const roleIds = _.map(ownerRole, 'id');
      delete visibility['private'];
      visibility['roles'] = roleIds;
    }
    return this.entityVisibilitySettingService.addEntityVisibilitySetting({
      ...visibility,
      entityType: challengeEntityType.id,
      entityObjectId: challenge,
      community: community,
    });
  }

  /**
   * Update a challenge's submission visibility settings.
   * @param visibilitySetting Updated submission visibility settings.
   * @param challenge Challenge for which visibility settings has to be updated.
   */
  async updateSubmissionVisibilitySettings(
    visibilitySetting: {},
    challenge: ChallengeEntity,
  ): Promise<{}> {
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    const visibility = { ...visibilitySetting, roles: [] };
    if (visibilitySetting['private']) {
      const ownerRole = await this.roleService.getRoles({
        where: {
          title: In([
            RolesEnum.admin,
            RolesEnum.moderator,
            RolesEnum.challengeAdmin,
            RolesEnum.challengeModerator,
            RolesEnum.opportunityOwner,
            RolesEnum.opportunityContributor,
            RolesEnum.opportunitySubmitter,
          ]),
          community: challenge.communityId,
        },
      });
      const roleIds = _.map(ownerRole, 'id');
      visibility.roles = roleIds;
    }
    delete visibility['private'];

    this.entityVisibilitySettingService.updateEntityVisibilitySetting(
      {
        entityType: entityType.id,
        entityObjectId: challenge.id,
        community: challenge.communityId,
      },
      visibility,
    );

    // Update all linked opportunities' visibility settings.
    return Promise.all(
      _.map(challenge.challengeOpportunities, (opp: OpportunityEntity) =>
        this.entityVisibilitySettingService.updateEntityVisibilitySetting(
          {
            entityType: oppEntityType,
            entityObjectId: opp.id,
            community: challenge.community.id,
          },
          visibility,
        ),
      ),
    );
  }

  // Archive Challenge
  async archiveChallenge(options: {}): Promise<{}> {
    const existingChallenge = await this.getOneChallenge({ where: options });
    if (!existingChallenge) {
      throw new NotFoundException('Challenge does not exist');
    }

    if (!existingChallenge.isDeleted) {
      this.challengeRepository.update(
        UtilsService.replaceJoinColumnsForQueries(options, 'challenge'),
        { isDeleted: true },
      );
      const opportunities = await this.opportunityService.getOpportunities({
        challenge: existingChallenge.id,
      });

      if (opportunities.length) {
        this.opportunityService.updateOpportunityBulk(
          { id: In(_.map(opportunities, o => o.id)) },
          { challenge: null },
        );
      }
    }
    return {
      ...existingChallenge,
      isDeleted: true,
    };
  }

  /**
   * Simply update challenge entity object.
   */
  async simpleUpdateChallenge(options: {}, data: {}): Promise<{}> {
    return this.challengeRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'challenge'),
      UtilsService.replaceJoinColumnsForQueries(data, 'challenge'),
    );
  }

  /**
   * Update challenge
   */
  async updateChallenge(
    options: {},
    data: {},
    originUrl?: string,
  ): Promise<{}> {
    const existingChallenge = await this.getOneChallenge({ where: options });
    if (!existingChallenge) {
      throw new NotFoundException('Challenge does not exists');
    }

    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const challengeParticipants = data['participants'];
    const entityExperienceSetting = data['entityExperienceSetting'];
    const submissionVisibilitySetting = data['submissionVisibilitySetting'];
    const subFormFields = data['subFormFields'];
    delete data['subFormFields'];
    let prizes = data['prizes'];
    delete data['prizes'];
    delete data['participants'];
    delete data['entityExperienceSetting'];
    delete data['submissionVisibilitySetting'];

    const challenge = await this.challengeRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'challenge'),
      UtilsService.replaceJoinColumnsForQueries(data, 'challenge'),
    );
    const challengeData = await this.getOneChallenge({
      where: { id: options['id'] },
    });
    this.elasticSearchService.addChallengeData({
      id: challengeData.id,
      title: challengeData.title,
      description: challengeData.description,
      additionalBrief: challengeData.additionalBrief,
      communityId: challengeData.communityId,
      isDeleted: challengeData.isDeleted,
    });
    if (challengeParticipants !== undefined && challengeParticipants !== null) {
      await this.challengeParticipantRepository.delete({
        challenge: options['id'],
      });

      // update challenge participants
      if (challengeParticipants) {
        for (const participant of challengeParticipants) {
          participant.challenge = options['id'];
        }
        await this.challengeParticipantRepository.save(
          this.challengeParticipantRepository.create(challengeParticipants),
        );
      }
    }

    const updatedChallenge = await this.getOneChallenge({
      where: { ...options },
      relations: ['community', 'challengeOpportunities'],
    });

    // save and update challenge prizes
    if (prizes) {
      prizes = prizes.map(prize => ({
        ...prize,
        challenge: updatedChallenge.id,
        community: updatedChallenge.communityId,
      }));
      let updatedPrizes = prizes.filter(prize => prize.id);
      const newPrizes = _.difference(prizes, updatedPrizes);
      updatedPrizes = updatedPrizes.map(prize => {
        delete prize['challengeId'];
        delete prize['communityId'];
        delete prize['categoryId'];
        delete prize['createdAt'];
        delete prize['updatedAt'];
        delete prize['awardees'];
        return prize;
      });
      const prizePromises = updatedPrizes.map(prize =>
        this.prizeService.updatePrize({ id: prize.id }, prize),
      );
      prizePromises.push(this.prizeService.bulkAddPrizes(newPrizes));
      await Promise.all(prizePromises);
    }

    if (entityExperienceSetting) {
      this.updateExperienceSettings(
        entityExperienceSetting,
        entityType,
        updatedChallenge,
        oppEntityType,
      );
    }

    // Updating Submission Visbility Settings.
    if (submissionVisibilitySetting) {
      this.updateSubmissionVisibilitySettings(
        submissionVisibilitySetting,
        updatedChallenge,
      );
    }

    // Update existing oppotunities workflows.
    if (data['workflow'] && data['workflow'] !== existingChallenge.workflowId) {
      this.updateExistingOpportunitiesWorkflow(updatedChallenge, originUrl);
    }

    // assign users required roles
    // delete existing role actors
    await this.roleActorsService.deleteRoleActors({
      entityObjectId: updatedChallenge.id,
      entityType: entityType,
      community: updatedChallenge.community,
    });

    const adminRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeAdmin,
        community: updatedChallenge.community,
      },
    });
    const modRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeModerator,
        community: updatedChallenge.community,
      },
    });
    const userRole = await this.roleService.getOneRole({
      where: {
        title: RolesEnum.challengeUser,
        community: updatedChallenge.community,
      },
    });

    // create new role actors
    let userRoleActors = updatedChallenge.sponsors.map(sp => {
      return {
        role: adminRole,
        actorType: RoleActorTypes.USER,
        actorId: sp,
        entityObjectId: updatedChallenge.id,
        entityType: entityType,
        community: updatedChallenge.community,
      };
    });
    userRoleActors = userRoleActors.concat(
      updatedChallenge.moderators.map(mod => {
        return {
          role: modRole,
          actorType: RoleActorTypes.USER,
          actorId: mod,
          entityObjectId: updatedChallenge.id,
          entityType: entityType,
          community: updatedChallenge.community,
        };
      }),
    );

    const updatedParticipants = await this.challengeParticipantRepository.find({
      challenge: options['id'],
    });
    userRoleActors = userRoleActors.concat(
      updatedParticipants.map(participant => {
        return {
          role: userRole,
          actorType:
            participant.type === ParticipantTypeEnum.USER
              ? RoleActorTypes.USER
              : RoleActorTypes.GROUP,
          actorId: participant.participantId,
          entityObjectId: updatedChallenge.id,
          entityType: entityType,
          community: updatedChallenge.community,
        };
      }),
    );
    await this.roleActorsService.addRoleActors(userRoleActors);

    // Integrating custom field submission form settings.
    if (subFormFields) {
      // Updating existing opportunities field linkages.
      await this.updateExistingOpportunitiesLinkedFields({
        challengeId: updatedChallenge.id,
        communityId: updatedChallenge.communityId,
        updatedFields: subFormFields,
        challengeEntityType: entityType,
        integrationType: FieldIntegrationTypeEnum.OPP_TYPE_SUBMISSION_FORM,
      });

      // Mapping the request data into CustomFieldIntegration object.
      const updatedIntegrationData = _.map(subFormFields, fieldData => ({
        field: fieldData.field,
        order: fieldData.order,
        community: updatedChallenge.community,
        entityObjectId: updatedChallenge.id,
        entityType: entityType,
        visibilityExperience:
          fieldData.visibilityExperience ||
          VisibilityExpFieldIntegrationEnum.SUBMISSION_FORM,
      }));

      await this.customFieldIntegrationService.deleteCustomFieldIntegration({
        entityObjectId: updatedChallenge.id,
        entityType: entityType,
        community: updatedChallenge.community,
      });
      await this.customFieldIntegrationService.addCustomFieldIntegration(
        updatedIntegrationData,
      );
    }

    return challenge;
  }

  /**
   * Updates all existing opportunities of a challenge to challenge's workflow.
   * @param challenge Said challenge.
   * @param originUrl Origin Url of the request (for email and redirection purposes).
   */
  private async updateExistingOpportunitiesWorkflow(
    challenge: ChallengeEntity,
    originUrl: string,
  ): Promise<void> {
    const stage = await this.stageService.getOneStage({
      where: { workflow: challenge.workflowId, isDeleted: false },
      order: { orderNumber: 'ASC' },
      relations: ['workflow', 'status', 'actionItem'],
    });
    const opportunities = await this.opportunityService.getOpportunities({
      where: { challenge: challenge.id },
      relations: [
        'challenge',
        'opportunityType',
        'community',
        'stage',
        'stage.actionItem',
        'stage.status',
      ],
    });
    for (const opportunity of opportunities) {
      this.opportunityService.attachStageToOpportunity(
        stage,
        opportunity,
        originUrl,
      );
    }
  }

  /**
   * Update custom fields linked with existing opportunities.
   * @param params Custom fields data to be updated.
   */
  async updateExistingOpportunitiesLinkedFields(params: {
    challengeId: number;
    updatedFields: Array<{}>;
    challengeEntityType: EntityTypeEntity;
    communityId: number;
    integrationType: FieldIntegrationTypeEnum;
  }): Promise<{}> {
    const exisitngIntegratedFields = await this.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityObjectId: params.challengeId,
        entityType: params.challengeEntityType,
        community: params.communityId,
      },
    );

    const opportunities = await this.opportunityService.getOpportunities({
      where: {
        challengeId: params.challengeId,
        communityId: params.communityId,
      },
    });

    return this.opportunityFieldLinkageService.updateExistingOpportunitiesLinkedFields(
      {
        opportunities,
        updatedFields: params.updatedFields,
        exisitngIntegratedFields,
        fieldIntegrationType: params.integrationType,
      },
    );
  }

  /**
   * Update challenge
   */
  async updateChallengeStatus(options: {}, data: {}): Promise<{}> {
    const existingChallenge = await this.getOneChallenge({ where: options });
    if (!existingChallenge) {
      throw new NotFoundException('Challenge does not exists');
    }

    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );
    const oppEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const entityExperienceSetting = data['entityExperienceSetting'];
    const submissionVisibilitySetting = data['submissionVisibilitySetting'];
    delete data['entityExperienceSetting'];
    delete data['submissionVisibilitySetting'];

    if (!entityExperienceSetting.displayAlert) {
      data['alertMessage'] = null;
    }

    const updateResponse = await this.challengeRepository.update(
      UtilsService.replaceJoinColumnsForQueries(options, 'challenge'),
      UtilsService.replaceJoinColumnsForQueries(data, 'challenge'),
    );

    const updatedChallenge = await this.getOneChallenge({
      where: { ...options },
      relations: ['community', 'challengeOpportunities'],
    });

    if (entityExperienceSetting) {
      this.updateExperienceSettings(
        entityExperienceSetting,
        entityType,
        updatedChallenge,
        oppEntityType,
      );
    }

    // Updating Submission Visbility Settings.
    if (submissionVisibilitySetting) {
      this.updateSubmissionVisibilitySettings(
        submissionVisibilitySetting,
        updatedChallenge,
      );
    }
    return updateResponse;
  }

  private async updateExperienceSettings(
    entityExperienceSetting: any,
    entityType: EntityTypeEntity,
    updatedChallenge: ChallengeEntity,
    oppEntityType: EntityTypeEntity,
  ): Promise<void> {
    // save challenge experience settings
    await this.entityExperienceSettingService.updateEntityExperienceSetting(
      {
        entityType: entityType,
        entityObjectId: updatedChallenge.id,
        community: updatedChallenge.community.id,
      },
      entityExperienceSetting,
    );

    // update all linked opportunities' experience settings
    await Promise.all(
      _.map(updatedChallenge.challengeOpportunities, (opp: OpportunityEntity) =>
        this.entityExperienceSettingService.updateEntityExperienceSetting(
          {
            entityType: oppEntityType,
            entityObjectId: opp.id,
            community: updatedChallenge.community.id,
          },
          {
            ...entityExperienceSetting,
            entityType: oppEntityType,
            entityObjectId: opp.id,
          },
        ),
      ),
    );
  }

  /**
   * Increase View Count of a Challenge
   */
  async increaseViewCount(options: {}, data: {}): Promise<{}> {
    const challenge = await this.getOneChallenge({ where: options });
    if (!data['viewCount']) {
      data['viewCount'] = BigInt(challenge.viewCount) + BigInt(1);
    } else {
      data['viewCount'] =
        BigInt(challenge.viewCount) + BigInt(data['viewCount']);
    }
    return this.simpleUpdateChallenge(options, data);
  }

  async getPostOpportunityPermissions(challengeIds: number[]): Promise<{}[]> {
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.CHALLENGE,
    );

    const expSettings = await Promise.all(
      challengeIds.map(challenge =>
        this.entityExperienceSettingService.getEntityExperienceSetting({
          where: {
            entityObjectId: challenge,
            entityType: entityType.id,
          },
        }),
      ),
    );

    const expSettingsGrouped = _.groupBy(expSettings, 'entityObjectId');
    return challengeIds.map(challenge => ({
      challenge,
      postOpportunity:
        _.head(expSettingsGrouped[challenge]) &&
        _.head(expSettingsGrouped[challenge]).allowSubmissions
          ? PERMISSIONS_MAP.ALLOW
          : PERMISSIONS_MAP.DENY,
    }));
  }

  async getPermissions(
    challengeId: number,
    userId: number,
    returnWithId?: boolean,
  ): Promise<CommunityWisePermissionEntity | {}> {
    const options = { userId };
    const challenge = (await this.getChallenges({
      where: { id: challengeId },
      relations: ['challengeParticipant'],
    }))[0];
    const permissions = await this.roleActorsService.getEntityPermissions(
      null,
      null,
      challenge.communityId,
      options,
    );
    const entityType = (await this.entityTypeService.getEntityTypes({
      where: {
        abbreviation: EntityTypeEnum.challenge,
      },
    }))[0];
    const challengePermissions = await this.roleActorsService.getEntityPermissions(
      challengeId,
      entityType.id,
      challenge.communityId,
      options,
    );

    for (const permProperty of Object.getOwnPropertyNames(permissions)) {
      permissions[permProperty] = Math.max(
        permissions[permProperty],
        challengePermissions[permProperty],
      );
    }

    const challengeExpSettings = await this.entityExperienceSettingService.getEntityExperienceSetting(
      {
        where: {
          entityObjectId: challengeId,
          entityType: entityType.id,
          community: challenge.communityId,
        },
      },
    );
    permissions.voteOpportunity = UtilsService.checkScenarioPermission(
      permissions.voteOpportunity,
      challengeExpSettings.allowVoting,
    );
    permissions.shareOpportunity = UtilsService.checkScenarioPermission(
      permissions.shareOpportunity,
      challengeExpSettings.allowSharing,
    );
    permissions.postComments = UtilsService.checkScenarioPermission(
      permissions.postComments,
      challengeExpSettings.allowCommenting,
    );

    // Updating post opportunity permissions.
    permissions.postOpportunity = challengeExpSettings.allowSubmissions
      ? PERMISSIONS_MAP.ALLOW
      : PERMISSIONS_MAP.DENY;

    // View Challenge Permissions based on challenge's participants.
    if (permissions.viewChallenge === PERMISSIONS_MAP.SCENARIO) {
      if (
        !challenge.challengeParticipant ||
        !challenge.challengeParticipant.length
      ) {
        permissions.viewChallenge = PERMISSIONS_MAP.ALLOW;
      } else {
        permissions.viewChallenge = PERMISSIONS_MAP.DENY;
      }
    }

    return returnWithId
      ? {
          permissions,
          challengeId,
        }
      : permissions;
  }

  /**
   * Get challenges permissions optimized for bulk queries.
   * @param params Options to calculate permissions on.
   * @returns Array of permissions for the given challenges.
   */
  async getPermissionsBulk(params: {
    challengeIds: number[];
    userId: number;
    community: number;
    includeExpSettings?: boolean;
    includeVisibilitySettings?: boolean;
  }): Promise<
    { permissions: CommunityWisePermissionEntity; challengeId: number }[]
  > {
    // Fetch given challenges from the community.
    const challenges = await this.getChallenges({
      where: { id: In(params.challengeIds), community: params.community },
      ...(params.includeVisibilitySettings && {
        relations: ['challengeParticipant'],
      }),
    });
    const foundChallengeIds = challenges.map(challenge => challenge.id);

    let finalPermissions = [];
    if (challenges.length) {
      const challengeEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.CHALLENGE,
      );

      // Get community raw permissions.
      const communityPerms = await this.roleActorsService.getEntityPermissions(
        null,
        null,
        params.community,
        { userId: params.userId },
      );

      // Get challenges raw permissions.
      const challengePermissions = await this.roleActorsService.getEntityPermissionsBulk(
        foundChallengeIds,
        challengeEntityType.id,
        params.community,
        params.userId,
      );
      const challengePermsGrouped = _.keyBy(
        challengePermissions,
        'entityObjectId',
      );

      // Get opportunities experience settings.
      let expSettingsGrouped: _.Dictionary<EntityExperienceSettingEntity> = {};
      if (params.includeExpSettings) {
        const expSettings = await this.entityExperienceSettingService.getBulkEntityExperienceSetting(
          {
            where: {
              entityObjectIds: foundChallengeIds,
              entityType: challengeEntityType.id,
              community: params.community,
            },
          },
        );
        expSettingsGrouped = _.keyBy(expSettings, 'entityObjectId');
      }

      finalPermissions = await Promise.all(
        challenges.map(async challenge => {
          const permissions = challengePermsGrouped[challenge.id].permissions;

          // Assigning the maximum permission from raw community & challenge
          // permissions.
          for (const permProperty of Object.getOwnPropertyNames(permissions)) {
            if (!NON_PERMISSION_COLUMNS.includes(permProperty)) {
              permissions[permProperty] = Math.max(
                permissions[permProperty],
                _.get(communityPerms, permProperty, PERMISSIONS_MAP.DENY),
              );
            }
          }

          // Calculating permissions related to experience settings.
          if (params.includeExpSettings) {
            const challengeExpSettings = expSettingsGrouped[challenge.id];
            permissions.voteOpportunity = UtilsService.checkScenarioPermission(
              permissions.voteOpportunity,
              challengeExpSettings.allowVoting,
            );
            permissions.shareOpportunity = UtilsService.checkScenarioPermission(
              permissions.shareOpportunity,
              challengeExpSettings.allowSharing,
            );
            permissions.postComments = UtilsService.checkScenarioPermission(
              permissions.postComments,
              challengeExpSettings.allowCommenting,
            );

            // Updating post opportunity permissions.
            permissions.postOpportunity = challengeExpSettings.allowSubmissions
              ? PERMISSIONS_MAP.ALLOW
              : PERMISSIONS_MAP.DENY;
          }

          // Finidng challenge visibility permissions based on challenge's
          // participants settings. (Empty challenge participants means the
          // challenge is public.)
          // Note: if the current user already has permission to view the
          // challenge then this won't be needed, hence the SCENARIO check.
          if (
            params.includeVisibilitySettings &&
            permissions.viewChallenge === PERMISSIONS_MAP.SCENARIO
          ) {
            permissions.viewChallenge =
              !challenge.challengeParticipant ||
              !challenge.challengeParticipant.length
                ? PERMISSIONS_MAP.ALLOW
                : PERMISSIONS_MAP.DENY;
          }

          return {
            permissions,
            challengeId: challenge.id,
          };
        }),
      );
    }
    return finalPermissions;
  }

  /**
   * Hard Delete challenge
   */
  async deleteChallenge(options: {}): Promise<{}> {
    await this.challengeParticipantRepository.delete({
      challenge: options['id'],
    });
    return this.challengeRepository.delete(
      UtilsService.replaceJoinColumnsForQueries(options, 'challenge'),
    );
  }

  async getRawChallengeParticipants(options: {}): Promise<
    ChallengeParticipantEntity[]
  > {
    return this.challengeParticipantRepository.find(options);
  }

  /**
   * Search Challenges.
   * @param params Search Params.
   */
  async filterChallenges(params: {
    searchText?: string;
    isDeleted?: boolean;
    userId: number;
    community: number;
    draft: boolean;
  }): Promise<{ challenges: ChallengeEntity[]; total: number }> {
    try {
      const rawResults = await this.elasticSearchService.filterChallenges({
        queries: [params.searchText],
        community: params.community,
        isDeleted: params.isDeleted,
        fields: ['title', 'description', 'additionalBrief'],
      });

      const searchResults = _.uniqBy(rawResults.results, 'result.id');

      // Checking permissions for visibility of the results.
      let challengeVisbleResults = [];

      // Filtering out the challenges that are not visible to user.
      if (searchResults.length) {
        // Filtering only visible challenges.
        const permissions = await this.getPermissionsBulk({
          challengeIds: searchResults.map(oppRes =>
            parseInt(oppRes.result['id']),
          ),
          userId: params.userId,
          community: params.community,
          includeVisibilitySettings: true,
          includeExpSettings: false,
        });
        const permissionGrouped = _.keyBy(permissions, 'challengeId');

        challengeVisbleResults = searchResults.filter(
          challRes =>
            _.get(permissionGrouped, challRes.result['id'], {
              permissions: { viewChallenge: false },
            }).permissions.viewChallenge,
        );
      }

      const challenges = challengeVisbleResults.length
        ? await this.getChallenges({
            where: {
              id: In(challengeVisbleResults.map(res => res.result['id'])),
              isDeleted: params.isDeleted,
              community: params.community,
            },
          })
        : [];

      if (challenges.length) {
        const challengeIds = challenges.map(challenge => challenge.id);
        // Finding challenge opportunities
        const oppoCounts = await this.opportunityService.getChallengesOpportunitiesCount(
          {
            isDeleted: params.isDeleted,
            challengeIds,
            communityId: params.community,
          },
        );
        const oppoCountsByChallengeIds = _.keyBy(oppoCounts, 'challengeId');

        _.forEach(challenges, (challenge: ChallengeEntity) => {
          challenge['opportunityCount'] = _.get(
            oppoCountsByChallengeIds,
            `${challenge.id}.count`,
            0,
          );
        });
      }

      const challengesGrouped = _.keyBy(challenges, 'id');

      const finalResults = [];

      // Transforming the results.
      searchResults.forEach(result => {
        if (challengesGrouped[result.result['id']]) {
          finalResults.push(challengesGrouped[result.result['id']]);
        }
      });

      return {
        challenges: finalResults,
        total: finalResults.length,
      };
    } catch (error) {
      Logger.error(
        'ERROR in Ideawake Challenge Service (Search Challenges)',
        error,
      );
      throw error;
    }
  }
}
