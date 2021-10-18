import { Injectable } from '@nestjs/common';
import { OpportunityFieldLinkageRepository } from './opportunityFieldLinkage.repository';
import { OpportunityFieldLinkageEntity } from './opportunityFieldLinkage.entity';
import { difference } from 'lodash';
import { In, UpdateResult, DeleteResult } from 'typeorm';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import { CustomFieldDataService } from './customFieldData.service';
import { CustomFieldIntegrationEntity } from './customFieldIntegration.entity';
import { OpportunityEntity } from '../opportunity/opportunity.entity';

@Injectable()
export class OpportunityFieldLinkageService {
  constructor(
    public readonly opportunityFieldLinkageRepository: OpportunityFieldLinkageRepository,
    public readonly customFieldDataService: CustomFieldDataService,
  ) {}

  /**
   * Get opportunityFieldLinkages
   */
  async getOpportunityFieldLinkages(params: {
    opportunity: number;
    community: number;
    includeData?: boolean;
    excludeFieldIds?: Array<number>;
  }): Promise<OpportunityFieldLinkageEntity[]> {
    const query = this.opportunityFieldLinkageRepository
      .createQueryBuilder('oppLinkage')
      .leftJoinAndSelect('oppLinkage.field', 'field')
      .leftJoinAndSelect('field.customFieldType', 'customFieldType')
      .where('oppLinkage.opportunity = :opportunity', {
        opportunity: params.opportunity,
      })
      .andWhere('oppLinkage.community = :community', {
        community: params.community,
      });

    if (params.excludeFieldIds && params.excludeFieldIds.length) {
      query.andWhere(`oppLinkage.field NOT IN (:...excludeFieldIds)`, {
        excludeFieldIds: params.excludeFieldIds,
      });
    }

    if (params.includeData) {
      query
        .leftJoinAndSelect('field.opportunityFieldData', 'opportunityFieldData')
        .andWhere(`opportunityFieldData.opportunity = :opportunity`, {
          opportunity: params.opportunity,
        });
    }

    return query.getMany();
  }

  /**
   * Add opportunityFieldLinkage
   */
  async addOpportunityFieldLinkage(data: {}): Promise<
    OpportunityFieldLinkageEntity
  > {
    const opportunityFieldLinkageCreated = this.opportunityFieldLinkageRepository.create(
      data,
    );
    return this.opportunityFieldLinkageRepository.save(
      opportunityFieldLinkageCreated,
    );
  }

  /**
   * Bulk Add or Update opportunityFieldLinkage
   */
  async bulkAddOrUpdateOpportunityFieldLinkage(
    options: {
      opportunity;
      community;
      fieldIntegrationType: FieldIntegrationTypeEnum;
    },
    data: Array<{}>,
  ): Promise<OpportunityFieldLinkageEntity[]> {
    const existingLinkedFields = await this.opportunityFieldLinkageRepository.find(
      {
        where: {
          opportunity: options.opportunity,
          community: options.community,
          field: In(data.map(val => val['field'])),
        },
      },
    );

    const existingFieldIds = existingLinkedFields.map(
      linkedField => linkedField.fieldId,
    );

    // Update Existing Fields.
    const diffFields = existingLinkedFields.filter(
      field =>
        !field.fieldIntegrationType.includes(options.fieldIntegrationType),
    );

    const updateFields = diffFields.map(linkedField =>
      this.opportunityFieldLinkageRepository.update(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { field: linkedField.fieldId as any, opportunity: options.opportunity },
        {
          fieldIntegrationType: linkedField.fieldIntegrationType.concat([
            options.fieldIntegrationType,
          ]),
        },
      ),
    );
    Promise.all(updateFields);

    // Insert New Fields.
    const newFieldsData = data
      .filter(val => !existingFieldIds.includes(val['field']))
      .map(val => ({
        opportunity: options.opportunity,
        community: options.community,
        field: val['field'],
        fieldIntegrationType: [options.fieldIntegrationType],
      }));

    const opportunityFieldLinkageCreated = this.opportunityFieldLinkageRepository.create(
      newFieldsData,
    );
    return this.opportunityFieldLinkageRepository.save(
      opportunityFieldLinkageCreated,
    );
  }

  /**
   * Bulk Add or Update opportunityFieldLinkage
   */
  async bulkRemoveOpportunityFieldLinkage(options: {
    fields: Array<number>;
    opportunity;
    community;
    fieldIntegrationType;
  }): Promise<{}> {
    const existingLinkedFields = await this.opportunityFieldLinkageRepository
      .createQueryBuilder('linkedField')
      .where('linkedField.field IN (:...fields)', {
        fields: options.fields,
      })
      .andWhere(
        ':fieldIntegrationType = ANY(linkedField.fieldIntegrationType)',
        {
          fieldIntegrationType: options.fieldIntegrationType,
        },
      )
      .andWhere('linkedField.opportunity = :opportunity', {
        opportunity: options.opportunity,
      })
      .getMany();

    const oppfieldsWithData = await this.customFieldDataService.getCustomFieldData(
      {
        where: {
          opportunity: options.opportunity,
          field: In(options.fields),
        },
      },
    );

    const fieldsWithDataIds = oppfieldsWithData.map(
      fieldData => fieldData.fieldId,
    );

    const emptyLinkedFields = existingLinkedFields.filter(
      field => !fieldsWithDataIds.includes(field.fieldId),
    );

    // Update fields that have linkage from other sources.
    const diffFields = emptyLinkedFields.filter(
      field => field.fieldIntegrationType.length > 1,
    );

    const queries: Array<Promise<UpdateResult | DeleteResult>> = diffFields.map(
      linkedField =>
        this.opportunityFieldLinkageRepository.update(
          { id: linkedField.id },
          {
            fieldIntegrationType: difference(linkedField.fieldIntegrationType, [
              options.fieldIntegrationType,
            ]),
          },
        ),
    );

    // Remove field linkage that are not linked from any other source.
    const fieldsToRemove = emptyLinkedFields.filter(
      field => field.fieldIntegrationType.length <= 1,
    );
    if (fieldsToRemove.length) {
      const fieldsToRemoveIds = fieldsToRemove.map(field => field.id);
      queries.push(
        this.opportunityFieldLinkageRepository.delete({
          id: In(fieldsToRemoveIds),
        }),
      );
    }
    return Promise.all(queries);
  }

  /**
   * Update custom fields linked with existing opportunities.
   * @param params Details to be updated.
   */
  async updateExistingOpportunitiesLinkedFields(params: {
    opportunities: OpportunityEntity[];
    updatedFields?: Array<{}>;
    exisitngIntegratedFields?: CustomFieldIntegrationEntity[];
    fieldIntegrationType: FieldIntegrationTypeEnum;
  }): Promise<{}> {
    // Remove existing linked fields with no data (if any).
    if (
      params.exisitngIntegratedFields &&
      params.exisitngIntegratedFields.length
    ) {
      const attachedFieldIds = params.exisitngIntegratedFields.map(
        attField => attField.fieldId,
      );
      const fieldLinkageDeletions = params.opportunities.map(opportunity =>
        this.bulkRemoveOpportunityFieldLinkage({
          fields: attachedFieldIds,
          opportunity: opportunity.id,
          community: opportunity.communityId,
          fieldIntegrationType: params.fieldIntegrationType,
        }),
      );
      await Promise.all(fieldLinkageDeletions);
    }

    // Link updated fields with opportunities.
    if (params.updatedFields && params.updatedFields.length) {
      const fieldLinkageUpdates = params.opportunities.map(opportunity =>
        this.bulkAddOrUpdateOpportunityFieldLinkage(
          {
            opportunity: opportunity.id,
            community: opportunity.communityId,
            fieldIntegrationType: params.fieldIntegrationType,
          },
          params.updatedFields.map(val => ({ field: val['field'] })),
        ),
      );

      await Promise.all(fieldLinkageUpdates);
    }
    return Promise.resolve({});
  }

  /**
   * Bulk Add opportunityFieldLinkage
   */
  async bulkAddOpportunityFieldLinkage(
    data: Array<{}>,
  ): Promise<OpportunityFieldLinkageEntity[]> {
    const opportunityFieldLinkageCreated = this.opportunityFieldLinkageRepository.create(
      data,
    );
    return this.opportunityFieldLinkageRepository.save(
      opportunityFieldLinkageCreated,
    );
  }

  /**
   * Update opportunityFieldLinkage
   */
  async updateOpportunityFieldLinkage(options: {}, data: {}): Promise<{}> {
    return this.opportunityFieldLinkageRepository.update(options, data);
  }

  /**
   * Delete opportunityFieldLinkage
   */
  async deleteOpportunityFieldLinkage(options: {}): Promise<{}> {
    return this.opportunityFieldLinkageRepository.delete(options);
  }
}
