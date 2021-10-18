import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Put,
  Req,
  Logger,
} from '@nestjs/common';
import { EvaluationCriteriaService } from './evaluationCriteria.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import {
  AddEvaluationCriteriaDto,
  ExportEvaluationDto,
  GetEntityEvalResponsesDto,
  GetOppoCriteriaEvalSummaryDto,
  GetOppoEvalSummaryDto,
  SearchEvaluationCriteriaDto,
} from './dto';
import { In, Like } from 'typeorm';
import { OpportunityEvaluationResponseService } from './opportunityEvaluationResponse.service';
import { GetEvaluationResponseDto } from './dto/GetEvaluationResponseDto';
import { PutEvaluationResponseBodyDto } from './dto/PutEvaluationResponseBodyDto';
import { Request } from 'express';
import { EvaluationCriteriaIntegrationService } from './evaluationCriteriaIntegration.service';
import { GetEvaluationIntegrationsDto } from './dto/GetEvaluationIntegrationsDto';
import { GetEvaluationIntegrationsWithResponseDto } from './dto/GetEvaluationIntegrationsWithResponseDto';
import { orderBy, uniqBy, map, get, find, filter, sortBy } from 'lodash';
import { GetOpportunityEvaluationScoreDto } from './dto/GetOpportunityEvaluationScoreDto';
import { OpportunityService } from '../opportunity/opportunity.service';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { ENTITY_TYPES } from '../../common/constants/constants';
import { MessagePattern } from '@nestjs/microservices';
import { StageHistoryService } from '../stage/stageHistory.service';
import { OppoEvaluationSummaryService } from './oppoEvaluationSummary.service';
import { OppoCriteriaEvalSummaryService } from './oppoCriteriaEvalSummary.service';
import { StageService } from '../stage/stage.service';
import { GetOpposEvalSummaryDto } from './dto/GetOpposEvalSummaryDto';
import { EvaluationScoreSyncService } from './evaluationScoreSync.service';

@Controller('evaluation-criteria')
export class EvaluationCriteriaController {
  constructor(
    private readonly evaluationCriteriaService: EvaluationCriteriaService,
    private readonly opportunityEvaluationResponseService: OpportunityEvaluationResponseService,
    private readonly evaluationCriteriaIntegrationService: EvaluationCriteriaIntegrationService,
    private readonly opportunityService: OpportunityService,
    private readonly stageHistoryService: StageHistoryService,
    private readonly oppoEvalSummaryService: OppoEvaluationSummaryService,
    private readonly oppoCriteriaEvalSummaryService: OppoCriteriaEvalSummaryService,
    private readonly evalScoreSyncService: EvaluationScoreSyncService,
    private readonly stageService: StageService,
  ) {}

  @Post()
  async addEvaluationCriteria(
    @Body() body: AddEvaluationCriteriaDto,
  ): Promise<ResponseFormat> {
    const response = await this.evaluationCriteriaService.addEvaluationCriteria(
      body,
    );
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllEvaluationCriterias(
    @Query() queryParams: SearchEvaluationCriteriaDto,
  ): Promise<ResponseFormat> {
    let whereClause: { community: number; title? } = {
      community: queryParams.community,
    };
    if (queryParams.title) {
      whereClause = { ...whereClause, title: Like(`%${queryParams.title}%`) };
    }
    const options = {
      where: whereClause,
      relations: ['evaluationType'],
    };
    const evaluationCriterias = await this.evaluationCriteriaService.getEvaluationCriterias(
      options,
    );
    return ResponseFormatService.responseOk(evaluationCriterias, 'All');
  }

  @Get('response')
  async getEvaluationResponse(
    @Query() queryparams: GetEvaluationResponseDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      relations: [
        'opportunity',
        'evaluationCriteria',
        'evaluationCriteria.evaluationType',
      ],
      where: { ...queryparams, user: req['userData'].id },
    };
    const evalResponse = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
      options,
    );
    return ResponseFormatService.responseOk(
      evalResponse,
      'Opportunity evaluation reponses.',
    );
  }

  @Put('response')
  async putEvaluationResponse(
    @Query() queryparams: GetEvaluationResponseDto,
    @Body() body: PutEvaluationResponseBodyDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const evalResponse = await this.opportunityEvaluationResponseService.addOrUpdateOppEvaluationResponse(
      {
        ...queryparams,
        user: req['userData'].id,
        community: req['userData'].currentCommunity,
      },
      body.data,
    );

    // Sync scores and evaluation summary.
    this.evalScoreSyncService.syncCurrentStageScore({
      opportunityId: queryparams.opportunity,
      communityId: req['userData'].currentCommunity,
    });
    this.evalScoreSyncService.syncEvalSummary({
      opportunityId: queryparams.opportunity,
      entityObjectId: queryparams.entityObjectId,
      entityTypeId: queryparams.entityType,
      communityId: queryparams.community,
      syncCompletion: true,
    });

    return ResponseFormatService.responseOk(
      evalResponse,
      'Evaluation reponses added.',
    );
  }

  @Get('opportunity-score')
  async getOpportunityEvaluationScores(
    @Query() queryparams: GetOpportunityEvaluationScoreDto,
  ): Promise<ResponseFormat> {
    const score = await this.evaluationCriteriaService.getOpportunityEvaluationScore(
      queryparams,
    );

    return ResponseFormatService.responseOk(
      score,
      'Opprotunity Evaluation Score',
    );
  }

  @MessagePattern('syncCurrentStageScore')
  async syncCurrentStageScore(options: {
    opportunityId: number;
    communityId: number;
  }): Promise<{}> {
    return this.evalScoreSyncService.syncCurrentStageScore(options);
  }

  @MessagePattern('syncScoresOnStageUpdate')
  async syncScoresOnStageUpdate(options: {
    stageId: number;
    communityId: number;
  }): Promise<void> {
    await this.evalScoreSyncService.syncScoresOnStageUpdate(options);
  }

  @MessagePattern('syncScoresOnCriteriaUpdate')
  async syncScoresOnCriteriaUpdate(options: {
    criteriaId: number;
    communityId: number;
  }): Promise<void> {
    await this.evalScoreSyncService.syncScoresOnCriteriaUpdate(options);
  }

  /**
   * Temporary method to be used for syncing scores for all opportunities.
   */
  private async syncAllOpposScoresManually(): Promise<void> {
    try {
      // Fetching opportunities for the found history.
      const [opportunities, stageEntityType] = await Promise.all([
        this.opportunityService.getSimpleOpportunities({}),
        EntityMetaService.getEntityTypeMetaByAbbreviation(ENTITY_TYPES.STAGE),
      ]);

      // TODO: Optimize score calculation.
      // Calculating opportunity and stage scores.
      for (const opportunity of opportunities) {
        const [oppoScore, stageScore] = await Promise.all([
          this.evaluationCriteriaService.getOpportunityEvaluationScore({
            community: opportunity.communityId,
            opportunity: opportunity.id,
          }),
          this.evaluationCriteriaService.getEvaluationsEntityScores({
            community: opportunity.communityId,
            entityObjectId: opportunity.stageId,
            entityType: stageEntityType.id,
            opportunity: opportunity.id,
          }),
        ]);

        await this.opportunityService.updateRawOpportunity(
          { id: opportunity.id },
          {
            totalScore: get(oppoScore, 'finalScore') || null,
            currStageScore: get(stageScore, 'entityScore.finalScore') || null,
          },
        );
      }
      Logger.error('SyncSuccess! All Opportunities Scores Sync Success!');
    } catch (err) {
      Logger.error(
        'Error while syncing scores for all opportunities',
        JSON.stringify(err),
      );
      Logger.error('RawError:', err);
    }
  }

  /**
   * Temporary API to be used for syncing scores for all opportunities.
   */
  @Get('all-scores-manual-update')
  async syncAllScoresManually(): Promise<ResponseFormat> {
    // Start syncing.
    this.syncAllOpposScoresManually();

    return ResponseFormatService.responseOk(
      {},
      `Sync job for all opportunities' scores started.`,
    );
  }

  /**
   * Temporary API to be used for syncing evaluation summaries for all
   * opportunities.
   */
  @Get('sync-all-eval-summaries')
  async syncAllEvalSummaries(): Promise<ResponseFormat> {
    // Start syncing.
    this.evalScoreSyncService.syncAllEvalSummaries();

    return ResponseFormatService.responseOk(
      {},
      `Sync job for all opportunities' eval summaries started.`,
    );
  }

  @Post('opportunity-score')
  async getOpportunitiesEvaluationScores(@Body()
  body: {
    community: number;
    opportunityIds: [];
  }): Promise<ResponseFormat> {
    const opportunityScorePromiseArr = [];
    map(body.opportunityIds, val => {
      opportunityScorePromiseArr.push(
        this.evaluationCriteriaService.getOpportunityEvaluationScore({
          community: body.community,
          opportunity: val,
          returnOpportunityId: true,
        }),
      );
    });
    const score = await Promise.all(opportunityScorePromiseArr);

    return ResponseFormatService.responseOk(
      score,
      'Opprotunity Evaluation Score',
    );
  }

  @Get('entity-scores')
  async getEvaluationEntityScores(
    @Query() queryparams: GetEvaluationIntegrationsWithResponseDto,
  ): Promise<ResponseFormat> {
    const scores = await this.evaluationCriteriaService.getEvaluationsEntityScores(
      queryparams,
    );

    const responses = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
      {
        where: queryparams,
      },
    );
    const uniqResp = uniqBy(responses, 'userId');

    return ResponseFormatService.responseOk(
      { ...scores, totalResponses: uniqResp.length },
      'All Evaluation Criterias Entity Scores',
    );
  }
  @Post('entity-scores')
  async getEvaluationEntitiesScores(@Body() body): Promise<ResponseFormat> {
    const dataPromiseArr = [];
    map(body.requestData, res => {
      dataPromiseArr.push(
        this.getDataForEvalScore({
          community: body.community,
          entityObjectId: res.entityObjectId,
          entityType: res.entityType,
          opportunity: res.opportunity,
        }),
      );
    });
    const result = await Promise.all(dataPromiseArr);
    return ResponseFormatService.responseOk(
      result,
      'All Evaluation Criterias Entity Scores',
    );
  }

  @Get('integration')
  async getEvaluationIntegrations(
    @Query() queryparams: GetEvaluationIntegrationsDto,
  ): Promise<ResponseFormat> {
    const entityCriterias = await this.evaluationCriteriaIntegrationService.getEvaluationCriteriaIntegrations(
      {
        relations: ['evaluationCriteria', 'evaluationCriteria.evaluationType'],
        where: queryparams,
        order: { order: 'ASC' },
      },
    );

    return ResponseFormatService.responseOk(
      entityCriterias,
      'All Entity Evaluation Criterias',
    );
  }

  @Get('integration/with-response')
  async getEvaluationIntegrationsWithResponse(
    @Query() queryparams: GetEvaluationIntegrationsWithResponseDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const integrationsWithData = await this.evaluationCriteriaIntegrationService.getEvaluationIntegrationsWithFilters(
      {
        ...queryparams,
        checkOpportunity: true,
        includeResponses: true,
        user: req['userData'].id,
      },
    );

    const excludeCriteriaIds = integrationsWithData.map(
      integration => integration.evaluationCriteriaId,
    );

    const integrationsWithoutData = await this.evaluationCriteriaIntegrationService.getEvaluationIntegrationsWithFilters(
      {
        ...queryparams,
        ...(excludeCriteriaIds.length && { excludeCriteriaIds }),
        includeResponses: false,
        checkOpportunity: false,
        user: req['userData'].id,
      },
    );

    const integrationsData = [
      ...integrationsWithData,
      ...integrationsWithoutData,
    ];
    const integrationsDataSorted = orderBy(integrationsData, 'order', 'asc');

    return ResponseFormatService.responseOk(
      integrationsDataSorted,
      'All Evaluation Criteria Integrations with Data.',
    );
  }

  @Get('opportunity-score-response')
  async getOpportunityScoreResponse(
    @Query() queryParams: GetEntityEvalResponsesDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const criteriaScores = await this.evaluationCriteriaService.getEntityEvalResponses(
      { ...queryParams, community: req['userData'].currentCommunity },
    );

    return ResponseFormatService.responseOk(
      criteriaScores,
      'All Stage Criteria Score and Response.',
    );
  }

  @Get('opportunity-criteria-summary')
  async getOpportunityCriteriaSummary(
    @Query() queryparams: GetOppoCriteriaEvalSummaryDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const evaluationSummary = await this.oppoCriteriaEvalSummaryService.getOppoCriteriaEvalSummaries(
      {
        where: {
          ...queryparams,
          communityId: req['userData'].currentCommunity,
        },
        relations: ['criteria'],
      },
    );

    return ResponseFormatService.responseOk(
      evaluationSummary,
      'All Stage Criteria Evaluation Summary.',
    );
  }

  @Get('opportunity-evaluation-summary')
  async getOpportunityEvaluationSummary(
    @Query() queryparams: GetOppoEvalSummaryDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const evaluationSummary = await this.oppoEvalSummaryService.getOpportunityEvaluationSummary(
      {
        entityTypeId: queryparams['entityTypeId'],
        opportunityId: queryparams['opportunityId'],
        communityId: req['userData'].currentCommunity,
      },
    );

    return ResponseFormatService.responseOk(
      evaluationSummary,
      'Specific Opportunity Stages Evaluation Summary.',
    );
  }

  @Post('opportunity-evaluation-export')
  async exportEvaluationSummary(
    @Body() body: ExportEvaluationDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const evaluationSummary = await this.oppoEvalSummaryService.getOpportunityEvaluationSummary(
      {
        entityTypeId: body['entityTypeId'],
        opportunityId: body['opportunityId'],
        communityId: req['userData'].currentCommunity,
      },
    );

    const exportRes = await this.oppoEvalSummaryService.exportEvaluationSummary(
      evaluationSummary,
      body,
    );

    return ResponseFormatService.responseOk(exportRes, 'Exported File Url.');
  }

  @Post('opportunities-evaluation-summary')
  async getOpportunitiesEvaluationSummary(
    @Body() body: GetOpposEvalSummaryDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (!get(body.opportunityIds, 'length'))
      return ResponseFormatService.responseOk(
        [],
        'All Opportunities Stages Evaluation Summary.',
      );

    const evaluationSummary = await this.oppoEvalSummaryService.getOppoEvaluationSummaries(
      {
        where: {
          opportunityId: In(body['opportunityIds']),
          entityTypeId: body['entityTypeId'],
          communityId: req['userData'].currentCommunity,
        },
      },
    );

    if (!get(evaluationSummary, 'length'))
      return ResponseFormatService.responseOk(
        [],
        'All Opportunities Stages Evaluation Summary.',
      );

    const stageIds = [];
    evaluationSummary.forEach(ev => {
      stageIds.push(ev.entityObjectId);
    });

    const stages = await this.stageService.getStages({
      where: {
        id: In(stageIds),
        communityId: req['userData'].currentCommunity,
      },
    });

    const stageHistory = await this.stageHistoryService.getStageHistory({
      where: {
        stage: In(stageIds),
        opportunity: In(body['opportunityIds']),
        community: req['userData'].currentCommunity,
      },
      order: {
        id: 'DESC',
      },
    });

    const paginatedStages = {};
    stageHistory.forEach((sh, index) => {
      if (
        !paginatedStages[`${sh.stageId}-${sh.opportunityId}`] &&
        paginatedStages[`${sh.stageId}-${sh.opportunityId}`] !== 0
      ) {
        paginatedStages[`${sh.stageId}-${sh.opportunityId}`] = index;
      }
    });

    evaluationSummary.forEach((ev, index) => {
      const stage = find(stages, ['id', ev.entityObjectId]);
      if (stage) {
        evaluationSummary[index]['stage'] = stage;
      }
    });

    const response = [];
    const opportunityIds = body['opportunityIds'];
    opportunityIds.forEach(id => {
      let evaluation = filter(evaluationSummary, ['opportunityId', id]);
      if (get(evaluation, 'length')) {
        evaluation = sortBy(evaluation, [
          (es): number =>
            get(paginatedStages, es['stage'].id, evaluation.length),
        ]);
        response.push({
          opportunityId: id,
          summary: evaluation,
        });
      }
    });

    return ResponseFormatService.responseOk(
      response,
      'All Opportunities Stages Evaluation Summary.',
    );
  }

  @Get(':id')
  async getEvaluationCriteria(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const evaluationCriteria = await this.evaluationCriteriaService.getEvaluationCriterias(
      { where: { id: id }, relations: ['evaluationType'] },
    );
    return ResponseFormatService.responseOk(evaluationCriteria, 'All');
  }

  @Patch(':id')
  async updateEvaluationCriteria(
    @Param('id') id: string,
    @Body() body: {},
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.evaluationCriteriaService.updateEvaluationCriteria(
      { id: parseInt(id) },
      body,
    );

    // Sync total & current stage score.
    this.evalScoreSyncService.syncScoresOnCriteriaUpdate({
      criteriaId: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });

    // Sync evaluation summaries for opportunities ever attached with this criteria.
    this.evalScoreSyncService.syncEvalSummaryOnCriteriaUpdate({
      criteriaId: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });

    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async archiveEvaluationCriteria(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.evaluationCriteriaService.archiveEvaluationCriteria(
      { id: parseInt(id) },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
  @Delete('integration/:id')
  async removeEvaluationCriteriaIntegration(
    @Param('id') id: string,
  ): Promise<ResponseFormat> {
    const deleteData = await this.evaluationCriteriaIntegrationService.deleteEvaluationCriteriaIntegration(
      { id: id },
    );
    return ResponseFormatService.responseOk(deleteData, '');
  }
  async getDataForEvalScore(
    params: GetEvaluationIntegrationsWithResponseDto,
  ): Promise<{}> {
    const scores = await this.evaluationCriteriaService.getEvaluationsEntityScores(
      params,
    );

    const responses = await this.opportunityEvaluationResponseService.getOpportunityEvaluationResponses(
      {
        where: params,
      },
    );
    const uniqResp = uniqBy(responses, 'userId');
    return {
      ...scores,
      totalResponses: uniqResp.length,
      opportunityId: params.opportunity,
    };
  }
}
