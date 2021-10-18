import { Injectable } from '@nestjs/common';
import { CustomFieldIntegrationRepository } from './customFieldIntegration.repository';
import { CustomFieldIntegrationEntity } from './customFieldIntegration.entity';
import { VisibilityExpFieldIntegrationEnum } from '../../enum/visibility-exp-field-integration.enum';

@Injectable()
export class CustomFieldIntegrationService {
  constructor(
    public readonly customFieldIntegrationRepository: CustomFieldIntegrationRepository,
  ) {}

  /**
   * Get customFieldIntegrations
   */
  async getCustomFieldIntegrations(options: {}): Promise<
    CustomFieldIntegrationEntity[]
  > {
    return this.customFieldIntegrationRepository.find(options);
  }

  /**
   * Get customFieldIntegrations with filters.
   */
  async getCustomFieldIntegrationsWithFilters(options: {
    entityObjectId: number; // will be 'stage id', 'opportunity type id', etc.
    entityType: number;
    opportunity: number;
    community?: number;
    visibilityExperience?: VisibilityExpFieldIntegrationEnum;
    checkOpportunity?: boolean;
    includeData?: boolean;
    excludeFieldIds?: Array<number>;
  }): Promise<CustomFieldIntegrationEntity[]> {
    const query = this.customFieldIntegrationRepository
      .createQueryBuilder('custom_field_integration')
      .leftJoinAndSelect('custom_field_integration.field', 'field')
      .leftJoinAndSelect('field.customFieldType', 'customFieldType');

    if (options.includeData) {
      query.leftJoinAndSelect(
        'field.opportunityFieldData',
        'opportunityFieldData',
      );
    }

    query
      .where('custom_field_integration.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .andWhere('custom_field_integration.entityType = :entityType', {
        entityType: options.entityType,
      });

    if (options.community) {
      query.andWhere('custom_field_integration.community = :community', {
        community: options.community,
      });
    }

    if (options.visibilityExperience) {
      query.andWhere(
        'custom_field_integration.visibilityExperience = :visibilityExperience',
        {
          visibilityExperience: options.visibilityExperience,
        },
      );
    }
    if (options.excludeFieldIds && options.excludeFieldIds.length) {
      query.andWhere(`custom_field_integration.field NOT IN (:...fieldIds)`, {
        fieldIds: options.excludeFieldIds,
      });
    }
    if (options.includeData && options.checkOpportunity) {
      query.andWhere(`opportunityFieldData.opportunity = :opportunity`, {
        opportunity: options.opportunity,
      });
    }

    return query.getMany();
  }

  /**
   * Add customFieldIntegration
   */
  async addCustomFieldIntegration(data: {}): Promise<
    CustomFieldIntegrationEntity
  > {
    const customFieldIntegrationCreated = this.customFieldIntegrationRepository.create(
      data,
    );
    return this.customFieldIntegrationRepository.save(
      customFieldIntegrationCreated,
    );
  }

  /**
   * Update customFieldIntegration
   */
  async updateCustomFieldIntegration(options: {}, data: {}): Promise<{}> {
    return this.customFieldIntegrationRepository.update(options, data);
  }

  /**
   * Delete customFieldIntegration
   */
  async deleteCustomFieldIntegration(options: {}): Promise<{}> {
    return this.customFieldIntegrationRepository.delete(options);
  }
}
