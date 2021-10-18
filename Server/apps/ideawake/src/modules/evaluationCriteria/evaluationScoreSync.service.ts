import { Injectable, Logger } from '@nestjs/common';
import { OppoEvaluationSummaryEntity } from './oppoEvaluationSummary.entity';
import { In, UpdateResult } from 'typeorm';
import { EvaluationCriteriaService } from './evaluationCriteria.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { cloneDeep, get, head, keyBy, uniq, uniqBy } from 'lodash';
import {
  ACTION_ITEM_ABBREVIATIONS,
  ENTITY_TYPES,
} from '../../common/constants/constants';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { StageHistoryService } from '../stage/stageHistory.service';
import { EvaluationCriteriaIntegrationService } from './evaluationCriteriaIntegration.service';
import { OppoCriteriaEvalSummaryService } from './oppoCriteriaEvalSummary.service';
import { OppoEvaluationSummaryService } from './oppoEvaluationSummary.service';

@Injectable()
export class EvaluationScoreSyncService {
  constructor(
    public readonly evaluationCriteriaService: EvaluationCriteriaService,
    public readonly opportunityService: OpportunityService,
    public readonly stageHistoryService: StageHistoryService,
    public readonly criteriaIntegrationService: EvaluationCriteriaIntegrationService,
    public readonly oppoEvalSummaryService: OppoEvaluationSummaryService,
    public readonly oppoCritEvalSummaryService: OppoCriteriaEvalSummaryService,
  ) {}

  /**
   * Sync opportunity's evaluation summary.
   * @param options Opportunity and evalutaion integration data.
   * @returns Added evaluation summary or the update result.
   */
  async syncEvalSummary(options: {
    opportunityId: number;
    entityObjectId: number;
    entityTypeId: number;
    communityId: number;
    syncAssignee?: boolean;
    syncCompletion?: boolean;
  }): Promise<UpdateResult | OppoEvaluationSummaryEntity> {
    // TODO: Optimize score calculation.
    // Fetch score, assignee and completion settings.
    const [stageScore, completion, assigneeSetting] = await Promise.all([
      this.evaluationCriteriaService.getEvaluationsEntityScores({
        community: options.communityId,
        entityObjectId: options.entityObjectId,
        entityType: options.entityTypeId,
        opportunity: options.opportunityId,
      }),
      options.syncCompletion
        ? this.opportunityService.stageCompletionStats({
            opportunityId: options.opportunityId,
            communityId: options.communityId,
          })
        : Promise.resolve(undefined),
      options.syncAssignee
        ? this.opportunityService.getAssigneeBulkTexts({
            opportunityIds: [options.opportunityId],
            communityId: options.communityId,
            includeRawSetting: true,
          })
        : Promise.resolve(undefined),
      ,
    ]);
    const oppoAssignee = head(assigneeSetting);

    // Sync criteria wise summary.
    const criteriaSummaries = stageScore.criteriaScores.map(scoreDetail => {
      const clonedDetail = cloneDeep(scoreDetail);
      delete clonedDetail.criteria;
      delete clonedDetail.responseDistribution;

      return {
        avgScore: scoreDetail.avgScore,
        avgNormalizedScore: scoreDetail.avgNormalizedScore || 0,
        scoreDetail: clonedDetail,
        variance: scoreDetail.variance,
        respDistribution: scoreDetail.responseDistribution,
        criteriaId: scoreDetail.criteria.id,
        opportunityId: options.opportunityId,
        entityObjectId: options.entityObjectId,
        entityTypeId: options.entityTypeId,
        communityId: options.communityId,
      };
    });

    if (get(criteriaSummaries, 'length')) {
      this.oppoCritEvalSummaryService.saveCriteriaEvalSummaries(
        {
          where: {
            criteriaId: In(criteriaSummaries.map(sum => sum.criteriaId)),
            opportunityId: options.opportunityId,
            entityObjectId: options.entityObjectId,
            entityTypeId: options.entityTypeId,
            communityId: options.communityId,
          },
        },
        criteriaSummaries,
      );
    }

    return this.oppoEvalSummaryService.saveOppoEvaluationSummary(
      {
        opportunityId: options.opportunityId,
        entityObjectId: options.entityObjectId,
        entityTypeId: options.entityTypeId,
        communityId: options.communityId,
      },
      {
        opportunityId: options.opportunityId,
        entityObjectId: options.entityObjectId,
        entityTypeId: options.entityTypeId,
        communityId: options.communityId,
        score: stageScore.entityScore.finalScore || 0,

        ...(options.syncAssignee && {
          assignees: {
            assigneeText: get(oppoAssignee, 'mergedText', ''),
            settings: get(oppoAssignee, 'rawSetting', {}),
            rawTexts: get(oppoAssignee, 'rawTexts', []),
          },
        }),

        ...(options.syncCompletion && {
          completionStats: {
            total: completion.total as number,
            completed: completion.completed as number,
          },
        }),
      },
    );
  }

  /**
   * Sync opportunity's evaluation summary on stage (config.) update.
   * @param options Stage data.
   * @returns Added evaluation summary or the update result.
   */
  async syncEvalSummaryOnStageUpdate(options: {
    stageId: number;
    communityId: number;
  }): Promise<void> {
    // Finding history for the required stage.
    let stageHistory = await this.stageHistoryService.getStageHistory({
      where: { stage: options.stageId, community: options.communityId },
    });

    // If stage hadn't been attached with any opportunity, do nothing.
    if (!stageHistory.length) return;

    // Getting unique stage history against opportunities.
    stageHistory = uniqBy(stageHistory, hist => hist.opportunityId);

    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    // TODO: Optimize score calculation and sync.
    // Syncing opportunites summaries.
    stageHistory.forEach(hist =>
      this.syncEvalSummary({
        opportunityId: hist.opportunityId,
        entityObjectId: options.stageId,
        entityTypeId: stageEntityType.id,
        communityId: options.communityId,
      }),
    );
  }

  /**
   * Sync opportunity's evaluation summary on criteria (config.) update.
   * @param options Stage data.
   * @returns Added evaluation summary or the update result.
   */
  async syncEvalSummaryOnCriteriaUpdate(options: {
    criteriaId: number;
    communityId: number;
  }): Promise<void> {
    // Finding stages where the criteria has been integrated with.
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    const criteriaIntegrations = await this.criteriaIntegrationService.getEvaluationCriteriaIntegrations(
      {
        where: {
          evaluationCriteria: options.criteriaId,
          entityType: stageEntityType,
          community: options.communityId,
        },
      },
    );

    // If criteria isn't integrated with anything, do nothing.
    if (!criteriaIntegrations.length) return;

    // Finding history for the said stages.
    let stageHistory = await this.stageHistoryService.getStageHistory({
      where: {
        stage: In(criteriaIntegrations.map(int => int.entityObjectId)),
        community: options.communityId,
      },
    });

    // If stage hadn't been attached with any opportunity, do nothing.
    if (!stageHistory.length) return;

    // Getting unique stage history against opportunities.
    stageHistory = uniqBy(
      stageHistory,
      hist => `${hist.opportunityId}-${hist.stageId}`,
    );

    // TODO: Optimize score calculation and sync.
    // Syncing opportunites summaries.
    stageHistory.forEach(hist =>
      this.syncEvalSummary({
        opportunityId: hist.opportunityId,
        entityObjectId: hist.stageId,
        entityTypeId: stageEntityType.id,
        communityId: options.communityId,
      }),
    );
  }

  async syncAllEvalSummaries(): Promise<void> {
    try {
      // Finding histories for all opportunities.
      let stageHistory = await this.stageHistoryService.getStageHistoryForStageTool(
        ACTION_ITEM_ABBREVIATIONS.SCORECARD,
        {},
      );

      // If stage hadn't been attached with any opportunity, do nothing.
      if (!stageHistory.length) return;

      // Getting unique stage history against opportunities.
      const oppoIds = uniq(stageHistory.map(hist => hist.opportunityId));
      stageHistory = uniqBy(
        stageHistory,
        hist => `${hist.opportunityId}-${hist.stageId}`,
      );

      const [stageEntityType, opportunities] = await Promise.all([
        EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
        this.opportunityService.getSimpleOpportunities({
          where: { id: In(oppoIds) },
        }),
      ]);
      const opposById = keyBy(opportunities, 'id');

      // TODO: Optimize score calculation and sync.

      // Syncing opportunites summaries.
      await Promise.all(
        stageHistory.map(hist =>
          this.syncEvalSummary({
            opportunityId: hist.opportunityId,
            entityObjectId: hist.stageId,
            entityTypeId: stageEntityType.id,
            communityId: hist.communityId,
            ...(get(opposById, `${hist.opportunityId}.stageId`, 0) ===
              hist.stageId && { syncAssignee: true, syncCompletion: true }),
          }),
        ),
      );
      Logger.error('SyncSuccess! Successfully synced evaluation summaries!');
    } catch (err) {
      Logger.error(
        'Error syncing evaluation summaries for all opportunities:',
        JSON.stringify(err),
      );
      Logger.error('RawError:', err);
    }
  }

  async syncCurrentStageScore(options: {
    opportunityId: number;
    communityId: number;
  }): Promise<{}> {
    const [opportunity, stageEntityType] = await Promise.all([
      this.opportunityService.getOneOpportunity({
        where: { id: options.opportunityId, communityId: options.communityId },
      }),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
    ]);

    // TODO: Optimize score calculation.
    // Calculate opportunity and stage scores.
    const [oppoScore, rawStageScore] = await Promise.all([
      this.evaluationCriteriaService.getOpportunityEvaluationScore({
        community: options.communityId,
        opportunity: options.opportunityId,
      }),
      this.evaluationCriteriaService.getEvaluationsEntityScores({
        community: options.communityId,
        entityObjectId: opportunity.stageId,
        entityType: stageEntityType.id,
        opportunity: opportunity.id,
      }),
    ]);

    const totalScore = get(oppoScore, 'finalScore');
    const stageScore = get(rawStageScore, 'entityScore.finalScore');

    await this.opportunityService.updateRawOpportunity(
      { id: options.opportunityId, communityId: options.communityId },
      {
        totalScore: totalScore || totalScore === 0 ? totalScore : null,
        currStageScore: stageScore || stageScore === 0 ? stageScore : null,
      },
    );

    return { totalScore: oppoScore, stageScore };
  }

  async syncScoresOnStageUpdate(options: {
    stageId: number;
    communityId: number;
  }): Promise<void> {
    // Finding history for the required stage.
    const stageHistory = await this.stageHistoryService.getStageHistory({
      where: { stage: options.stageId, community: options.communityId },
    });

    // If stage hadn't been attached with any opportunity, do nothing.
    if (!stageHistory.length) return;

    // Fetching opportunities for the found history.
    const [opportunities, stageEntityType] = await Promise.all([
      this.opportunityService.getSimpleOpportunities({
        where: {
          id: In(stageHistory.map(hist => hist.opportunityId)),
          communityId: options.communityId,
        },
      }),
      EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
    ]);

    // TODO: Optimize score calculation.
    // Calculating opportunity and stage scores.
    for (const opportunity of opportunities) {
      const [oppoScore, rawStageScore] = await Promise.all([
        this.evaluationCriteriaService.getOpportunityEvaluationScore({
          community: options.communityId,
          opportunity: opportunity.id,
        }),
        this.evaluationCriteriaService.getEvaluationsEntityScores({
          community: options.communityId,
          entityObjectId: opportunity.stageId,
          entityType: stageEntityType.id,
          opportunity: opportunity.id,
        }),
      ]);

      const totalScore = get(oppoScore, 'finalScore');
      const stageScore = get(rawStageScore, 'entityScore.finalScore');

      await this.opportunityService.updateRawOpportunity(
        { id: opportunity.id, communityId: options.communityId },
        {
          totalScore: totalScore || totalScore === 0 ? totalScore : null,
          currStageScore: stageScore || stageScore === 0 ? stageScore : null,
        },
      );
    }
  }

  async syncScoresOnCriteriaUpdate(options: {
    criteriaId: number;
    communityId: number;
  }): Promise<void> {
    // Finding stages where the criteria has been integrated with.
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );
    const criteriaIntegrations = await this.criteriaIntegrationService.getEvaluationCriteriaIntegrations(
      {
        where: {
          evaluationCriteria: options.criteriaId,
          entityType: stageEntityType,
          community: options.communityId,
        },
      },
    );

    // If criteria isn't integrated with anything, do nothing.
    if (!criteriaIntegrations.length) return;

    // Finding history for the said stages.
    const stageHistory = await this.stageHistoryService.getStageHistory({
      where: {
        stage: In(criteriaIntegrations.map(int => int.entityObjectId)),
        community: options.communityId,
      },
    });

    // If stage hadn't been attached with any opportunity, do nothing.
    if (!stageHistory.length) return;

    // Fetching opportunities for the found history.
    const opportunities = await this.opportunityService.getSimpleOpportunities({
      where: {
        id: In(stageHistory.map(hist => hist.opportunityId)),
        communityId: options.communityId,
      },
    });

    // TODO: Optimize score calculation.
    // Calculating opportunity and stage scores.
    for (const opportunity of opportunities) {
      const [oppoScore, rawStageScore] = await Promise.all([
        this.evaluationCriteriaService.getOpportunityEvaluationScore({
          community: options.communityId,
          opportunity: opportunity.id,
        }),
        this.evaluationCriteriaService.getEvaluationsEntityScores({
          community: options.communityId,
          entityObjectId: opportunity.stageId,
          entityType: stageEntityType.id,
          opportunity: opportunity.id,
        }),
      ]);

      const totalScore = get(oppoScore, 'finalScore');
      const stageScore = get(rawStageScore, 'entityScore.finalScore');

      await this.opportunityService.updateRawOpportunity(
        { id: opportunity.id, communityId: options.communityId },
        {
          totalScore: totalScore || totalScore === 0 ? totalScore : null,
          currStageScore: stageScore || stageScore === 0 ? stageScore : null,
        },
      );
    }
  }
}
