import { Injectable, ForbiddenException } from '@nestjs/common';
import { OpportunityTypeRepository } from './opportunityType.repository';
import { OpportunityTypeEntity } from './opportunityType.entity';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';
import { EntityExperienceSettingService } from '../entityExperienceSetting/entityExperienceSetting.service';
import { CommunityService } from '../community/community.service';
import { Not } from 'typeorm';
import { difference, pull } from 'lodash';

@Injectable()
export class OpportunityTypeService {
  constructor(
    public readonly opportunityTypeRepository: OpportunityTypeRepository,
    public readonly roleActorService: RoleActorsService,
    public readonly entityExperienceSettingService: EntityExperienceSettingService,
    private readonly communityService: CommunityService,
  ) {}

  /**
   * Get opportunityTypes
   */
  async getOpportunityTypes(options: {}): Promise<OpportunityTypeEntity[]> {
    return this.opportunityTypeRepository.find(options);
  }

  /**
   * Get single opportunity type.
   */
  async getOpportunityType(options: {}): Promise<OpportunityTypeEntity> {
    return this.opportunityTypeRepository.findOne(options);
  }

  /**
   * Checks the uniqueness of name in the opportunity type table.
   * @param params Options on which to search existing opportunity type.
   */
  async checkOpportunityType(params: {
    name: string;
    isDeleted: boolean;
    communityId: number;
    excludedId?: number;
  }): Promise<boolean> {
    const options = {
      where: {
        name: params.name,
        isDeleted: params.isDeleted,
        community: params.communityId,
        ...(params.excludedId && { id: Not(params.excludedId) }),
      },
    };
    const opportunityType = await this.getOpportunityType(options);
    return opportunityType ? true : false;
  }

  /**
   * Add opportunityType
   */
  async addOpportunityType(data: {}): Promise<OpportunityTypeEntity> {
    const opportunityTypeCreated = this.opportunityTypeRepository.create(data);
    const opportunityTypeSaved = await this.opportunityTypeRepository.save(
      opportunityTypeCreated,
    );

    // Add default experience settings
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );

    const experienceSettings = await this.entityExperienceSettingService.getDeniedExperienceSetting();
    experienceSettings.allowOpportunityOwnership = true;
    experienceSettings.allowOpportunityTeams = true;
    experienceSettings.allowOpportunityCosubmitters = true;
    experienceSettings.community = opportunityTypeSaved.community;
    experienceSettings.entityObjectId = opportunityTypeSaved.id;
    experienceSettings.entityType = entityType;

    await this.entityExperienceSettingService.addEntityExperienceSetting(
      experienceSettings,
    );

    return opportunityTypeSaved;
  }

  /**
   * Get bulk opportunityType Experience Settings
   */
  async getBulkOpportunityTypeExperienceSettings(options: {
    opportunityTypes: number[];
    community: number;
  }): Promise<{}> {
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );

    return this.entityExperienceSettingService.getBulkEntityExperienceSetting({
      where: {
        entityType: entityType.id,
        entityObjectIds: options.opportunityTypes,
        community: options.community,
      },
    });
  }

  /**
   * Get opportunityType Experience Settings
   */
  async getOpportunityTypeExperienceSettings(options: {}): Promise<{}> {
    const opportunityType = await this.opportunityTypeRepository.findOne(
      options,
    );
    if (!opportunityType) {
      return {};
    }
    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );

    return this.entityExperienceSettingService.getEntityExperienceSetting({
      where: {
        entityType: entityType.id,
        entityObjectId: opportunityType.id,
        community: opportunityType.communityId,
      },
    });
  }

  /**
   * Update opportunityType Experience Settings
   */
  async updateOpportunityTypeExperienceSettings(
    options: {},
    data: {},
    userId,
  ): Promise<{}> {
    const opportunityType = await this.opportunityTypeRepository.findOne(
      options,
    );

    const permissions = await this.communityService.getPermissions(
      opportunityType.communityId,
      userId,
    );

    if (!permissions.editOpportunityType) {
      throw new ForbiddenException();
    }

    const entityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.OPPORTUNITY_TYPE,
    );

    return this.entityExperienceSettingService.updateEntityExperienceSetting(
      {
        entityType,
        entityObjectId: opportunityType.id,
        community: opportunityType.communityId,
      },
      data,
    );
  }

  /**
   * Update opportunityType
   */
  async updateOpportunityType(options: {}, data: {}): Promise<{}> {
    return this.opportunityTypeRepository.update(options, data);
  }

  /**
   * Delete opportunityType
   */
  async deleteOpportunityType(options: {}): Promise<{}> {
    return this.opportunityTypeRepository.delete(options);
  }

  async addOpportunityLinks(
    linkableTypes: [],
    options: {
      id: number;
      community: number;
      userId: number;
    },
  ) {
    Promise.all(
      linkableTypes.map(typeId => this.addOpportunityLink(typeId, options)),
    );
  }

  async addOpportunityLink(
    typeId: number,
    options: { id: number; community: number; userId: number },
  ) {
    const opportunityType = await this.getOpportunityType({
      where: { id: typeId, community: options.community },
    });

    opportunityType.linkableTypes.push(options.id);
    await this.updateOpportunityType(
      { id: typeId, community: options.community },
      {
        linkableTypes: opportunityType.linkableTypes,
        enableLinking: true,
        updatedBy: options.userId,
      },
    );
  }

  async updateOpportunityLinks(
    existingOppoType: OpportunityTypeEntity,
    linkableTypes: [],
    options: {
      id: number;
      community: number;
      userId: number;
    },
  ) {
    const removed = difference(existingOppoType.linkableTypes, linkableTypes);
    Promise.all(
      removed.map(removedId => this.updateLinks(removedId, false, options)),
    );

    const added = difference(linkableTypes, existingOppoType.linkableTypes);
    Promise.all(added.map(addId => this.updateLinks(addId, true, options)));
  }

  async updateLinks(
    typeId: number,
    isAdd: boolean,
    options: {
      id: number;
      community: number;
      userId: number;
    },
  ) {
    const opportunityType = await this.getOpportunityType({
      where: { id: typeId, community: options.community },
    });

    let linkableTypes = [];
    if (isAdd) {
      linkableTypes = opportunityType.linkableTypes;
      linkableTypes.push(options.id);
    } else {
      linkableTypes = pull(opportunityType.linkableTypes, options.id);
    }

    await this.updateOpportunityType(
      { id: typeId, community: options.community },
      {
        linkableTypes,
        enableLinking: isAdd ? true : opportunityType.enableLinking,
        updatedBy: options.userId,
      },
    );
  }
}
