import { Injectable } from '@nestjs/common';
import { OpportunityDraftRepository } from './opportunityDraft.repository';
import { OpportunityDraftEntity } from './opportunityDraft.entity';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class OpportunityDraftService {
  constructor(
    public readonly opportunityDraftRepository: OpportunityDraftRepository,
  ) {}

  /**
   * Get opportunity drafts.
   * @param options Options to find drafts on.
   * @returns Drafts found.
   */
  async getOpportunityDrafts(
    options: FindManyOptions<OpportunityDraftEntity>,
  ): Promise<[OpportunityDraftEntity[], number]> {
    return this.opportunityDraftRepository.findAndCount(options);
  }

  /**
   * Get opportunity drafts count.
   * @param options Options to find drafts on.
   * @returns Drafts count.
   */
  async getOpportunityDraftsCount(
    options: FindManyOptions<OpportunityDraftEntity>,
  ): Promise<number> {
    return this.opportunityDraftRepository.count(options);
  }

  /**
   * Get a single opportunity draft.
   * @param options Options to find draft on.
   * @returns Draft found.
   */
  async getOpportunityDraft(
    options: FindOneOptions<OpportunityDraftEntity>,
  ): Promise<OpportunityDraftEntity> {
    return this.opportunityDraftRepository.findOne(options);
  }

  /**
   * Add an opportunity's draft.
   * @param data Data to add.
   * @returns Draft object.
   */
  async addOpportunityDraft(
    data: DeepPartial<OpportunityDraftEntity>,
  ): Promise<OpportunityDraftEntity> {
    const opportunityDraftCreated = this.opportunityDraftRepository.create(
      data,
    );
    return this.opportunityDraftRepository.save(opportunityDraftCreated);
  }

  /**
   * Update opportunity's draft(s).
   * @param options Options to search draft(s)
   * @param data Data to update.
   * @returns Update status and result.
   */
  async updateOpportunityDraft(
    options: FindConditions<OpportunityDraftEntity>,
    data: QueryDeepPartialEntity<OpportunityDraftEntity>,
  ): Promise<{}> {
    return this.opportunityDraftRepository.update(options, data);
  }

  /**
   * Permanently delete an opportunity's draft(s).
   * @param options Options to search the draft(s).
   * @returns Deletion result and status.
   */
  async deleteOpportunityDraft(
    options: FindConditions<OpportunityDraftEntity>,
  ): Promise<DeleteResult> {
    return this.opportunityDraftRepository.delete(options);
  }
}
