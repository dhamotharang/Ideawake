import { Injectable } from '@nestjs/common';
import { OppoCriteriaEvalSummaryRepository } from './oppoCriteriaEvalSummary.repository';
import { OppoCriteriaEvalSummaryEntity } from './oppoCriteriaEvalSummary.entity';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { get, keyBy } from 'lodash';

@Injectable()
export class OppoCriteriaEvalSummaryService {
  constructor(
    public readonly oppoCriteriaEvalSummaryRepository: OppoCriteriaEvalSummaryRepository,
  ) {}

  /**
   * Find and fetch opportunities' criteria wise evaluation summaries.
   * @param options Options to find summaries.
   * @returns Summaries found.
   */
  async getOppoCriteriaEvalSummaries(
    options: FindManyOptions<OppoCriteriaEvalSummaryEntity>,
  ): Promise<OppoCriteriaEvalSummaryEntity[]> {
    return this.oppoCriteriaEvalSummaryRepository.find(options);
  }

  /**
   * Find and fetch opportunity's criteria wise evaluation summary.
   * @param options Options to find summary.
   * @returns Summary found.
   */
  async getOppoCriteriaEvalSummary(
    options: FindOneOptions<OppoCriteriaEvalSummaryEntity>,
  ): Promise<OppoCriteriaEvalSummaryEntity> {
    return this.oppoCriteriaEvalSummaryRepository.findOne(options);
  }

  /**
   * Add an opportunity's criteria wise evaluation summary.
   * @param data Summary data.
   * @returns Addedd summary object.
   */
  async addOppoCriteriaEvalSummary(
    data: DeepPartial<OppoCriteriaEvalSummaryEntity>,
  ): Promise<OppoCriteriaEvalSummaryEntity> {
    const oppoCriteriaEvalSummaryCreated = this.oppoCriteriaEvalSummaryRepository.create(
      data,
    );
    return this.oppoCriteriaEvalSummaryRepository.save(
      oppoCriteriaEvalSummaryCreated,
    );
  }

  /**
   * Add opportunities's criteria wise evaluation summaries.
   * @param data Summary data.
   * @returns Addedd summary object.
   */
  async addOppoCriteriaEvalSummaries(
    data: DeepPartial<OppoCriteriaEvalSummaryEntity>[],
  ): Promise<OppoCriteriaEvalSummaryEntity[]> {
    const oppoCriteriaEvalSummaryCreated = this.oppoCriteriaEvalSummaryRepository.create(
      data,
    );
    return this.oppoCriteriaEvalSummaryRepository.save(
      oppoCriteriaEvalSummaryCreated,
    );
  }

  /**
   * Update opportunities' criteria wise evaluation summary/summaries.
   * @param options Options to find evaluation Summary/Summaries.
   * @param data Updated data.
   * @returns Update status result.
   */
  async updateOppoCriteriaEvalSummary(
    options: FindConditions<OppoCriteriaEvalSummaryEntity>,
    data: QueryDeepPartialEntity<OppoCriteriaEvalSummaryEntity>,
  ): Promise<UpdateResult> {
    return this.oppoCriteriaEvalSummaryRepository.update(options, data);
  }

  /**
   * Permanently delete an opportunity's criteria wise evaluation summary.
   * @param options Options to find evaluation Summary/Summaries.
   * @returns Deletion status result.
   */
  async deleteOppoCriteriaEvalSummary(
    options: FindConditions<OppoCriteriaEvalSummaryEntity>,
  ): Promise<DeleteResult> {
    return this.oppoCriteriaEvalSummaryRepository.delete(options);
  }

  /**
   * Saves an opportunity's criteria-wise evaluation summary. Adds a new row
   * if not already present, otherwise updates the existing data.
   *
   * @param options Options to search summary on.
   * @param data Data to add/update.
   * @returns Update result or the new object added.
   */
  async saveOppoCriteriaEvalSummary(
    options: FindConditions<OppoCriteriaEvalSummaryEntity>,
    data: DeepPartial<OppoCriteriaEvalSummaryEntity>,
  ): Promise<UpdateResult | OppoCriteriaEvalSummaryEntity> {
    const updateRes = await this.updateOppoCriteriaEvalSummary(options, data);
    if (!updateRes.affected) {
      return this.addOppoCriteriaEvalSummary(data);
    }
    return updateRes;
  }

  /**
   * Saves opportunities' criteria-wise evaluation summaries. Adds new rows
   * if not already present, otherwise updates the existing data.
   *
   * @param options Options to search summary on.
   * @param data Data to add/update.
   * @returns Update result or the new object added.
   */
  async saveCriteriaEvalSummaries(
    options: FindManyOptions<OppoCriteriaEvalSummaryEntity>,
    data: DeepPartial<OppoCriteriaEvalSummaryEntity>[],
  ): Promise<OppoCriteriaEvalSummaryEntity[]> {
    const existingSum = await this.getOppoCriteriaEvalSummaries(options);
    const existingSumGrouped = keyBy(
      existingSum,
      sum =>
        `${sum.opportunityId}-${sum.criteriaId}-${sum.entityObjectId}-${sum.entityTypeId}-${sum.communityId}`,
    );

    data.forEach(sum => {
      const exist = get(
        existingSumGrouped,
        `${sum.opportunityId}-${sum.criteriaId}-${sum.entityObjectId}-${sum.entityTypeId}-${sum.communityId}`,
      );
      if (exist) {
        sum.id = exist.id;
      }
    });

    return this.oppoCriteriaEvalSummaryRepository.save(data);
  }
}
