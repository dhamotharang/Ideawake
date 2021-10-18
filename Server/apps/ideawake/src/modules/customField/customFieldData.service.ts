import { Injectable } from '@nestjs/common';
import { CustomFieldDataEntity } from './customFieldData.entity';
import { CustomFieldDataRepository } from './customFieldData.repository';
import * as moment from 'moment';
import { map, groupBy, head, uniq, intersection, sortBy } from 'lodash';
import { SelectQueryBuilder, In, Not } from 'typeorm';
import { CustomFieldService } from './customField.service';
import { CustomFieldTypeEntity } from './customFieldType.entity';
import { CUSTOM_FIELD_TYPE_ABBREVIATIONS } from '../../common/constants/constants';
import { OpportunityRepository } from '../opportunity/opportunity.repository';
import { OpportunityEntity } from '../opportunity/opportunity.entity';
import { CustomFieldEntity } from './customField.entity';
import { CustomFieldIntegrationService } from '../customField/customFieldIntegration.service';
import { OpportunityFieldLinkageRepository } from './opportunityFieldLinkage.repository';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import { GetCustomFieldDataCountDto } from './dto/GetCustomFieldDataCountDto';

@Injectable()
export class CustomFieldDataService {
  constructor(
    public readonly customFieldDataRepository: CustomFieldDataRepository,
    public readonly opportunityRepository: OpportunityRepository,
    public customFieldService: CustomFieldService,
    public readonly customFieldIntegrationService: CustomFieldIntegrationService,
    public readonly opportunityFieldLinkageRepository: OpportunityFieldLinkageRepository,
  ) {}

  /**
   * Get customFieldDataEntitys
   */
  async getCustomFieldData(options: {}): Promise<CustomFieldDataEntity[]> {
    return this.customFieldDataRepository.find(options);
  }

  /**
   * Recursive function to create nested query for filtering custom fields data.
   * @param filters Custom field filter options.
   * @param index Current filter's index.
   * @param query Main filter query.
   */
  private createFiltersNestedQuery(
    params: {
      filters: {
        customField: number;
        fieldType: CustomFieldTypeEntity;
        selectValue?: string[];
        noEntry?: boolean;
        searchText?: string;
        numValueSort?: 'DESC' | 'ASC';
        dateFrom?: string;
        dateTo?: string;
      }[];
      includedOpportunities?: number[];
    },
    index: number,
    query?: SelectQueryBuilder<CustomFieldDataEntity>,
  ): SelectQueryBuilder<CustomFieldDataEntity> {
    const currFilter = params.filters[index];
    let subQuery: SelectQueryBuilder<CustomFieldDataEntity>;

    // Create the main query if not given otherwise create the subquery within
    // the given query.
    if (!query) {
      query = this.customFieldDataRepository.createQueryBuilder(
        `customFieldData${index}`,
      );

      // Include only the given opportunities if required.
      if (params.includedOpportunities && params.includedOpportunities.length) {
        query.where(
          `customFieldData${index}.opportunity IN (:...includedOpps)`,
          {
            [`includedOpps`]: params.includedOpportunities,
          },
        );
      }

      subQuery = query;
    } else {
      subQuery = query
        .subQuery()
        .select(`customFieldData${index}.opportunity`)
        .from(CustomFieldDataEntity, `customFieldData${index}`);
    }

    subQuery.andWhere(`customFieldData${index}.field = :customField${index}`, {
      [`customField${index}`]: currFilter.customField,
    });

    if (
      [
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT,
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT,
      ].includes(currFilter.fieldType.abbreviation) &&
      currFilter.selectValue
    ) {
      // Filters by checking if selected value(s) include the given values(s).
      subQuery.andWhere(
        `customFieldData${index}.fieldData ::jsonb->'selected' ?| ARRAY[:...selectValue${index}]`,
        {
          [`selectValue${index}`]: currFilter.selectValue,
        },
      );
    } else if (
      [
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_LINE_TEXT,
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_LINE_TEXT,
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.RICH_TEXT,
      ].includes(currFilter.fieldType.abbreviation) &&
      currFilter.searchText
    ) {
      // Filters by searching the given text in the field data.
      subQuery.andWhere(
        `customFieldData${index}.fieldData ->>'text' ILIKE :textSearch${index}`,
        {
          [`textSearch${index}`]: `%${currFilter.searchText}%`,
        },
      );
    } else if (
      [
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.FILE_UPLOAD,
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.VIDEO_UPLOAD,
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.IMAGE_UPLOAD,
      ].includes(currFilter.fieldType.abbreviation) &&
      currFilter.searchText
    ) {
      // Filters by searching the given file search text in the field data.
      // Done by searching through the filename at the end of the link.
      subQuery
        .andWhere(
          `customFieldData${index}.fieldData ->>'file' ILIKE :fileSearch${index}`,
          {
            [`fileSearch${index}`]: `%/%${currFilter.searchText}%`,
          },
        )
        .andWhere(
          `customFieldData${index}.fieldData ->>'file' NOT ILIKE :fileNotSearch${index}`,
          {
            [`fileNotSearch${index}`]: `%${currFilter.searchText}%/%`,
          },
        );
    } else if (
      currFilter.fieldType.abbreviation ===
        CUSTOM_FIELD_TYPE_ABBREVIATIONS.DATEPICKER &&
      currFilter.dateTo &&
      currFilter.dateFrom
    ) {
      // Filters by searching the given date range.
      subQuery.andWhere(
        `make_date(CAST (customFieldData${index}.fieldData ->'date'->>'year' AS INTEGER),
            CAST (customFieldData${index}.fieldData ->'date'->>'month' AS INTEGER),
            CAST (customFieldData${index}.fieldData ->'date'->>'day' AS INTEGER))
            BETWEEN :dateFrom${index} AND :dateTo${index}`,
        {
          [`dateTo${index}`]: currFilter.dateTo,
          [`dateFrom${index}`]: currFilter.dateFrom,
        },
      );
    }

    // Sort according to given numeric field.
    if (currFilter.numValueSort) {
      subQuery.orderBy(
        `CAST( customFieldData${index}.fieldData ->>'number' AS decimal)`,
        currFilter.numValueSort,
      );
    }

    // Create subquery recusively except the base case i.e. the last filter.
    if (index < params.filters.length - 1) {
      subQuery.andWhere(
        `customFieldData${index}.opportunity = ANY ${this.createFiltersNestedQuery(
          params,
          index + 1,
          query,
        ).getQuery()}`,
      );
    }

    return subQuery;
  }

  /**
   * Filters opportunities by their custom fields data.
   * @param params Filter options.
   * @return Filtered opportunities' ids.
   */
  async filterOpportunitiesByFieldData(params: {
    filters: {
      customField: number;
      selectValue?: string[];
      noEntry?: boolean;
      searchText?: string;
      numValueSort?: 'DESC' | 'ASC';
      dateFrom?: string;
      dateTo?: string;
    }[];
    includedOpportunities?: number[];
    community: number;
  }): Promise<number[]> {
    const fields = await this.customFieldService.getCustomFields({
      where: { id: In(params.filters.map(filter => filter.customField)) },
      relations: ['customFieldType'],
    });
    const fieldsGrouped = groupBy(fields, 'id');

    let updatedFilters = params.filters.map(filter => ({
      ...filter,
      fieldType: head(fieldsGrouped[filter.customField]).customFieldType,
    }));

    // Pushing number sort filters to top so that sorting can take effect.
    // Index is given to the lodash method as a string to push the filters with
    // numValueSort to top while preserving the order.
    updatedFilters = sortBy(updatedFilters, [
      (filter, index): string | null =>
        filter.numValueSort ? `${index}` : null,
    ]);

    // Get opporunities with no custom field data entry.
    const noEntryFields = params.filters
      .filter(filter => filter.noEntry)
      .map(filter => filter.customField);
    let oppsWithEntry = [];
    let oppsWithoutEntry = [];

    if (noEntryFields.length) {
      oppsWithEntry = uniq(
        (await this.getCustomFieldData({
          where: { field: In(noEntryFields) },
        })).map(fieldData => fieldData.opportunityId),
      );

      if (oppsWithEntry.length) {
        oppsWithoutEntry = (await this.opportunityRepository.find({
          where: { id: Not(In(oppsWithEntry)), communityId: params.community },
        })).map(opp => opp.id);
      }
    }

    let filteredOppoIds = oppsWithoutEntry;

    // Only filter through the given opportunities if required.
    if (params.includedOpportunities && params.includedOpportunities.length) {
      filteredOppoIds = oppsWithoutEntry.length
        ? intersection(params.includedOpportunities, oppsWithoutEntry)
        : params.includedOpportunities;

      // Set the filtered opportunities' ids to null if no opportunity is to be
      // filtered.
      if (!filteredOppoIds.length) {
        filteredOppoIds = [null];
      }
    }

    // If there other than 'No Entry' filters query for them, otherwise
    // return the opportunities without the field entry.
    if (noEntryFields.length !== params.filters.length) {
      const customFieldsData = await this.createFiltersNestedQuery(
        {
          filters: updatedFilters,
          ...(filteredOppoIds.length && {
            includedOpportunities: filteredOppoIds,
          }),
        },
        0,
      ).getMany();
      filteredOppoIds = customFieldsData.map(data => data.opportunityId);
    }

    return filteredOppoIds;
  }

  /**
   * Get opportunities count against custom fields' data.
   * @param params Options to find custom fields.
   * @return Array containing counts found respective to the fields.
   */
  async getFieldsDataCounts(params: {
    community: number;
    fields?: number[];
    opportunities: OpportunityEntity[];
    opportunitiesCount: number;
    returnFieldDetail?: boolean;
  }): Promise<
    {
      field: number; // Custom Field's Id.
      hasEntry: number; // Count of opportunities having data for the field.
      noEntry: number; // Count of opportunities having no data for the field.
      responses?: {
        // Optional. Responses count for single & multi select fields.
        option: string; // Response option key.
        count: number; // Count of opportunities with this response.
      }[];
      fieldDetail?: CustomFieldEntity;
    }[]
  > {
    const fields = await this.customFieldService.getSimpleCustomFields({
      where: {
        community: params.community,
        ...(params.fields && params.fields.length && { id: In(params.fields) }),
      },
      relations: ['customFieldType'],
    });

    let fieldsCounts = [];
    if (fields.length) {
      // Count the opportunities with field data entry.
      const entryCountsQuery = this.customFieldDataRepository
        .createQueryBuilder('fieldData')
        .select([
          'fieldData.field AS field',
          'COUNT(fieldData.opportunity)::int AS count',
        ])
        .where('fieldData.community = :community', {
          community: params.community,
        });
      if (params.opportunities.length) {
        entryCountsQuery.andWhere(
          'fieldData.opportunity IN (:...opportunities)',
          {
            opportunities: params.opportunities.map(opp => opp.id),
          },
        );
      }
      const entryCounts = await entryCountsQuery
        .andWhere('fieldData.field IN (:...fields)', {
          fields: fields.map(field => field.id),
        })
        .groupBy('fieldData.field')
        .getRawMany();

      const entryCountsGrouped = groupBy(entryCounts, 'field');

      // Count single select responses.
      const singleSelectFields = fields.filter(
        field =>
          field.customFieldType.abbreviation ===
          CUSTOM_FIELD_TYPE_ABBREVIATIONS.SINGLE_SELECT,
      );
      let singleSelectCounts = [];
      if (singleSelectFields.length) {
        const query = this.customFieldDataRepository
          .createQueryBuilder('customFieldData')
          .select([
            'customFieldData.field AS field',
            `customFieldData.fieldData ::jsonb->>'selected' AS selected`,
            'COUNT(customFieldData.opportunity)::int AS count',
          ])
          .where('customFieldData.community = :community', {
            community: params.community,
          });
        if (params.opportunities.length) {
          query.andWhere('customFieldData.opportunity IN (:...opportunities)', {
            opportunities: params.opportunities.map(opp => opp.id),
          });
        }
        singleSelectCounts = await query
          .andWhere('customFieldData.field IN (:...fields)', {
            fields: singleSelectFields.map(field => field.id),
          })
          .groupBy(`customFieldData.field , selected`)
          .getRawMany();
      }

      // Count multi-select responses.
      const multiSelectFields = fields.filter(
        field =>
          field.customFieldType.abbreviation ===
          CUSTOM_FIELD_TYPE_ABBREVIATIONS.MULTI_SELECT,
      );
      let multiSelectCounts = [];
      if (multiSelectFields.length) {
        const query = this.customFieldDataRepository
          .createQueryBuilder('customFieldData')
          .select([
            'customFieldData.field AS field',
            `json_array_elements_text( customFieldData.fieldData ->'selected') AS selected`,
            'COUNT(customFieldData.opportunity)::int AS count',
          ])
          .where('customFieldData.community = :community', {
            community: params.community,
          });
        if (params.opportunities.length) {
          query.andWhere('customFieldData.opportunity IN (:...opportunities)', {
            opportunities: params.opportunities.map(opp => opp.id),
          });
        }
        multiSelectCounts = await query
          .andWhere('customFieldData.field IN (:...fields)', {
            fields: multiSelectFields.map(field => field.id),
          })
          .groupBy(`customFieldData.field , selected`)
          .getRawMany();
      }

      const selectResponsesCounts = {
        ...groupBy(singleSelectCounts, 'field'),
        ...groupBy(multiSelectCounts, 'field'),
      };

      // Map all counts to respective fields and calculate no entry counts.
      fieldsCounts = fields.map(field => {
        const fieldEntryCount = entryCountsGrouped[field.id]
          ? head(entryCountsGrouped[field.id])['count']
          : 0;
        const responses = selectResponsesCounts[field.id]
          ? selectResponsesCounts[field.id].map(res => ({
              option: res['selected'],
              count: res['count'],
            }))
          : [];
        return {
          field: field.id,
          hasEntry: fieldEntryCount,
          noEntry: params.opportunitiesCount - fieldEntryCount,
          ...(responses.length && { responses }),
          ...(params.returnFieldDetail && { fieldDetail: field }),
        };
      });
    }

    return fieldsCounts;
  }

  /**
   * Add customFieldDataEntity
   */
  async addCustomFieldData(data: {}): Promise<CustomFieldDataEntity> {
    const customFieldDataEntityCreated = this.customFieldDataRepository.create(
      data,
    );
    return this.customFieldDataRepository.save(customFieldDataEntityCreated);
  }

  /**
   * Update or Add customFieldData
   */
  async addOrUpdateCustomFieldData(
    options: {
      opportunity: number;
      community: number;
    },
    data: Array<{
      id: number;
      field: number;
      fieldData: {};
      history: {};
      community: number;
    }>,
  ): Promise<{}> {
    const storedData = await this.getCustomFieldData({
      where: {
        opportunity: options.opportunity,
        community: options.community,
      },
    });
    const storedDataGrouped = groupBy(storedData, 'id');
    const updateArray = [];
    const addArray = [];
    map(
      data,
      (val: {
        fieldData: object;
        id: number;
        history: object;
        field: number;
        community: number;
      }) => {
        if (val.id) {
          if (storedDataGrouped[val.id][0].history) {
            val.history = {
              ...{
                [moment().format()]: {
                  from: storedDataGrouped[val.id][0].fieldData,
                  to: val.fieldData,
                },
              },
              ...storedDataGrouped[val.id][0].history,
            };
          } else {
            val.history = {
              [moment().format()]: {
                from: storedDataGrouped[val.id][0].fieldData,
                to: val.fieldData,
              },
            };
          }
          updateArray.push(
            this.simpleUpdateCustomFieldData({ id: val.id }, val),
          );
        } else {
          addArray.push(
            this.addCustomFieldData({
              field: val.field,
              fieldData: val.fieldData,
              opportunity: options.opportunity,
              community: val.community,
            }),
          );
        }
      },
    );
    await Promise.all(addArray);
    await Promise.all(updateArray);
    return {};
  }

  /**
   * Simple Update customFieldDataEntity
   */
  async simpleUpdateCustomFieldData(options: {}, data: {}): Promise<{}> {
    return this.customFieldDataRepository.update(options, data);
  }

  /**
   * Delete customFieldDataEntity
   */
  async deleteCustomFieldData(options: {}): Promise<{}> {
    return this.customFieldDataRepository.delete(options);
  }

  /**
   * Bulk Update or Add Custom Field Data
   */
  async bulkAddOrUpdateCustomFieldData(data, req): Promise<{}> {
    let dataToBeAdded = [];
    let addedFieldResponse;
    const updatedFieldResponse = [];
    let fieldsToBeUpdated = [];

    //Check for existing linkage
    const existingLinkedFields = await this.opportunityFieldLinkageRepository.find(
      {
        where: {
          opportunity: In(data.opportunityIds),
          communityId: req['userData'].currentCommunity,
          field: data.field.field,
        },
      },
    );

    if (!existingLinkedFields.length) {
      // Insert new field linkage
      const newFieldsData = data.opportunityIds.map(opportunityId => ({
        opportunity: opportunityId,
        community: req['userData'].currentCommunity,
        field: data.field.field,
        fieldIntegrationType: [FieldIntegrationTypeEnum.DIRECT],
      }));

      const opportunityFieldLinkageCreated = this.opportunityFieldLinkageRepository.create(
        newFieldsData,
      );
      this.opportunityFieldLinkageRepository.save(
        opportunityFieldLinkageCreated,
      );
    } else {
      const diffFields = existingLinkedFields.filter(
        field =>
          !field.fieldIntegrationType.includes(FieldIntegrationTypeEnum.DIRECT),
      );
      // Update Existing linkage.
      diffFields.map(linkedField =>
        this.opportunityFieldLinkageRepository.update(
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            field: linkedField.fieldId as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            opportunity: linkedField.opportunityId as any,
          },
          {
            fieldIntegrationType: linkedField.fieldIntegrationType.concat([
              FieldIntegrationTypeEnum.DIRECT,
            ]),
          },
        ),
      );
    }

    // Check for existing data
    const storedData = await this.getCustomFieldData({
      where: {
        opportunity: In(data.opportunityIds),
        community: req['userData'].currentCommunity,
        field: data.field.field,
      },
    });
    const storedDataGrouped = groupBy(storedData, 'id');

    const opportunityIdStoredData = storedData.map(val => val.opportunityId);
    const noDataField = data.opportunityIds.filter(
      id => !opportunityIdStoredData.includes(id),
    );

    if (noDataField.length) {
      // Insert new field data
      dataToBeAdded = noDataField.map(opportunityId => {
        return {
          field: data.field.field,
          fieldData: data.field.fieldData,
          opportunity: opportunityId,
          community: req['userData'].currentCommunity,
        };
      });
      addedFieldResponse = await this.addCustomFieldData(dataToBeAdded);
    } else {
      // Update exisiting field data and maintain history
      fieldsToBeUpdated = storedData.map(val => {
        return {
          id: val.id,
          fieldData: data.field.fieldData,
          field: data.field.field,
        };
      });

      map(
        fieldsToBeUpdated,
        (val: {
          fieldData: object;
          id: number;
          history: object;
          field: number;
        }) => {
          if (val.id) {
            if (storedDataGrouped[val.id][0].history) {
              val.history = {
                ...{
                  [moment().format()]: {
                    from: storedDataGrouped[val.id][0].fieldData,
                    to: val.fieldData,
                  },
                },
                ...storedDataGrouped[val.id][0].history,
              };
            } else {
              val.history = {
                [moment().format()]: {
                  from: storedDataGrouped[val.id][0].fieldData,
                  to: val.fieldData,
                },
              };
            }
            // update exisiting field data with histroy
            updatedFieldResponse.push(
              this.simpleUpdateCustomFieldData({ id: val.id }, val),
            );
          }
        },
      );

      await Promise.all(updatedFieldResponse);
    }
    return addedFieldResponse ? addedFieldResponse : updatedFieldResponse;
  }

  async attachCustomFieldCount(
    data: GetCustomFieldDataCountDto,
    req,
  ): Promise<{}[]> {
    const query = await this.customFieldDataRepository
      .createQueryBuilder('field')
      .select(['count(field.opportunity) AS opportunity_id_count'])
      .where('field.opportunity IN (:...opportunityIds)', {
        opportunityIds: data.opportunityIds,
      })
      .andWhere('field.field = :customField', { customField: data.fieldId })
      .andWhere('field.community = :community', {
        community: req['userData'].currentCommunity,
      })
      .getRawMany();

    const response = query.map(res => ({
      opportunityIdCount: res['opportunity_id_count'],
    }));

    return response;
  }
}
