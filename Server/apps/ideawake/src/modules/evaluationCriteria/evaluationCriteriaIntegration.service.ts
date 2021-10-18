import { Injectable } from '@nestjs/common';
import { EvaluationCriteriaIntegrationRepository } from './evaluationCriteriaIntegration.repository';
import { EvaluationCriteriaIntegrationEntity } from './evaluationCriteriaIntegration.entity';
import { orderBy } from 'lodash';

@Injectable()
export class EvaluationCriteriaIntegrationService {
  constructor(
    public readonly evaluationCriteriaIntegrationRepository: EvaluationCriteriaIntegrationRepository,
  ) {}

  /**
   * Get evaluationCriteria
   */
  async getEvaluationCriteriaIntegrations(options: {}): Promise<
    EvaluationCriteriaIntegrationEntity[]
  > {
    return this.evaluationCriteriaIntegrationRepository.find(options);
  }

  /**
   * Get EvaluationCriteriaIntegrations with filters.
   */
  async getEvaluationIntegrationsWithFilters(options: {
    entityObjectId: number; // will be 'stage id', etc.
    entityType: number;
    opportunity: number;
    community?: number;
    user?: number;
    checkOpportunity?: boolean;
    includeResponses?: boolean;
    includeUser?: boolean;
    excludeCriteriaIds?: Array<number>;
  }): Promise<EvaluationCriteriaIntegrationEntity[]> {
    const query = this.evaluationCriteriaIntegrationRepository
      .createQueryBuilder('eval_integ')
      .leftJoinAndSelect('eval_integ.evaluationCriteria', 'criteria')
      .leftJoinAndSelect('criteria.evaluationType', 'evaluationType');

    if (options.includeResponses) {
      query.leftJoinAndSelect(
        'criteria.oppEvaluationResponse',
        'oppEvaluationResponse',
      );
    }

    if (options.includeUser) {
      query.leftJoinAndSelect('oppEvaluationResponse.user', 'user');
    }

    query
      .where('eval_integ.entityObjectId = :entityObjectId', {
        entityObjectId: options.entityObjectId,
      })
      .andWhere('eval_integ.entityType = :entityType', {
        entityType: options.entityType,
      });

    if (options.community) {
      query.andWhere('eval_integ.community = :community', {
        community: options.community,
      });
    }

    if (options.excludeCriteriaIds && options.excludeCriteriaIds.length) {
      query.andWhere(`eval_integ.evaluationCriteria NOT IN (:...criteriaIds)`, {
        criteriaIds: options.excludeCriteriaIds,
      });
    }

    if (options.includeResponses && options.checkOpportunity) {
      query
        .andWhere(`oppEvaluationResponse.opportunity = :opportunity`, {
          opportunity: options.opportunity,
        })
        .andWhere(`oppEvaluationResponse.entityObjectId = :entityObjectId`, {
          entityObjectId: options.entityObjectId,
        })
        .andWhere(`oppEvaluationResponse.entityType = :entityType`, {
          entityType: options.entityType,
        });
    }

    if (options.includeResponses && options.user) {
      query.andWhere(`oppEvaluationResponse.user = :user`, {
        user: options.user,
      });
    }

    return query.getMany();
  }

  /**
   * Get evaluation criteria entity integration with responses.
   * @param options Options to search for evalution integratios.
   */
  async getEvaluationIntegrationWithResponses(options: {
    entityObjectId: number; // will be 'stage id', etc.
    entityType: number;
    opportunity: number;
    community?: number;
  }): Promise<EvaluationCriteriaIntegrationEntity[]> {
    const integrationsWithData = await this.getEvaluationIntegrationsWithFilters(
      {
        ...options,
        checkOpportunity: true,
        includeResponses: true,
      },
    );

    const excludeCriteriaIds = integrationsWithData.map(
      integration => integration.evaluationCriteriaId,
    );

    const integrationsWithoutData = await this.getEvaluationIntegrationsWithFilters(
      {
        ...options,
        ...(excludeCriteriaIds.length && { excludeCriteriaIds }),
        includeResponses: false,
        checkOpportunity: false,
      },
    );

    const integrationsData = [
      ...integrationsWithData,
      ...integrationsWithoutData,
    ];

    return orderBy(integrationsData, 'order', 'asc');
  }

  /**
   * Add evaluationCriteria
   */
  async addEvaluationCriteriaIntegration(data: {}): Promise<
    EvaluationCriteriaIntegrationEntity
  > {
    const evaluationCriteriaIntegrationCreated = this.evaluationCriteriaIntegrationRepository.create(
      data,
    );
    return this.evaluationCriteriaIntegrationRepository.save(
      evaluationCriteriaIntegrationCreated,
    );
  }

  /**
   * Update evaluationCriteria
   */
  async updateEvaluationCriteriaIntegration(
    options: {},
    data: {},
  ): Promise<{}> {
    return this.evaluationCriteriaIntegrationRepository.update(options, data);
  }

  /**
   * Delete evaluationCriteria
   */
  async deleteEvaluationCriteriaIntegration(options: {}): Promise<{}> {
    return this.evaluationCriteriaIntegrationRepository.delete(options);
  }
}
