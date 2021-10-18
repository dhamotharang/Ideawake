import { Injectable } from '@nestjs/common';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowEntity } from './workflow.entity';
import { In, MoreThan } from 'typeorm';
import { groupBy } from 'lodash';
import { OpportunityService } from '../opportunity/opportunity.service';
import { StatusEntity } from '../status/status.entity';
import { StatusService } from '../status/status.service';
import { StageService } from '../stage/stage.service';

@Injectable()
export class WorkflowService {
  constructor(
    public readonly workflowRepository: WorkflowRepository,
    public readonly opportunityService: OpportunityService,
    public readonly statusService: StatusService,
    public readonly stageService: StageService,
  ) {}

  /**
   * Get workflows
   */
  async getWorkflows(options: {}): Promise<WorkflowEntity[]> {
    return this.workflowRepository.find(options);
  }

  /**
   * Get workflows with counts
   */
  async getWorkflowsWithCounts(options: {}): Promise<{}[]> {
    const forFilter = options['forFilter'] || false;
    const challenge = options['challenge'];
    delete options['forFilter'];
    delete options['challenge'];
    const workflows = await this.getWorkflows(options);
    if (workflows && workflows.length) {
      const workflowIds = workflows.map(wf => wf.id);
      const stages = await this.stageService.getStages({
        where: { workflow: In(workflowIds), isDeleted: false },
      });
      const stagesGrouped = groupBy(stages, 'workflowId');

      const oppOptions: {} = {
        where: { workflow: In(workflowIds), isDeleted: false },
      };
      if (challenge) {
        oppOptions['where'] = { ...oppOptions['where'], challenge };
      }
      const opportunities = await this.opportunityService.getOpportunities(
        oppOptions,
      );
      const opportunitiesGrouped = groupBy(opportunities, 'workflowId');
      workflows.map(workflow => {
        workflow['stagesCount'] = stagesGrouped[workflow.id]
          ? stagesGrouped[workflow.id].length
          : 0;
        workflow['opportunitiesCount'] = opportunitiesGrouped[workflow.id]
          ? opportunitiesGrouped[workflow.id].length
          : 0;
      });
    }
    if (forFilter) {
      const oppOptions: {} = {
        where: { community: options['where']['community'], isDeleted: false },
      };
      if (challenge) {
        oppOptions['where'] = { ...oppOptions['where'], challenge };
      }

      let oppWithoutWorkflow = await this.opportunityService.getOpportunityCount(
        oppOptions,
      );
      oppWithoutWorkflow =
        oppWithoutWorkflow -
        workflows.reduce((prev, next) => prev + next['opportunitiesCount'], 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const noWorkflow: any = {
        id: -1,
        title: 'No Workflow',
        opportunitiesCount: oppWithoutWorkflow,
      };
      workflows.unshift(noWorkflow);
    }
    return workflows;
  }

  /**
   * Get one workflow
   */
  async getOneWorkflow(options: {}): Promise<WorkflowEntity> {
    return this.workflowRepository.findOne(options);
  }

  /**
   * Get next possible status in a workflow.
   */
  async getNextStatus(params: {
    workflowId: number;
    community: number;
  }): Promise<StatusEntity> {
    const options = {
      where: { workflow: params.workflowId, community: params.community },
      order: { orderNumber: 'DESC' },
      relations: ['status'],
    };
    const stage = await this.stageService.getOneStage(options);

    let nextStatus;
    if (stage) {
      nextStatus = await this.statusService.getOneStatus({
        where: {
          orderNumber: MoreThan(stage.status.orderNumber),
          community: stage.communityId,
        },
        order: { orderNumber: 'ASC' },
      });

      // Setting the existing status if there are no statuses after the current one.
      nextStatus = nextStatus || stage.status;
    } else {
      nextStatus = await this.statusService.getOneStatus({
        where: { community: params.community },
        order: { orderNumber: 'ASC' },
      });
    }

    return nextStatus;
  }

  /**
   * Add workflow
   */
  async addWorkflow(data: {}): Promise<WorkflowEntity> {
    data['isDeleted'] = false;
    const workflowCreated = this.workflowRepository.create(data);
    return this.workflowRepository.save(workflowCreated);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(options: {}, data: {}): Promise<{}> {
    return this.workflowRepository.update(options, data);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(options: {}): Promise<{}> {
    return this.updateWorkflow(options, { isDeleted: true });
  }
}
