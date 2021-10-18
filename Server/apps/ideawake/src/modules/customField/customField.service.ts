import { Injectable } from '@nestjs/common';
import { CustomFieldRepository } from './customField.repository';
import { CustomFieldEntity } from './customField.entity';
import { RoleEntity } from '../role/role.entity';
import { RoleService } from '../role/role.service';
import { In, Not, Brackets } from 'typeorm';
import {
  ROLE_ABBREVIATIONS,
  PERMISSIONS_MAP,
  ENTITY_TYPES,
} from '../../common/constants/constants';
import { CustomFieldTypeEntity } from './customFieldType.entity';
import { CustomFieldTypeRepository } from './customFieldType.repository';
import { groupBy, difference } from 'lodash';
import { RoleActorsService } from '../roleActors/roleActors.service';
import { UtilsService } from '../../providers/utils.service';
import { RoleActorTypes } from '../../enum';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';

@Injectable()
export class CustomFieldService {
  constructor(
    public readonly customFieldRepository: CustomFieldRepository,
    public readonly customFieldTypeRepository: CustomFieldTypeRepository,
    public readonly roleService: RoleService,
    public readonly roleActorsService: RoleActorsService,
  ) {}

  /**
   * Get customFields
   */
  async getCustomFields(options: {}): Promise<CustomFieldEntity[]> {
    return this.customFieldRepository.find(options);
  }

  /**
   * Get custom field
   */
  async getCustomField(options: {}): Promise<CustomFieldEntity> {
    return this.customFieldRepository.findOne(options);
  }

  /**
   * Get custom fields with filters
   */
  async getCustomFieldsWithFilters(options: {
    community: number;
    isDeleted?: boolean;
    searchText?: string;
    customFieldTypes?: number[];
  }): Promise<CustomFieldEntity[]> {
    const query = this.customFieldRepository
      .createQueryBuilder('customField')
      .leftJoinAndSelect('customField.customFieldType', 'customFieldType')
      .where('customField.community = :community', {
        community: options.community,
      });

    if (options.hasOwnProperty('isDeleted')) {
      query.andWhere('customField.isDeleted = :isDeleted', {
        isDeleted: options.isDeleted,
      });
    }

    if (options.customFieldTypes && options.customFieldTypes.length) {
      query.andWhere('customField.customFieldType IN (:...customFieldTypes)', {
        customFieldTypes: options.customFieldTypes,
      });
    }

    if (options.searchText) {
      query.andWhere(
        new Brackets(qb => {
          qb.orWhere(`customField.title ILIKE :title`, {
            title: `%${options.searchText}%`,
          });
          qb.orWhere(`customField.description ILIKE :description`, {
            description: `%${options.searchText}%`,
          });
        }),
      );
    }

    return query.getMany();
  }

  /**
   * Get one customField
   */
  async getOneCustomField(options: {}): Promise<CustomFieldEntity> {
    return this.customFieldRepository.findOne({
      where: {
        ...options,
      },
      relations: ['customFieldType'],
    });
  }

  /**
   * Get customFields
   */
  async getSimpleCustomFields(options: {}): Promise<CustomFieldEntity[]> {
    return this.customFieldRepository.find(options);
  }

  /**
   * Get custom fields list page counts.
   * @param params Options to search total custom fields in a community.
   */
  async getCustomFieldsListCounts(params: {
    community: number;
  }): Promise<{
    total: number;
    active: number;
    archived: number;
  }> {
    const counts = await this.customFieldRepository
      .createQueryBuilder('field')
      .select([
        'COUNT(field.isDeleted) AS count',
        'field.isDeleted AS is_deleted',
      ])
      .groupBy('field.isDeleted')
      .where('field.community = :community', {
        community: params.community,
      })
      .getRawMany();
    const countsGrouped = groupBy(counts, 'is_deleted');

    const activeCount =
      countsGrouped && countsGrouped['false']
        ? parseInt(countsGrouped['false'][0]['count'])
        : 0;
    const archivedCount =
      countsGrouped && countsGrouped['true']
        ? parseInt(countsGrouped['true'][0]['count'])
        : 0;
    const totalCount = activeCount + archivedCount;

    return {
      total: totalCount,
      active: activeCount,
      archived: archivedCount,
    };
  }

  /**
   * Checks the uniqueness of uniqueId in the custom fields table.
   * @param params Options on which to search existing custom fields.
   */
  async checkUniqueId(params: {
    uniqueId: string;
    community: number;
    ignoreId?: number;
  }): Promise<boolean> {
    const options = {
      where: {
        uniqueId: params.uniqueId,
        community: params.community,
        ...(params.ignoreId && { id: Not(params.ignoreId) }),
      },
    };
    const customField = await this.customFieldRepository.findOne(options);
    return customField ? false : true;
  }

  /**
   * Get customFieldTypes
   */
  async getCustomFieldTypes(options: {}): Promise<CustomFieldTypeEntity[]> {
    return this.customFieldTypeRepository.find(options);
  }

  /**
   * Get one customFieldType
   */
  async getOneCustomFieldType(options: {}): Promise<CustomFieldTypeEntity> {
    return this.customFieldTypeRepository.findOne(options);
  }

  /**
   * Get potential role options for Custom Field's Edit and Visibility settings.
   * @param options Find options to find the roles.
   */
  async getRoleOptions(options: { community: number }): Promise<RoleEntity[]> {
    return this.roleService.getRoles({
      where: {
        ...options,
        abbreviation: In([
          ROLE_ABBREVIATIONS.ADMIN,
          ROLE_ABBREVIATIONS.MODERATOR,
          ROLE_ABBREVIATIONS.OPPORTUNITY_OWNER,
          ROLE_ABBREVIATIONS.OPPORTUNITY_CONTRIBUTOR,
        ]),
      },
    });
  }

  /**
   * Add customField
   */
  async addCustomField(data: {}): Promise<CustomFieldEntity> {
    // TODO: Handle roles and cisibility settings properly.
    data['isDeleted'] = false;
    const customFieldCreated = this.customFieldRepository.create(data);
    return this.customFieldRepository.save(customFieldCreated);
  }

  /**
   * Bulk add customField
   */
  async addCustomFieldsBulk(data: {}[]): Promise<CustomFieldEntity[]> {
    data.forEach(field => {
      field['isDeleted'] = false;
    });
    const customFieldCreated = this.customFieldRepository.create(data);
    return this.customFieldRepository.save(customFieldCreated);
  }

  /**
   * Update customField
   */
  async updateCustomField(options: {}, data: {}): Promise<{}> {
    return this.customFieldRepository.update(options, data);
  }

  /**
   * Delete customField
   */
  async archiveCustomField(options: {}): Promise<{}> {
    return this.updateCustomField(options, { isDeleted: true });
  }

  /**
   * Get data permissions for given custom fields on an opportunity.
   * @param customFieldIds All custom field ids to search for.
   * @param opportunityId Opportunity id to return permission on.
   * @param userId User id whose permissions to get.
   */
  async getPermissions(
    customFieldIds: number[],
    opportunityId: number,
    userId: number,
  ): Promise<
    Array<{
      customFieldId: number;
      permissions: {
        editCustomFieldData: number;
        viewCustomFieldData: number;
      };
    }>
  > {
    const fields = await this.customFieldRepository.find({
      where: { id: In(customFieldIds) },
    });

    let permissions = [];

    if (fields && fields.length) {
      const oppEntityTypeId = (await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.IDEA,
      )).id;

      const communityRoles = await this.roleActorsService.getActorEntityRoles(
        RoleActorTypes.USER,
        userId,
        null,
        null,
        fields[0].communityId,
      );
      const communityRoleIds = communityRoles.map(commRole => commRole.role.id);

      let opportunityRoleIds = [];
      if (opportunityId) {
        const opportunityRoles = await this.roleActorsService.getActorEntityRoles(
          RoleActorTypes.USER,
          userId,
          opportunityId,
          oppEntityTypeId,
          fields[0].communityId,
        );
        opportunityRoleIds = opportunityRoles.map(oppRole => oppRole.role.id);
      }

      permissions = fields.map(field => {
        const editPermission = UtilsService.checkScenarioPermission(
          PERMISSIONS_MAP.SCENARIO,
          !field.editRoles ||
            !field.editRoles.length ||
            difference(field.editRoles, opportunityRoleIds).length <
              field.editRoles.length ||
            difference(field.editRoles, communityRoleIds).length <
              field.editRoles.length,
        );
        const viewPermission = UtilsService.checkScenarioPermission(
          PERMISSIONS_MAP.SCENARIO,
          !field.visibilityRoles ||
            !field.visibilityRoles.length ||
            difference(field.visibilityRoles, opportunityRoleIds).length <
              field.visibilityRoles.length ||
            difference(field.visibilityRoles, communityRoleIds).length <
              field.visibilityRoles.length,
        );
        return {
          customFieldId: field.id,
          permissions: {
            editCustomFieldData: editPermission,
            viewCustomFieldData:
              editPermission === PERMISSIONS_MAP.ALLOW
                ? editPermission
                : viewPermission,
          },
        };
      });
    }

    return permissions;
  }
}
