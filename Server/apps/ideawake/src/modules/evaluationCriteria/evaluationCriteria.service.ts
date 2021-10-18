import { Injectable } from '@nestjs/common';
import { EvaluationCriteriaRepository } from './evaluationCriteria.repository';
import { EvaluationCriteriaEntity } from './evaluationCriteria.entity';
import { EvaluationCriteriaIntegrationEntity } from './evaluationCriteriaIntegration.entity';
import {
  EVALUATION_TYPE_ABBREVIATIONS,
  NORMALIZED_TOTAL_CRITERIA_SCORE,
  NORMALIZED_TOTAL_ENTITY_SCORE,
  ACTION_ITEM_ABBREVIATIONS,
  ENTITY_TYPES,
} from '../../common/constants/constants';
import { NumberCriteriaConfigInterface } from './interface/numberCriteriaConfig.interface';
import { QuestionCriteriaConfigInterface } from './interface/questionCriteriaConfig.interface';
import {
  find,
  minBy,
  maxBy,
  get,
  meanBy,
  countBy,
  sumBy,
  groupBy,
  flatten,
  head,
  map,
  chain,
  keyBy,
  uniqBy,
  compact,
} from 'lodash';
import { CriteriaScoreInterface } from './interface/criteriaScore.interface';
import { EvaluationCriteriaIntegrationService } from './evaluationCriteriaIntegration.service';
import { EntityScoreInterface } from './interface/entityScore.interface';
import { StageHistoryService } from '../stage/stageHistory.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { OpportunityEvaluationResponseEntity } from './opportunityEvaluationResponse.entity';
import { UtilsService } from '../../providers/utils.service';
import { OpportunityEvaluationResponseService } from './opportunityEvaluationResponse.service';
import { In } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class EvaluationCriteriaService {
  constructor(
    public readonly evaluationCriteriaRepository: EvaluationCriteriaRepository,
    private readonly evaluationCriteriaIntegrationService: EvaluationCriteriaIntegrationService,
    private readonly stageHistoryService: StageHistoryService,
    private readonly oppoEvalResponseService: OpportunityEvaluationResponseService,
  ) {}

  /**
   * Get evaluationCriterias
   */
  async getEvaluationCriterias(options: {}): Promise<
    EvaluationCriteriaEntity[]
  > {
    return this.evaluationCriteriaRepository.find(options);
  }

  /**
   * Add evaluationCriteria
   */
  async addEvaluationCriteria(data: {}): Promise<EvaluationCriteriaEntity> {
    const evaluationCriteriaCreated = this.evaluationCriteriaRepository.create(
      data,
    );
    return this.evaluationCriteriaRepository.save(evaluationCriteriaCreated);
  }

  /**
   * Update evaluationCriteria
   */
  async updateEvaluationCriteria(options: {}, data: {}): Promise<{}> {
    return this.evaluationCriteriaRepository.update(options, data);
  }

  /**
   * Archive evaluation criteria.
   */
  async archiveEvaluationCriteria(options: {}): Promise<{}> {
    return this.updateEvaluationCriteria(options, { isDeleted: true });
  }

  /**
   * Calculate Opportunity evaluation score across all attached stages.
   * @param params Opportunity find options for which to calculate the score.
   */
  async getOpportunityEvaluationScore(params: {
    opportunity: number;
    community?: number;
    returnOpportunityId?: boolean;
  }): Promise<{}> {
    // Get opportunity stage history to get all attached stages with the opportunity.
    const stagesHist = await this.stageHistoryService.getStageHistory({
      where: params,
      relations: ['stage', 'stage.actionItem'],
    });

    // Get unique evalutation stages for the given opportunity.
    const evaluationStages = chain(stagesHist)
      .filter(
        hist =>
          get(hist, 'stage.actionItem.abbreviation') ===
          ACTION_ITEM_ABBREVIATIONS.SCORECARD,
      )
      .uniqBy(hist => hist.stageId)
      .value();

    const opportunityScore = {
      totalScore: NORMALIZED_TOTAL_ENTITY_SCORE,
    };

    if (evaluationStages && evaluationStages.length) {
      const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.STAGE,
      );

      // Get all stages scores.
      const stageScores = await Promise.all(
        evaluationStages.map(evalStage =>
          this.getEvaluationsEntityScores({
            entityObjectId: evalStage.stage.id,
            entityType: stageEntityType.id,
            opportunity: params.opportunity,
            community: params.community,
          }),
        ),
      );

      // Get criteria used in all stages and their usage counts.
      const criteriaScores = flatten(
        stageScores.map(score => score.criteriaScores),
      );
      const criteria = criteriaScores.map(critScore => critScore.criteria);
      const criteriaCount = countBy(criteria, 'id');

      let sumCriteriaScore = 0;
      let totalWeights = 0;

      for (const score of criteriaScores) {
        // Scores summed up by mutiplying each with it's weight and adding to the
        // total sum. If a criteria is used more than once, then we calculate its
        // weight by the formula: weight / # times used
        sumCriteriaScore +=
          score.rawNormalizedScore *
          (score.criteria.criteriaWeight / criteriaCount[score.criteria.id]);

        // Sum up total weights.
        totalWeights +=
          score.criteria.criteriaWeight / criteriaCount[score.criteria.id];
      }

      // Normalized score is calculated by dividing the summed score by total wights.
      const rawNormalizedScore = sumCriteriaScore / totalWeights;

      // Final score is normalized from the raw range interval [0, 1] to [0, x].
      // x is given by the constant NORMALIZED_TOTAL_ENTITY_SCORE and defaults
      // to 100.
      opportunityScore['rawNormalizedScore'] = rawNormalizedScore;
      opportunityScore['finalScore'] =
        rawNormalizedScore * NORMALIZED_TOTAL_ENTITY_SCORE;
    }
    if (params.returnOpportunityId) {
      return { opportunityId: params.opportunity, opportunityScore };
    }

    return opportunityScore;
  }

  /**
   * Calculate Entity scores on integrated criteria.
   * @param params Integrated criteria on which to calculate response scores.
   */
  async getEvaluationsEntityScores(params: {
    entityObjectId: number;
    entityType: number;
    opportunity: number;
    community?: number;
    returnOpportunityId?: boolean;
  }): Promise<EntityScoreInterface> {
    // Get criteria with responses.
    const criteria = await this.evaluationCriteriaIntegrationService.getEvaluationIntegrationWithResponses(
      params,
    );

    // Calculate criteria scores.
    const criteriaScores = this.getEvaluationsResponseScores({ criteria });

    // Calculate opportunity score by entity.
    const sumCriteriaScore = sumBy(
      criteriaScores,
      score => score.rawNormalizedScore * score.criteria.criteriaWeight,
    );
    const totalWeights = sumBy(criteriaScores, 'criteria.criteriaWeight');

    const rawNormalizedScore = sumCriteriaScore / totalWeights;

    const entityScore = {
      rawNormalizedScore,
      finalScore: rawNormalizedScore * NORMALIZED_TOTAL_ENTITY_SCORE,
      totalNormalizedScore: NORMALIZED_TOTAL_ENTITY_SCORE,
    };

    return {
      criteriaScores,
      entityScore,
      ...(params.returnOpportunityId && { opportunityId: params.opportunity }),
    };
  }

  /**
   * Calculate response scores on integrated criteria.
   * @param params Integrated criteria on which to calculate response scores.
   */
  getEvaluationsResponseScores(params: {
    criteria: EvaluationCriteriaIntegrationEntity[];
  }): Array<CriteriaScoreInterface> {
    const criteriaScores = params.criteria.map(integCriteria => {
      const evalCriteria = integCriteria.evaluationCriteria;
      const responses = evalCriteria.oppEvaluationResponse || [];

      // Removing responses to reduce object size.
      delete evalCriteria.oppEvaluationResponse;

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

  getAvgCriteriaScores(params: {
    responses: OpportunityEvaluationResponseEntity[];
    includeRespDistribution?: boolean;
  }): Array<CriteriaScoreInterface> {
    const responsesGrouped = groupBy(params.responses, 'evaluationCriteriaId');

    return map(responsesGrouped, responses => {
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

        // Finding getting reqponses disctirbution.
        if (responses.length && params.includeRespDistribution) {
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
  }

  /**
   * Calculate response scores on integrated criteria.
   * @param params Integrated criteria on which to calculate response scores.
   */
  getCriteriaResponseScores(
    responses: OpportunityEvaluationResponseEntity[],
  ): {
    responses: OpportunityEvaluationResponseEntity[];
    userScores: { user: UserEntity; totalScore: number }[];
  } {
    const userScores = [];
    let users = [];
    responses.forEach(resp => {
      const evalCriteria = resp.evaluationCriteria;
      if (
        evalCriteria.evaluationType.abbreviation ==
        EVALUATION_TYPE_ABBREVIATIONS.NUMBER
      ) {
        // In case of number type criteria.
        const criteriaConfig = evalCriteria.criteriaObject as NumberCriteriaConfigInterface;
        const maxScore = criteriaConfig.maxValue;
        // const minScore = criteriaConfig.minValue;
        const selected = resp.criteriaRespData['selected'];
        // Normalizing numerical score.
        const normalizedScore =
          ((criteriaConfig.higherBest ? selected : maxScore - selected) /
            maxScore) *
          NORMALIZED_TOTAL_CRITERIA_SCORE;
        resp['normalizedScore'] = normalizedScore;
        resp['selectedResponse'] = selected;
        userScores.push({
          userId: resp.userId,
          normalizedScore: normalizedScore,
          criteriaWeight: evalCriteria.criteriaWeight,
        });
      } else {
        // In case of question type criteria.
        const criteriaConfig = evalCriteria.criteriaObject as QuestionCriteriaConfigInterface;
        const maxScore = maxBy(criteriaConfig.data);
        const selected = resp.criteriaRespData['selected'];
        const selectedResponse = find(criteriaConfig.data, ['key', selected]);
        resp['normalizedScore'] = selectedResponse
          ? (selectedResponse.value / maxScore.value) *
            NORMALIZED_TOTAL_CRITERIA_SCORE
          : 0;
        resp['selectedResponse'] = get(selectedResponse, 'label');
        userScores.push({
          userId: resp.userId,
          normalizedScore: selectedResponse
            ? (selectedResponse.value / maxScore.value) *
              NORMALIZED_TOTAL_CRITERIA_SCORE
            : 0,
          criteriaWeight: evalCriteria.criteriaWeight,
        });
      }
      users.push(resp.user);
      delete resp.user;
    });

    const usersFinalScores = [];
    if (users.length) {
      users = compact(uniqBy(users, 'id'));
      const groupedUserScores = groupBy(userScores, 'userId');

      flatten(
        users.map(user => {
          const specificUserScores = get(groupedUserScores, user.id);
          const sumCriteriaScore = sumBy(
            specificUserScores,
            score => score.normalizedScore * score.criteriaWeight,
          );
          const totalWeights = sumBy(specificUserScores, 'criteriaWeight');
          usersFinalScores.push({
            user: user,
            totalScore: sumCriteriaScore / totalWeights,
          });
        }),
      );
    }
    return { responses, userScores: usersFinalScores };
  }

  async getEntityEvalResponses(params: {
    entityObjectId: number;
    entityType: number;
    opportunity: number;
    community: number;
    take?: number;
    skip?: number;
  }): Promise<{}> {
    const integCriteria = await this.evaluationCriteriaIntegrationService.getEvaluationCriteriaIntegrations(
      {
        where: {
          entityObjectId: params.entityObjectId,
          entityType: params.entityType,
          community: params.community,
        },
        order: { order: 'ASC' },
        relations: ['evaluationCriteria', 'evaluationCriteria.evaluationType'],
      },
    );

    let respWithScores = {
      responses: [],
      userScores: [],
      ...(!params.skip && { integCriteria }),
    };
    if (integCriteria.length) {
      const resp = await this.oppoEvalResponseService.getPaginatedEvalResponses(
        {
          where: {
            evaluationCriteria: In(
              integCriteria.map(integ => integ.evaluationCriteriaId),
            ),
            opportunity: params.opportunity,
            entityObjectId: params.entityObjectId,
            entityType: params.entityType,
            community: params.community,
          },
          relations: [
            'user',
            'user.profileImage',
            'evaluationCriteria',
            'evaluationCriteria.evaluationType',
          ],
          ...(params.take && { take: params.take, skip: params.skip || 0 }),
        },
      );
      respWithScores['totalRespondents'] = resp.totalRespondents;

      // Calculating user scores.
      if (get(resp.responses, 'length')) {
        respWithScores = {
          ...respWithScores,
          ...this.getCriteriaResponseScores(resp.responses),
        };
      }
    }

    return respWithScores;
  }
}
