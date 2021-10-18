import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { WorkflowService } from './workflow.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { AddWorkflowDto } from './dto/AddWorkflowDto';
import { GetCommunityWorkflowDto } from './dto/GetCommunityWorkflowDto';
import { GetWorkflowStageDto } from './dto/GetWorkflowStageDto';
import { AddStageDto } from './dto/AddStageDto';
import { UpdateStageOrderDto } from './dto/UpdateStageOrderDto';
import { GetStagePotentialAssigneesCountDto } from './dto/GetStagePotentialAssigneesCountDto';
import { GetStageSettingsDto } from './dto/GetStageDto';
import { StageService } from '../stage/stage.service';
import { GetCommunityWorkflowsWithCountsDto } from './dto/GetCommunityWorkflowsWithCountsDto';
import { GetStagesSettingsDetailsDto } from './dto/GetStagesSettingsDetailsDto';
import { EvaluationScoreSyncService } from '../evaluationCriteria/evaluationScoreSync.service';

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    public readonly stageService: StageService,
    public readonly evalScoreSyncService: EvaluationScoreSyncService,
  ) {}

  @Post('stage')
  async addStage(
    @Body() body: AddStageDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    if (!body.status) {
      body.status = (await this.workflowService.getNextStatus({
        workflowId: body.workflow,
        community: req['userData'].currentCommunity,
      })).id;
    }
    const response = await this.stageService.addStage({
      ...body,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Post()
  async addWorkflow(@Body() body: AddWorkflowDto): Promise<ResponseFormat> {
    const response = await this.workflowService.addWorkflow(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get('stage')
  async getWorkflowStages(
    @Query() queryParams: GetWorkflowStageDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const withCounts = queryParams.withCounts || false;
    const withSettings = queryParams.withSettings || false;
    const challenge = queryParams.challenge;
    delete queryParams.withCounts;
    delete queryParams.withSettings;
    delete queryParams.challenge;

    // Workflow join added only if there's no workflow filter. (Modify if needed)
    const options = {
      where: { ...queryParams, community: req['userData'].currentCommunity },
      order: { orderNumber: 'ASC' },
      relations: [
        'status',
        'actionItem',
        ...(!queryParams.workflow ? ['workflow'] : []),
      ],
    };

    let stages;
    if (!withCounts) {
      stages = await this.stageService.getStages(options);
    } else {
      stages = await this.stageService.getStagesWithCounts({
        ...options,
        challenge,
      });
    }

    if (withSettings) {
      stages = await this.stageService.getStagesWithSettings(stages);
    }
    return ResponseFormatService.responseOk(stages, 'All');
  }

  @Get()
  async getCommunityWorkflows(
    @Query() queryParams: GetCommunityWorkflowDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const options = {
      where: { ...queryParams, community: req['userData'].currentCommunity },
    };
    const workflows = await this.workflowService.getWorkflows(options);
    return ResponseFormatService.responseOk(workflows, 'All');
  }

  @Get('next-status/:id')
  async getNextStatus(
    @Param('id') id,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const status = await this.workflowService.getNextStatus({
      workflowId: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(status, 'All');
  }

  @Get('workflows-with-counts')
  async getWorkflowsWithCounts(
    @Query() queryParams: GetCommunityWorkflowsWithCountsDto,
  ): Promise<ResponseFormat> {
    const options = {
      where: {
        community: queryParams.community,
        isDeleted: queryParams.isDeleted,
      },
      forFilter: queryParams.forFilter,
      challenge: queryParams.challenge,
    };
    const workflows = await this.workflowService.getWorkflowsWithCounts(
      options,
    );
    return ResponseFormatService.responseOk(workflows, 'All');
  }

  @Get('stage/potential-assignees-count')
  async getStagePotentialAssigneesCount(
    @Query() queryParams: GetStagePotentialAssigneesCountDto,
  ): Promise<ResponseFormat> {
    const stage = await this.stageService.getStagePotentialAssigneesCount(
      queryParams,
    );
    return ResponseFormatService.responseOk(stage, 'Potential Assignees Count');
  }

  @Get('stage/notifiable-users-count')
  async getNotifiableUsersCount(
    @Query() queryParams: GetStagePotentialAssigneesCountDto,
  ): Promise<ResponseFormat> {
    const stage = await this.stageService.getNotifiableUsersCount(queryParams);
    return ResponseFormatService.responseOk(stage, 'Notifiable Users Count');
  }

  @Get('stage/stage-settings')
  async getStageSettings(
    @Query() queryParams: GetStageSettingsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const settings = await this.stageService.getStageSettings({
      ...queryParams,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(settings, 'All');
  }

  @Get('stage/list-settings-details')
  async getStageListSettingsDetails(
    @Query() queryParams: GetStagesSettingsDetailsDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const stages = await this.stageService.getStages({
      where: {
        ...(queryParams.workflow && { workflow: queryParams.workflow }),
        ...(queryParams.stage && { id: queryParams.stage }),
        isDeleted: queryParams.isDeleted || false,
        community: req['userData'].currentCommunity,
      },
      order: {
        orderNumber: 'ASC',
      },
    });

    let settings = [];
    if (stages.length) {
      settings = await this.stageService.getStagesSettingsDetails(stages);
    }
    return ResponseFormatService.responseOk(
      settings,
      'Settings and details for the stages of given workflow.',
    );
  }

  @Get('stage/:id')
  async getStage(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const stage = await this.stageService.getOneStage({
      where: { id, community: req['userData'].currentCommunity },
      relations: ['status', 'actionItem'],
    });
    return ResponseFormatService.responseOk(stage, 'All');
  }

  @Get(':id')
  async getWorkflow(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const workflow = await this.workflowService.getOneWorkflow({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(workflow, 'All');
  }

  @Patch('stage/update-order')
  async updateStagesOrder(
    @Body() body: UpdateStageOrderDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.stageService.updateStagesOrder(
      body,
      req['userData'].currentCommunity,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Patch('stage/:id')
  async updateStage(
    @Param('id') id: string,
    @Body() body: AddStageDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.stageService.updateStage(
      { id: parseInt(id), community: req['userData'].currentCommunity },
      body,
    );

    // Update existing opportunities scores.
    this.evalScoreSyncService.syncScoresOnStageUpdate({
      stageId: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });

    // Sync evaluation summaries for opportunities ever attached with this stage.
    this.evalScoreSyncService.syncEvalSummaryOnStageUpdate({
      stageId: parseInt(id),
      communityId: req['userData'].currentCommunity,
    });

    return ResponseFormatService.responseOk(updateData, '');
  }

  @Patch(':id')
  async updateWorkflow(
    @Param('id') id: number,
    @Body() body: AddWorkflowDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const updateData = await this.workflowService.updateWorkflow(
      { id: id, community: req['userData'].currentCommunity },
      body,
    );
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete('stage/:id')
  async removeStage(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.stageService.deleteStage({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }

  @Delete(':id')
  async removeWorkflow(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const deleteData = await this.workflowService.deleteWorkflow({
      id: id,
      community: req['userData'].currentCommunity,
    });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
