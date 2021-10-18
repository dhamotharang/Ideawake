import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  UtilService,
  WorkflowApiService
} from 'src/app/services';
import { AppState } from 'src/app/store';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  ACTION_ITEM_ABBREVIATIONS,
  ACTION_ITEM_ICONS,
  ENTITY_TYPE,
  MANAGE_ACTIONS
} from 'src/app/utils';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostIdeaComponent } from '../post-idea/post-idea.component';
import { IdeaSummaryComponent } from '../idea-summary/idea-summary.component';
import { ArchiveIdeaModalComponent } from '../archive-idea-modal/archive-idea-modal.component';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from 'src/app/modules/workflow/components';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';

@Component({
  selector: 'app-ideas-list-pipeline',
  templateUrl: './ideas-list-pipeline.component.html',
  styleUrls: ['./ideas-list-pipeline.component.scss']
})
export class IdeasListPipelineComponent implements OnInit {
  stages = [];
  workflows = [];
  public currentUser = this.ngRedux.getState().userState;
  selectedWorkflow;
  totalOpportunities = 0;
  actionItems = ACTION_ITEM_ABBREVIATIONS;
  actionItemsIcon = ACTION_ITEM_ICONS;
  filter: any;
  public dateFrom = null;
  public dateTo = null;
  round = Math.round;
  commentCounts;
  upvoteCount;
  manageActions = MANAGE_ACTIONS;
  ideaEntity;
  showBottomActions = false;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private workflowApi: WorkflowApiService,
    private opportunityApi: OpportunityApiService,
    private util: UtilService,
    private route: ActivatedRoute,
    private notifier: NotificationService,
    private router: Router,
    private modalService: NgbModal,
    private entityApi: EntityApiService
  ) {}

  ngOnInit() {
    const params = _.cloneDeep(this.route.snapshot.queryParams);
    this.ideaEntity = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
    this.dateFrom = !_.isEmpty(params.fromDate)
      ? moment(params.fromDate)
      : null;
    this.dateTo = !_.isEmpty(params.toDate) ? moment(params.toDate) : null;
    this.filter = params;
    this.getCommunityWorkflows();
  }

  getCommunityWorkflows() {
    const params = {
      community: this.currentUser.currentCommunityId,
      isDeleted: false
    };
    this.workflowApi.getAllCommunityWorkflows(params).subscribe((res: any) => {
      this.workflows = res.response;

      if (this.filter.workflowId) {
        this.selectedWorkflow = _.find(this.workflows, {
          id: +this.filter.workflowId
        });

        if (this.selectedWorkflow) {
          this.getWorkflowStages();
        }
      } else if (this.workflows.length === 1) {
        this.selectedWorkflow = _.first(this.workflows);
        this.getWorkflowStages();
      }
    });
  }

  getWorkflowStages() {
    this.workflowApi
      .getAllStages({
        workflow: this.selectedWorkflow.id,
        isDeleted: false,
        withSettings: true
      })

      .subscribe((res: any) => {
        this.stages = res.response;
        this.getOpportunities();
      });
  }

  async getStageOpportunities(stage) {
    stage.queryParams.search = this.filter.search;
    const res: any = await this.opportunityApi
      .getOpportunity(stage.queryParams)
      .toPromise();
    stage['opportunities'] = [...stage['opportunities'], ...res.response.data];
    stage['count'] = res.response.count;
    this.calculatetotalOpportunities();
    if (stage.opportunities.length) {
      const opportunityIds = _.map(stage.opportunities, (idea) => idea.id);
      this.getOpportunitiesCompletionStats(stage.opportunities, opportunityIds);
      this.getOpportunitiesDetails(stage.opportunities, opportunityIds);
      this.getOpportunitiesPermissions(stage.opportunities, opportunityIds);
    }
  }

  onActionDrop(e, type) {
    const opportunity = _.clone(
      e.previousContainer.data.opportunities[e.previousIndex]
    );

    this.cardActions({ action: type }, opportunity, e.previousContainer.data);
  }

  cardActions(event, opportunity, containerData) {
    switch (event.action) {
      case MANAGE_ACTIONS.workflow:
        _.get(opportunity, 'permissions.changeOpportunityWorkflow')
          ? this.editOpportunityWorkflow(opportunity)
          : null;
        break;
      case MANAGE_ACTIONS.archive:
        _.get(opportunity, 'permissions.softDeleteOpportunity')
          ? this.openArchiveModal(opportunity, containerData)
          : null;
        break;
      case MANAGE_ACTIONS.edit:
        this.editOpportuntiyModal(opportunity);
        break;
      case MANAGE_ACTIONS.stage:
        _.get(opportunity, 'permissions.changeOpportunityStage')
          ? this.openChangeStage(opportunity, event.data)
          : null;
        break;
      case MANAGE_ACTIONS.settings:
        this.editOpportunitySettingsModal(opportunity);
        break;
    }
  }

  private editOpportunitySettingsModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.settings;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getOpportunities();
    });
  }

  async openChangeStage(opportunity, stage) {
    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = opportunity;
    modalRef.componentInstance.selectedStage = stage;
    modalRef.componentInstance.workFlowSelected = opportunity.workflow;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunities();
    });
  }

  private editOpportuntiyModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.edit;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getOpportunities();
    });
  }

  private openArchiveModal(idea, containerData) {
    const modalRef = this.modalService.open(ArchiveIdeaModalComponent);
    modalRef.componentInstance.idea = idea;
    modalRef.componentInstance.archive.subscribe(() => {
      modalRef.close();
      this.archiveIdea(idea, containerData);
    });
  }

  archiveIdea(idea, containerData) {
    this.opportunityApi.archiveOpportunity(idea.id).subscribe(
      (res: any) => {
        this.notifier.showInfo(`${idea.title} has been successfully archived`, {
          positionClass: 'toast-top-center'
        });
        const index = containerData.opportunities.findIndex(
          (r) => r.id === idea.id
        );
        containerData.opportunities.splice(index, 1);
        containerData.count = containerData.count - 1;
      },
      (err) => this.notifier.showInfo('Something Went Wrong')
    );
  }

  private editOpportunityWorkflow(idea) {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = idea;
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunities();
    });
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  private async getOpportunitiesPermissions(
    opportunities,
    opportunityIds: any[]
  ) {
    const res = await this.opportunityApi
      .getOpportunitiesPermissionSettings(opportunityIds)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(
          opportunities,
          (idea) => idea.id === s.opportunityId
        ).permissions = s.permissions)
    );
  }

  private async getOpportunitiesCompletionStats(
    opportunities,
    opportunityIds: []
  ) {
    const res = await this.opportunityApi
      .getOpportunitiesCompletionData({ opportunityIds })
      .toPromise();

    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(
          opportunities,
          (idea) => idea.id === s.opportunityId
        ).completionStats = s)
    );
  }

  private async getOpportunityCompletionStats(opportunity) {
    const res = await this.opportunityApi
      .getStageCompletionStats(opportunity.id)
      .toPromise();
    const stats = _.get(res, 'response');

    opportunity.completionStats = stats;
  }

  private async getOpportunitiesDetails(opportunities, opportunityIds: any[]) {
    const queryParams = {
      opportunityUsers: 1,
      workflow: 1,
      stage: 1,
      opportunityType: 1,
      commentCount: 1,
      upvoteCount: 1,
      tags: 1,
      stageAssignmentSettings: 1
    };
    const res = await this.opportunityApi
      .getOpportunityDetails(opportunityIds, queryParams)
      .toPromise();
    const response = _.get(res, 'response', {});
    this.setStageCompletionDate(opportunities, response, opportunityIds);
    this.extractDataDictionaries(response);
    this.extractData(opportunities, response);
  }

  private extractData(opportunities, res) {
    _.forEach(_.get(res, 'data', []), ({ id, workflow, stage }) => {
      const ideaRef = _.find(opportunities, ['id', id]);

      if (workflow) {
        ideaRef.workflow = workflow;
      }
      if (stage) {
        ideaRef.stage = stage;
      }
    });
  }

  private extractDataDictionaries(res: {}) {
    this.commentCounts = _.get(res, 'commentCounts', {});
    this.upvoteCount = _.get(res, 'upvotes', {});
  }

  private setStageCompletionDate(opportunities, response, opportunityIds = []) {
    const stageSettings = _.get(response, 'stageAssignmentSettings', {});
    _.forEach(opportunities, (idea) => {
      const aDay = idea.stageAttachmentDate;
      if (aDay) {
        if (stageSettings[idea.id]) {
          const totalExpiryDays = stageSettings[idea.id].stageTimeLimit || 0;
          const d = moment(aDay).add(totalExpiryDays, 'days');
          const now = moment();
          idea.stageRemainingDays = d.diff(now, 'days');
          idea.stageDueDate = {
            year: d.year(),
            month: d.month() + 1,
            day: d.date()
          };
        } else {
          if (opportunityIds.findIndex((i) => i === idea.id) !== -1) {
            idea.stageRemainingDays = undefined;
          }
        }
      }
    });
  }

  getOpportunities() {
    this.fillNavigation(this.filter);
    this.stages.forEach((stage) => {
      stage.queryParams = {
        isDeleted: false,
        skip: 0,
        stage: stage.id,
        take: 10,
        workflow: this.selectedWorkflow.id,
        search: this.filter.search,
        sortBy: this.filter.sortBy,
        sortType: this.filter.sortType,
        fromDate: this.filter.fromDate,
        toDate: this.filter.toDate
      };
      stage['opportunities'] = [];
      this.getStageOpportunities(stage);
    });
  }

  loadMoreOpportunities(stage) {
    stage.queryParams.skip = stage.queryParams.skip + stage.queryParams.take;
    this.getStageOpportunities(stage);
  }

  onSearch($event) {
    this.filter.search = $event;
    this.getOpportunities();
  }

  dateFilter(value) {
    const params: any = {
      fromDate: null,
      toDate: null
    };
    if (value.startDate) {
      params.fromDate = moment()
        .year(value.startDate.year)
        .month(value.startDate.month)
        .date(value.startDate.day)
        .format('YYYY-MM-DD');
    }
    if (value.endDate) {
      params.toDate = moment()
        .year(value.endDate.year)
        .month(value.endDate.month)
        .date(value.endDate.day)
        .format('YYYY-MM-DD');
    }
    this.filter = {
      ...this.filter,
      ...params
    };
    this.getOpportunities();
  }

  sortFilter(filter) {
    const params = {
      sortBy: filter.sortBy,
      sortType: filter.sortType
    };
    this.filter = {
      ...this.filter,
      ...params
    };
    this.getOpportunities();
  }

  selectWorkflow(workflow) {
    this.selectedWorkflow = workflow;
    if (!_.isEmpty(this.selectedWorkflow)) {
      this.filter.workflowId = _.get(this.selectedWorkflow, 'id');
    }
    this.fillNavigation(this.filter);
    this.getWorkflowStages();
  }

  fillNavigation(params) {
    const queryParams = _.cloneDeep(params);
    this.util.navigateTo(queryParams);
  }

  calculatetotalOpportunities() {
    let opportunitiesCount = 0;
    this.stages.forEach((stage) => {
      opportunitiesCount += +stage.opportunities.length;
    });
    this.totalOpportunities = opportunitiesCount;
  }

  drop(event: CdkDragDrop<any>, stage) {
    if (event.previousContainer !== event.container) {
      const currentOpportunity = _.clone(
        event.previousContainer.data.opportunities[event.previousIndex]
      );

      if (!_.get(currentOpportunity, 'permissions.changeOpportunityStage')) {
        return;
      }

      const newStage = event.container.data;
      const opportunity: any = {
        workflow: this.selectedWorkflow.id,
        stage: newStage.id,
        stageNotificationSettings: stage.stageNotificationSettings,
        assigneeSettings: stage.assigneeSettings,
        stageActivityVisibilitySettings: stage.stageActivityVisibilitySettings,
        stageAssignmentSettings: stage.stageAssignmentSettings
      };
      transferArrayItem(
        event.previousContainer.data.opportunities,
        event.container.data.opportunities,
        event.previousIndex,
        event.currentIndex
      );

      // Update Counts
      event.previousContainer.data.count -= 1;
      event.container.data.count += 1;

      this.opportunityApi
        .updateOpportunity(currentOpportunity.id, {
          title: currentOpportunity.title,
          stopNotifications: true,
          ...opportunity
        })
        .subscribe(
          (res) => {
            this.notifier.showInfo('Alerts.StageUpdated', {
              positionClass: 'toast-top-center'
            });
            let opportunity =
              event.container.data.opportunities[event.currentIndex];
            this.getOpportunityCompletionStats(opportunity);

            const opportunityIds = [currentOpportunity.id];
            this.getOpportunitiesDetails(stage.opportunities, opportunityIds);
            this.getOpportunitiesPermissions(
              stage.opportunities,
              opportunityIds
            );
          },
          (err) => {
            // In case of error remove from current container
            event.container.data.opportunities.splice(event.currentIndex, 1);
            // In case of error push to previous container
            event.previousContainer.data.opportunities.splice(
              event.previousIndex,
              0,
              currentOpportunity
            );

            // Revert Counts
            event.previousContainer.data.count += 1;
            event.container.data.count -= 1;

            this.notifier.showError('Something Went Wrong');
          }
        );
    }
  }

  openPostIdea() {
    this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
  }

  openSummaryModal(idea) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      windowClass: 'ideaSummaryModal'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.changeRef.detectChanges();

    modalRef.componentInstance.closed.subscribe(() => {
      this.getOpportunityCompletionStats(idea);
    });
    modalRef.componentInstance.archive.subscribe((idea) => {});
  }

  onDrag() {
    let elements = document.getElementsByClassName('cdk-drag-preview');
    if (elements.length) {
      const previewElem = _.first(elements);
      let rotateAngle = '5';
      /* if (delta && delta.x < 0) {
        rotateAngle = '-5';
      } */
      previewElem.style.transform = `${previewElem.style.transform} rotate(${rotateAngle}deg)`;
    }
  }

  editStage(stage) {
    this.router.navigateByUrl(
      `/workflow/${this.selectedWorkflow.id}/stage/edit/${stage.id}`
    );
  }

  viewInTable(stage) {
    const params = {
      challenge: {},
      customFields: [],
      statuses: [],
      workflow: {
        id: this.selectedWorkflow.id,
        title: this.selectedWorkflow.title
      },
      stage: { id: stage.id, title: stage.title }
    };

    const uri = JSON.stringify(params);
    this.router.navigate(['/idea/table'], {
      queryParams: {
        sideFilter: uri
      }
    });
  }

  clearSelectedWorkflow() {
    this.selectedWorkflow = undefined;
  }

  onDragStart() {
    this.showBottomActions = true;
  }

  onDragEnd() {
    this.showBottomActions = false;
  }
}
