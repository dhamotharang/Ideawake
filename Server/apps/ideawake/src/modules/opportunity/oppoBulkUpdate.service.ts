import { Injectable } from '@nestjs/common';
import {
  ACTION_ITEM_ABBREVIATIONS,
  ACTION_TYPES,
  ENTITY_TYPES,
  REMINDER_FREQUENCY_MAPPING,
} from '../../common/constants/constants';
import { EntityMetaService } from '../../shared/services/EntityMeta.service';
import { NotificationHookService } from '../../shared/services/notificationHook';
import { EvaluationCriteriaService } from '../evaluationCriteria/evaluationCriteria.service';
import { StageService } from '../stage/stage.service';
import { OpportunityService } from './opportunity.service';
import * as moment from 'moment-timezone';
import { WorkflowService } from '../workflow/workflow.service';
import { TriggersHookService } from '../../shared/services/triggersHook.service';
import { RefreshScoreJobTypeEnum, SubscriptionHookEvents } from '../../enum';
import { In } from 'typeorm';
import { EntityTypeEntity } from '../entityType/entity.entity';
import { OpportunityEntity } from './opportunity.entity';
import { UserEntity } from '../user/user.entity';
import { UpdateOpportunitiesStageDto } from './dto';
import { OpportunityFieldLinkageService } from '../customField/opportunityFieldLinkage.service';
import { FieldIntegrationTypeEnum } from '../../enum/field-integration-type.enum';
import * as _ from 'lodash';
import { CustomFieldIntegrationEntity } from '../customField/customFieldIntegration.entity';
import { EvaluationScoreSyncService } from '../evaluationCriteria/evaluationScoreSync.service';

@Injectable()
export class OppoBulkUpdateService {
  constructor(
    public readonly opportunityService: OpportunityService,
    public readonly stageService: StageService,
    public readonly evaluationCriteriaService: EvaluationCriteriaService,
    public readonly workflowService: WorkflowService,
    public readonly triggersHookService: TriggersHookService,
    public readonly opportunityFieldLinkageService: OpportunityFieldLinkageService,
    public readonly evalScoreSyncService: EvaluationScoreSyncService,
  ) {}

  async updateOpportunitiesStage(
    data: UpdateOpportunitiesStageDto,
    actorData: UserEntity & { community: number },
    communityId: number,
    originUrl: string,
  ): Promise<{}> {
    const oppoEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const opportunities = await this.opportunityService.getOpportunities({
      relations: ['stage', 'stage.actionItem', 'community', 'workflow'],
      where: {
        id: In(data.ids),
        communityId,
      },
    });

    await Promise.all(
      opportunities.map(oppo =>
        this.updateOpportunityStageData(
          oppo,
          data,
          oppoEntityType,
          actorData,
          communityId,
        ),
      ),
    );

    const stageAttachmentDate = moment().format('YYYY-MM-DD');
    const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.STAGE,
    );

    const response = await this.opportunityService.updateRawOpportunity(
      { id: In(data.ids), communityId },
      {
        workflow: data.workflow,
        stage: data.stage,
        stageAttachmentDate: stageAttachmentDate,
      },
    );

    if (data['stage']) {
      this.updateActionItems(
        data,
        opportunities,
        stageEntityType,
        originUrl,
        communityId,
      );
    }

    return response;
  }

  async updateActionItems(
    data: UpdateOpportunitiesStageDto,
    opportunities: OpportunityEntity[],
    stageEntityType: EntityTypeEntity,
    originUrl: string,
    communityId: number,
  ): Promise<void> {
    const ideaEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
      ENTITY_TYPES.IDEA,
    );

    const stageFields = await this.opportunityService.customFieldIntegrationService.getCustomFieldIntegrations(
      {
        entityType: stageEntityType,
        entityObjectId: data['stage'],
        community: communityId,
      },
    );

    const updatedOpportunities = await this.opportunityService.getOpportunities(
      {
        relations: ['stage', 'stage.actionItem', 'community'],
        where: {
          id: In(data.ids),
          communityId,
        },
      },
    );

    const updatedOpposById = _.keyBy(updatedOpportunities, 'id');

    opportunities.forEach(oppo => {
      const updatedOppo = updatedOpposById[oppo.id];

      this.updateActionItem(data, oppo, updatedOppo, originUrl, ideaEntityType);
      this.updateStageFields(oppo, stageFields);

      // Refresh opportunity scores on stage change.
      this.evalScoreSyncService.syncCurrentStageScore({
        opportunityId: updatedOppo.id,
        communityId,
      });

      // Sync new stage's evalutation summary
      if (
        oppo.stageId !== updatedOppo.stageId &&
        updatedOppo.stage.actionItem.abbreviation ===
          ACTION_ITEM_ABBREVIATIONS.SCORECARD
      ) {
        this.evalScoreSyncService.syncEvalSummary({
          opportunityId: updatedOppo.id,
          entityObjectId: updatedOppo.stageId,
          entityTypeId: stageEntityType.id,
          communityId: communityId,
          syncAssignee: true,
          syncCompletion: true,
        });
      }
    });
  }

  updateStageFields(
    existingOpportunity: OpportunityEntity,
    stageFields: CustomFieldIntegrationEntity[],
  ) {
    if (stageFields && stageFields.length) {
      const integratedFields = stageFields.map(typeField => ({
        field: typeField.fieldId,
      }));

      this.opportunityFieldLinkageService.bulkAddOrUpdateOpportunityFieldLinkage(
        {
          opportunity: existingOpportunity.id,
          community: existingOpportunity.communityId,
          fieldIntegrationType: FieldIntegrationTypeEnum.STAGE,
        },
        integratedFields,
      );
    }
  }

  async updateActionItem(
    data: UpdateOpportunitiesStageDto,
    existingOpportunity: OpportunityEntity,
    opportunityData: OpportunityEntity,
    originUrl: string,
    ideaEntityType: EntityTypeEntity,
  ): Promise<void> {
    // Refresh opportunity scores on stage change.
    NotificationHookService.addOpportunityScoreSyncJob({
      refreshType: RefreshScoreJobTypeEnum.OPPO_CURR_STAGE,
      opportunityId: opportunityData.id,
      communityId: opportunityData.communityId,
    });

    // Send stage emails to assignees.
    if (
      opportunityData.stage.actionItem.abbreviation !==
      ACTION_ITEM_ABBREVIATIONS.NO_TOOL
    ) {
      const currentAssignees = await this.opportunityService.getCurrentStageAssignees(
        existingOpportunity.id,
      );
      NotificationHookService.addStageEmailHook({
        emailType: 'notification',
        entityType: ideaEntityType.id,
        entityObjectId: existingOpportunity.id,
        users: currentAssignees,
        stageId: data['stage'],
        reminderFrequency:
          REMINDER_FREQUENCY_MAPPING[
            _.toUpper(data.stageAssignmentSettings.emailReminder)
          ],
        actionType: '',
        community: existingOpportunity.communityId,
      });
    }

    if (data['stage'] && existingOpportunity.stageId !== data['stage']) {
      this.opportunityService.sendActionItemNotificationOnStageChange({
        opportunity: opportunityData,
        stageAssignmentSettings: data.stageAssignmentSettings,
        entityType: ideaEntityType,
        originUrl: originUrl,
      });
    }
  }

  async updateOpportunityStageData(
    opportunityDataCurent: OpportunityEntity,
    data: UpdateOpportunitiesStageDto,
    oppoEntityType: EntityTypeEntity,
    actorData: UserEntity & { community: number },
    communityId: number,
  ): Promise<void> {
    const actionData = {
      ...opportunityDataCurent,
      entityObjectId: opportunityDataCurent.id,
      entityType: oppoEntityType.id,
    };

    if (
      data.stage &&
      opportunityDataCurent.stage &&
      opportunityDataCurent.stage.id &&
      opportunityDataCurent.stage.id === data.stage
    ) {
      await this.opportunityService.editOpportunityStageData(
        data,
        opportunityDataCurent.id,
        opportunityDataCurent.community.id,
      );
    } else {
      const triggerOutput = {};
      const stageEntityType = await EntityMetaService.getEntityTypeMetaByAbbreviation(
        ENTITY_TYPES.STAGE,
      );
      const newStage = (triggerOutput[
        'currentStage'
      ] = await this.stageService.getOneStage({
        where: { id: data.stage },
        relations: ['actionItem', 'status'],
      }));

      if (opportunityDataCurent.stage) {
        const stageData = (triggerOutput[
          'oldStage'
        ] = await this.stageService.getOneStage({
          where: { id: opportunityDataCurent.stage.id },
          relations: ['actionItem', 'status'],
        }));

        // Storing final scores if the current stage is a scorecard one.
        let computeObject = {};
        if (
          opportunityDataCurent.stage.actionItem.abbreviation ===
          ACTION_ITEM_ABBREVIATIONS.SCORECARD
        ) {
          computeObject = await this.evaluationCriteriaService.getEvaluationsEntityScores(
            {
              entityObjectId: opportunityDataCurent.stage.id,
              entityType: stageEntityType.id,
              opportunity: opportunityDataCurent.id,
              community: opportunityDataCurent.communityId,
            },
          );

          NotificationHookService.addCriteriaFinalScores({
            criteriaScores: computeObject['criteriaScores'],
            opportunity: opportunityDataCurent.id,
            entityType: stageEntityType.id,
            entityObjectId: opportunityDataCurent.stage.id,
          });
        }

        // Updating existing stage's history.
        NotificationHookService.addStageHistory({
          oldStageData: {
            actionItem: stageData.actionItem,
            stage: opportunityDataCurent.stage,
            status: stageData.status,
            opportunity: opportunityDataCurent,
            computeObject: computeObject,
            enteringAt: moment().format(),
            exitingAt: moment().format(),
            community: opportunityDataCurent.community,
          },
        });

        // Adding new stage in history.
        NotificationHookService.addStageHistory({
          oldStageData: {
            stage: newStage,
            actionItem: newStage.actionItem,
            status: newStage.status,
            opportunity: opportunityDataCurent,
            computeObject: {},
            enteringAt: moment().format(),
            community: opportunityDataCurent.community,
          },
        });

        // Update existing Open action item statuses.
        await this.opportunityService.updateCurrentStageActionItemStatus(
          opportunityDataCurent,
          stageEntityType,
          oppoEntityType,
          communityId,
        );

        if (opportunityDataCurent.workflowId === data.workflow) {
          // Change Stage Notification
          this.opportunityService.generateUpdateStageNotification({
            opportunity: opportunityDataCurent,
            stageNotificationSettings: data.stageNotificationSettings,
            actionData,
            actorData,
            actionType: ACTION_TYPES.CHANGE_STAGE,
            oldStage: stageData,
            newStage,
          });
        } else {
          // Change Workflow Notification
          triggerOutput['oldWorkflow'] = opportunityDataCurent.workflow;
          const newWorkflow = (triggerOutput[
            'currentWorkflow'
          ] = await this.workflowService.getOneWorkflow({
            where: { id: data.workflow },
          }));
          this.opportunityService.generateUpdateStageNotification({
            opportunity: opportunityDataCurent,
            stageNotificationSettings: data.stageNotificationSettings,
            actionData,
            actorData,
            actionType: ACTION_TYPES.CHANGE_WORKFLOW,
            oldStage: stageData,
            newStage,
            oldWorkflow: opportunityDataCurent.workflow,
            newWorkflow,
          });
        }
      } else {
        const stageData = await this.stageService.getOneStage({
          where: { id: data.stage },
          relations: ['actionItem', 'status'],
        });
        const computeObject = await this.evaluationCriteriaService.getEvaluationsEntityScores(
          {
            entityObjectId: stageData.id,
            entityType: stageEntityType.id,
            opportunity: opportunityDataCurent.id,
            community: opportunityDataCurent.communityId,
          },
        );
        NotificationHookService.addStageHistory({
          oldStageData: {
            stage: stageData,
            actionItem: stageData.actionItem,
            status: stageData.status,
            opportunity: opportunityDataCurent,
            computeObject: computeObject,
            enteringAt: moment().format(),
            community: opportunityDataCurent.community,
          },
        });

        // Add Workflow Notification
        const newWorkflow = (triggerOutput[
          'currentWorkflow'
        ] = await this.workflowService.getOneWorkflow({
          where: { id: data.workflow },
        }));
        this.opportunityService.generateUpdateStageNotification({
          opportunity: opportunityDataCurent,
          stageNotificationSettings: data.stageNotificationSettings,
          actionData,
          actorData,
          actionType: ACTION_TYPES.ADD_WORKFLOW,
          newStage,
          newWorkflow,
        });
      }
      data['stageAttachmentDate'] = moment().format('YYYY-MM-DD');
      await this.opportunityService.addOpportunityStageData(
        data,
        opportunityDataCurent.id,
        opportunityDataCurent.community.id,
      );
      triggerOutput['opportunity'] = opportunityDataCurent;

      /**
       * Trigger Hook When Stage Changes
       */
      this.triggersHookService.triggerHook({
        output: {
          ...(triggerOutput['currentStage'] && {
            currentStage: triggerOutput['currentStage'].title,
          }),
          ...(triggerOutput['oldStage'] && {
            oldStage: triggerOutput['oldStage'].title,
          }),
          ...(triggerOutput['currentWorkflow'] && {
            currentWorkflow: triggerOutput['currentWorkflow'].title,
          }),
          ...(triggerOutput['oldWorkflow'] && {
            oldWorkflow: triggerOutput['oldWorkflow'].title,
          }),
          name: triggerOutput['opportunity'].title,
          id: triggerOutput['opportunity'].id,
          url:
            triggerOutput['opportunity'].community.url +
            '/idea/view/' +
            triggerOutput['opportunity'].id,
        },
        community: communityId,
        event: SubscriptionHookEvents.STAGE_CHANGE,
        filter: {
          ...(triggerOutput['opportunity'].challengeId && {
            challenge: triggerOutput['opportunity'].challengeId,
          }),
          ...(triggerOutput['currentWorkflow'] && {
            workflow: triggerOutput['currentWorkflow'].id,
          }),
          ...(triggerOutput['currentStage'] && {
            stage: triggerOutput['currentStage'].id,
          }),
        },
      });
    }
  }
}
