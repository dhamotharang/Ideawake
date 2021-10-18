import { Injectable } from '@nestjs/common';
import { OpportunityEvaluationResponseRepository } from './opportunityEvaluationResponse.repository';
import { OpportunityEvaluationResponseEntity } from './opportunityEvaluationResponse.entity';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { ActionItemLogStatusEnum } from '../../enum';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import {
  ENTITY_TYPES,
  EVALUATION_TYPE_ABBREVIATIONS,
  NORMALIZED_TOTAL_CRITERIA_SCORE,
} from '../../common/constants/constants';
import {
  countBy,
  find,
  forEach,
  get,
  groupBy,
  head,
  keyBy,
  map,
  maxBy,
  meanBy,
  minBy,
} from 'lodash';
import { CriteriaScoreInterface } from './interface/criteriaScore.interface';
import { NumberCriteriaConfigInterface } from './interface/numberCriteriaConfig.interface';
import { QuestionCriteriaConfigInterface } from './interface/questionCriteriaConfig.interface';
import { In } from 'typeorm';
import { UtilsService } from '../../providers/utils.service';

@Injectable()
export class OpportunityEvaluationResponseService {
  constructor(
    public readonly opportunityEvaluationResponseRepository: OpportunityEvaluationResponseRepository,
  ) {}

  /**
   * Get opportunityEvaluationResponses
   */
  async getOpportunityEvaluationResponses(options: {}): Promise<
    OpportunityEvaluationResponseEntity[]
  > {
    return this.opportunityEvaluationResponseRepository.find(options);
  }

  /**
   * Get evaluation responses with count.
   */
  async getOppoEvalRespWithCount(options: {}): Promise<
    [OpportunityEvaluationResponseEntity[], number]
  > {
    return this.opportunityEvaluationResponseRepository.findAndCount(options);
  }

  async getPaginatedEvalResponses(options: {
    where: {};
    relations?: string[];
    take?: number;
    skip?: number;
  }): Promise<{
    responses: OpportunityEvaluationResponseEntity[];
    totalRespondents: number;
  }> {
    // Fetching unique respondents' ids in the given range.
    const query = this.opportunityEvaluationResponseRepository
      .createQueryBuilder('resp')
      .select('DISTINCT user.id', 'userid')
      .innerJoin('resp.user', 'user')
      .where(options.where)
      .orderBy('user.id', 'ASC');

    if (options.take) {
      query.limit(options.take).offset(options.skip || 0);
    }

    const rawIds = await query.getRawMany();
    const userIds = rawIds.map(user => user.userid);

    // Fetching total respondents count.
    const totalCount = await this.opportunityEvaluationResponseRepository
      .createQueryBuilder('resp')
      .select('COUNT(DISTINCT user.id)', 'count')
      .innerJoin('resp.user', 'user')
      .where(options.where)
      .getRawOne();

    // Fetching responses against the respondents found.
    let responses = [];
    if (userIds.length) {
      responses = await this.opportunityEvaluationResponseRepository.find({
        where: { ...options.where, user: In(userIds) },
        ...(options.relations && { relations: options.relations }),
      });
    }

    return {
      responses,
      totalRespondents: parseInt(get(totalCount, 'count', 0)),
    };
  }

  /**
   * Add opportunityEvaluationResponse
   */
  async addOpportunityEvaluationResponse(data: {}): Promise<
    OpportunityEvaluationResponseEntity
  > {
    const opportunityEvaluationResponseCreated = this.opportunityEvaluationResponseRepository.create(
      data,
    );
    return this.opportunityEvaluationResponseRepository.save(
      opportunityEvaluationResponseCreated,
    );
  }

  /**
   * Update or Add Opportunity Evaluation Response
   */
  async addOrUpdateOppEvaluationResponse(
    options: {
      opportunity: number;
      user: number;
      entityObjectId: number;
      entityType: number;
      community: number;
    },
    respData: Array<{
      id: number;
      evaluationCriteria: number;
      criteriaRespData: {};
    }>,
  ): Promise<{}> {
    const addUpdateArray = [];

    for (const resp of respData) {
      if (resp.id) {
        addUpdateArray.push(
          this.updateOpportunityEvaluationResponse({ id: resp.id }, resp),
        );
      } else {
        addUpdateArray.push(
          this.addOpportunityEvaluationResponse({
            ...resp,
            opportunity: options.opportunity,
            entityType: options.entityType,
            entityObjectId: options.entityObjectId,
            user: options.user,
            community: options.community,
          }),
        );
      }
    }

    const result = await Promise.all(addUpdateArray);

    // Update action item status to Completed.
    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );
    NotificationHookService.updateActionItemLogStatus(
      {
        userId: options.user,
        community: options.community,
        entityObjectId: options.opportunity,
        entityTypeId: oppoEntityType.id,
        status: ActionItemLogStatusEnum.OPEN,
      },
      { status: ActionItemLogStatusEnum.COMPLETE },
    );

    // Mark stage reminder emails as completed.
    NotificationHookService.updateStageEmailSetting({
      updateCondition: {
        userId: options.user,
        community: options.community,
        stageId: options.entityObjectId,
        entityObjectId: options.opportunity,
        entityType: oppoEntityType.id,
      },
      dataToUpdate: { isCompleted: 1 },
    });

    return result;
  }

  /**
   * Update opportunityEvaluationResponse
   */
  async updateOpportunityEvaluationResponse(
    options: {},
    data: {},
  ): Promise<{}> {
    return this.opportunityEvaluationResponseRepository.update(options, data);
  }

  /**
   * Delete opportunityEvaluationResponse
   */
  async deleteOpportunityEvaluationResponse(options: {}): Promise<{}> {
    return this.opportunityEvaluationResponseRepository.delete(options);
  }

  /**
   * Get latest entities' criteria responses against given opportunities.
   * Note: This only works for response accross same entity type.
   * @param options Search options.
   * @returns Latest criteria responses for the given opportunities.
   */
  async getLatestCriteriaResponses(options: {
    opportunityIds: number[];
    communityId: number;
    entityTypeId: number;
  }): Promise<OpportunityEvaluationResponseEntity[]> {
    const responses = await this.getOpportunityEvaluationResponses({
      where: {
        community: options.communityId,
        opportunity: In(options.opportunityIds),
        entityType: options.entityTypeId,
      },
      order: { id: 'DESC' },
    });
    const respByOppos = groupBy(responses, 'opportunityId');

    const latestResps = [];
    const oppoCriteriaStage = {};

    forEach(respByOppos, (responses, oppoId) => {
      oppoCriteriaStage[oppoId] = {};
      forEach(responses, resp => {
        if (!oppoCriteriaStage[oppoId][resp.evaluationCriteriaId]) {
          oppoCriteriaStage[oppoId][resp.evaluationCriteriaId] =
            resp.entityObjectId;
          latestResps.push(resp);
        } else if (
          oppoCriteriaStage[oppoId][resp.evaluationCriteriaId] ===
          resp.entityObjectId
        ) {
          latestResps.push(resp);
        }
      });
    });

    return latestResps;
  }

  /**
   * Calculates the criteria scores against the given responses.
   * @param criteriaResponses Opportunity criteria responses.
   * @returns Scores against each criteria.
   */
  getCriteriaResponseScores(
    criteriaResponses: OpportunityEvaluationResponseEntity[],
  ): Array<CriteriaScoreInterface> {
    const respByCriteria = groupBy(criteriaResponses, 'evaluationCriteriaId');

    const criteriaScores = map(respByCriteria, responses => {
      const evalCriteria = head(responses).evaluationCriteria;

      const score = {
        criteria: evalCriteria,
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
        variance: 0,
        avgNormalizedScore: 0,
        rawNormalizedScore: 0,
        totalNormalizedScore: NORMALIZED_TOTAL_CRITERIA_SCORE,
        totalResponses: responses.length,
      };

      if (
        evalCriteria.evaluationType.abbreviation ==
        EVALUATION_TYPE_ABBREVIATIONS.NUMBER
      ) {
        // In case of number type criteria.
        const criteriaConfig = evalCriteria.criteriaObject as NumberCriteriaConfigInterface;
        score.maxScore = criteriaConfig.maxValue;
        score.minScore = criteriaConfig.minValue;

        const avgScore = responses.length
          ? meanBy(responses, 'criteriaRespData.selected')
          : criteriaConfig.higherBest
          ? 0
          : score.maxScore;

        // Normalizing numerical score.
        score.rawNormalizedScore =
          (criteriaConfig.higherBest ? avgScore : score.maxScore - avgScore) /
          score.maxScore;

        score.avgScore = responses.length ? avgScore : 0;

        // Calculating variance.
        const respNormalizedScores = responses.map(resp => {
          const selected = get(
            resp,
            'criteriaRespData.selected',
            score.minScore,
          );
          return (selected / score.maxScore) * score.totalNormalizedScore;
        });
        score.variance = UtilsService.variance(respNormalizedScores);
      } else {
        // In case of question type criteria.
        const criteriaConfig = evalCriteria.criteriaObject as QuestionCriteriaConfigInterface;
        score.maxScore = maxBy(criteriaConfig.data, 'value').value;
        score.minScore = minBy(criteriaConfig.data, 'value').value;
        score.avgScore = responses.length
          ? meanBy(responses, resp =>
              get(
                find(criteriaConfig.data, [
                  'key',
                  get(resp.criteriaRespData, 'selected', ''),
                ]),
                'value',
                score.minScore,
              ),
            )
          : 0;

        // Finding most selected response.
        if (responses.length) {
          score['responseDistribution'] = countBy(
            responses,
            'criteriaRespData.selected',
          );
        }

        // Normalizing question score.
        score.rawNormalizedScore = score.avgScore / score.maxScore;

        // Calculating variance.
        const possibleOpts = keyBy(criteriaConfig.data, 'key');
        const respNormalizedScores = responses.map(resp => {
          const selected = get(resp, 'criteriaRespData.selected');
          const selectedVal = get(
            possibleOpts,
            `${selected}.value`,
            score.minScore,
          ) as number;
          return (selectedVal / score.maxScore) * score.totalNormalizedScore;
        });
        score.variance = UtilsService.variance(respNormalizedScores);
      }

      score.avgNormalizedScore =
        score.rawNormalizedScore * score.totalNormalizedScore;
      return score;
    });

    return criteriaScores;
  }

  /**
   * Get entities' criteria responses against given opportunities and criterias in bulk.
   * Average score across all stages
   */
  async getBulkCriteriaResponses(options: {
    opportunityIds: number[];
    communityId: number;
    entityTypeId: number;
    criteriaIds: number[];
  }): Promise<OpportunityEvaluationResponseEntity[]> {
    const responses = await this.getOpportunityEvaluationResponses({
      where: {
        community: options.communityId,
        opportunity: In(options.opportunityIds),
        entityType: options.entityTypeId,
        evaluationCriteria: In(options.criteriaIds),
      },
      order: { id: 'DESC' },
    });

    return responses;
  }
}
