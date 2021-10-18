import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { find, groupBy, sumBy, sortBy, round, get } from 'lodash';
import { OppoEvaluationSummaryRepository } from './oppoEvaluationSummary.repository';
import { OppoEvaluationSummaryEntity } from './oppoEvaluationSummary.entity';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  In,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EvaluationCriteriaService } from './evaluationCriteria.service';
import { OpportunityService } from '../opportunity/opportunity.service';
import { StageHistoryService } from '../stage/stageHistory.service';
import { EvaluationCriteriaIntegrationService } from './evaluationCriteriaIntegration.service';
import { OppoCriteriaEvalSummaryService } from './oppoCriteriaEvalSummary.service';
import { StageService } from '../stage/stage.service';
import { existsSync, mkdirSync, unlink } from 'fs';
import { ExportEvaluationDto } from './dto';
import { AwsS3Service } from '../../shared/services/aws-s3.service';

@Injectable()
export class OppoEvaluationSummaryService {
  constructor(
    public readonly oppoEvaluationSummaryRepository: OppoEvaluationSummaryRepository,
    public readonly evaluationCriteriaService: EvaluationCriteriaService,
    public readonly opportunityService: OpportunityService,
    public readonly stageHistoryService: StageHistoryService,
    public readonly criteriaIntegrationService: EvaluationCriteriaIntegrationService,
    public readonly oppoCritEvalSummaryService: OppoCriteriaEvalSummaryService,
    public readonly stageService: StageService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * Find and fetch opportunities' evaluation summaries.
   * @param options Options to find summaries.
   * @returns Summaries found.
   */
  async getOppoEvaluationSummaries(
    options: FindManyOptions<OppoEvaluationSummaryEntity>,
  ): Promise<OppoEvaluationSummaryEntity[]> {
    return this.oppoEvaluationSummaryRepository.find(options);
  }

  /**
   * Find and fetch opportunity's evaluation summary.
   * @param options Options to find summary.
   * @returns Summary found.
   */
  async getOppoEvaluationSummary(
    options: FindOneOptions<OppoEvaluationSummaryEntity>,
  ): Promise<OppoEvaluationSummaryEntity> {
    return this.oppoEvaluationSummaryRepository.findOne(options);
  }

  /**
   * Add an opportunity's evaluation summary.
   * @param data Summary data.
   * @returns Addedd summary object.
   */
  async addOppoEvaluationSummary(
    data: DeepPartial<OppoEvaluationSummaryEntity>,
  ): Promise<OppoEvaluationSummaryEntity> {
    const oppoEvaluationSummaryCreated = this.oppoEvaluationSummaryRepository.create(
      data,
    );
    return this.oppoEvaluationSummaryRepository.save(
      oppoEvaluationSummaryCreated,
    );
  }

  /**
   * Update opportunities' evaluation summary/summaries.
   * @param options Options to find evaluation Summary/Summaries.
   * @param data Updated data.
   * @returns Update status result.
   */
  async updateOppoEvaluationSummary(
    options: FindConditions<OppoEvaluationSummaryEntity>,
    data: QueryDeepPartialEntity<OppoEvaluationSummaryEntity>,
  ): Promise<UpdateResult> {
    return this.oppoEvaluationSummaryRepository.update(options, data);
  }

  /**
   * Permanently delete an opportunity's evaluation summary.
   * @param options Options to find evaluation Summary/Summaries.
   * @returns Deletion status result.
   */
  async deleteOppoEvaluationSummary(
    options: FindConditions<OppoEvaluationSummaryEntity>,
  ): Promise<DeleteResult> {
    return this.oppoEvaluationSummaryRepository.delete(options);
  }

  /**
   * Saves an opportunity's evaluation summary. Adds a new row if not already
   * present, otherwise updates the existing data.
   *
   * @param options Options to search summary on.
   * @param data Data to add/update.
   * @returns Update result or the new object added.
   */
  async saveOppoEvaluationSummary(
    options: FindConditions<OppoEvaluationSummaryEntity>,
    data: DeepPartial<OppoEvaluationSummaryEntity>,
  ): Promise<UpdateResult | OppoEvaluationSummaryEntity> {
    const updateRes = await this.updateOppoEvaluationSummary(options, data);
    if (!updateRes.affected) {
      return this.addOppoEvaluationSummary(data);
    }
    return updateRes;
  }

  /**
   * get opportunity's evaluation summary.
   * @param options
   * @returns evaluation summary or the update result.
   */
  async getOpportunityEvaluationSummary(options: {
    entityTypeId: number;
    opportunityId: number;
    communityId: number;
  }): Promise<OppoEvaluationSummaryEntity[]> {
    let evaluationSummary = await this.getOppoEvaluationSummaries({
      where: options,
    });

    const stageIds = [];
    evaluationSummary.forEach(ev => {
      stageIds.push(ev.entityObjectId);
    });

    if (stageIds.length) {
      const stages = await this.stageService.getStages({
        where: {
          id: In(stageIds),
          communityId: options['communityId'],
        },
      });

      const stageHistory = await this.stageHistoryService.getStageHistory({
        where: {
          stage: In(stageIds),
          opportunity: options['opportunityId'],
          community: options['communityId'],
        },
        order: {
          id: 'DESC',
        },
      });

      const paginatedStages = {};
      stageHistory.forEach((sh, index) => {
        if (!paginatedStages[sh.stageId] && paginatedStages[sh.stageId] !== 0) {
          paginatedStages[sh.stageId] = index;
        }
      });

      const groupedStageHistory = groupBy(stageHistory, 'stageId');
      stages.forEach((stage, i) => {
        const stageHistories = get(groupedStageHistory, stage.id);
        const daysInStage = sumBy(stageHistories, sh =>
          sh.exitingAt
            ? moment(sh.exitingAt).diff(sh.enteringAt, 'days', true)
            : moment(moment()).diff(sh.enteringAt, 'days', true),
        );
        stages[i]['daysInStage'] = daysInStage;
      });

      evaluationSummary.forEach((ev, index) => {
        const stage = find(stages, ['id', ev.entityObjectId]);
        if (stage) {
          evaluationSummary[index]['stage'] = stage;
        }
      });

      evaluationSummary = sortBy(evaluationSummary, [
        (es): number =>
          get(paginatedStages, es['stage'].id, evaluationSummary.length),
      ]);
    }

    return evaluationSummary;
  }

  /**
   * Export opportunities and upload the exported file to S3.
   * @param evaluationSummary Opportunities to export.
   * @param options Export and filter options to export opportunities.
   * @param communityId Community Id.
   * @returns URL for the exported file.
   */
  async exportEvaluationSummary(
    evaluationSummary: OppoEvaluationSummaryEntity[],
    options: ExportEvaluationDto,
  ): Promise<{
    url: string;
    fileName: string;
  }> {
    // Return empty if no opportunties given to export
    const summaryData = [];
    evaluationSummary.forEach(summary => {
      summaryData.push({
        evaluation: summary['stage'].title,
        stageId: summary['stage'].id,
        assignees: summary.assignees.assigneeText,
        score: round(summary.score, 2) + ' / ' + 100,
        daysInStage: round(summary['stage'].daysInStage, 2) + ' Days',
        completion:
          summary.completionStats &&
          summary.completionStats.completed &&
          summary.completionStats.total
            ? round(summary.completionStats.completed, 2) +
              ' / ' +
              round(summary.completionStats.total, 2) +
              ' (' +
              round(
                (summary.completionStats.completed /
                  summary.completionStats.total) *
                  100,
                2,
              ) +
              ') %'
            : '--',
      });
    });

    // Create export file and directory.
    if (!existsSync('exports')) {
      mkdirSync('exports');
    }
    const rawFileName = `evaluation-export.${options.exportFormat}`;
    const fileName = `${Date.now().toString()}evaluation-export.${
      options.exportFormat
    }`;
    const filePath = `exports/${fileName}`;

    // Export opportunities to file.
    if (options.exportFormat === 'csv') {
      const csvWriter = createCsvWriter({
        path: filePath,
        alwaysQuote: true,
        header: [
          { id: 'stageId', title: 'Stage Number' },
          { id: 'evaluation', title: 'Stage Title' },
          { id: 'assignees', title: 'Assignees' },
          { id: 'score', title: 'Score' },
          { id: 'daysInStage', title: 'Days in Stage' },
          { id: 'completion', title: 'Completion' },
        ],
      });
      await csvWriter.writeRecords(summaryData);
    }

    // Upload the saved file to S3
    const s3FileUrl = await this.awsS3Service.uploadFile(
      fileName,
      'attachments/exports/evaluation-criteria',
      'exports',
    );

    // Remove the local file asynchronously.
    unlink(filePath, err => {
      if (err)
        Logger.error(
          `Error while deleting the exported file '${filePath}':`,
          JSON.stringify(err),
        );
    });

    // Return S3 file url and raw file name.
    return {
      url: s3FileUrl,
      fileName: rawFileName,
    };
  }
}
