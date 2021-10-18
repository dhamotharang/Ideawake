import { get, isEmpty, first } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LOAD_SELECTED_IDEA_FILES } from '../../../../actions';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  UtilService,
  WorkflowApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTION_ITEM_ABBREVIATIONS,
  ENTITY_TYPE,
  IDEA_TABS
} from '../../../../utils';

@Component({
  selector: 'app-idea-page-container',
  templateUrl: './idea-page-container.component.html',
  styleUrls: ['./idea-page-container.component.scss']
})
export class IdeaPageContainerComponent implements OnInit {
  queryParams: any = this.route.snapshot.queryParams;
  tabs = IDEA_TABS;
  tab;
  entityType;
  ideaId;
  ideaDetail;
  idea;
  upvotes;
  closeResult: string;
  commentCount;
  topScore;
  commentsCount = 0;
  userOpportunityPermissions;
  workflow;
  followersData;
  stageAssignees;
  stageStats;
  permissionsData;
  upvoteDetail;
  ideaUpvoters;
  stageAssignmentSettings;

  constructor(
    private route: ActivatedRoute,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private opportunityApi: OpportunityApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private notifier: NotificationService,
    private entityApiService: EntityApiService,
    public util: UtilService,
    private workflowApiService: WorkflowApiService
  ) {}

  async ngOnInit() {
    this.entityType = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
    this.route.params.subscribe((params) => {
      this.tab = this.queryParams.tab || IDEA_TABS.summary.key;
      this.ideaId = parseInt(params.id, 10);
      this.loadIdeaDetail();
      this.getExperienceSettings();
      if (this.idea.stage) {
        this.getStageAssignees();
        this.getStageCompletionData();
        this.getStageAssignmentSettings();
      }
    });
  }
  private getExperienceSettings() {
    const permissionParams = {
      entityType: this.entityType.id,
      entityObjectId: this.ideaId,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.roleAndPermissionsApi
      .getPermissionsByEntityTypeAndObjectId(permissionParams)
      .subscribe((res: any) => {
        this.permissionsData = first(res.response);
      });
  }
  private getUserOpportunityPermissions() {
    this.roleAndPermissionsApi
      .getUserPermissionsInOpportunity(this.ideaId)
      .subscribe((res: any) => {
        this.userOpportunityPermissions = res.response;
        const switchTab = isEmpty(this.queryParams.scrollTo) ? true : false;
        if (
          this.userOpportunityPermissions &&
          this.userOpportunityPermissions.viewStageSpecificTab &&
          switchTab
        ) {
          const currentTool = get(this.idea, 'stage.actionItem.abbreviation');
          if (currentTool === ACTION_ITEM_ABBREVIATIONS.REFINEMENT) {
            this.switchTab(this.tabs.moreInfo.key);
          } else if (currentTool === ACTION_ITEM_ABBREVIATIONS.SCORECARD) {
            this.switchTab(this.tabs.questions.key);
          }
        }
      });
  }

  private updateViewCount() {
    this.opportunityApi.updateViewCount(this.idea.id).subscribe();
  }

  private loadIdeaDetail() {
    this.ideaDetail = this.route.snapshot.data.ideaDetails.response;

    if (!this.ideaDetail.data[0]) {
      this.router.navigateByUrl('/error/access-denied');
    }

    this.idea = this.ideaDetail.data[0];
    this.upvotes = this.ideaDetail.upvotes;
    this.upvoteDetail = this.ideaDetail.upvoteData;
    this.ideaUpvoters = this.upvoteDetail[this.idea.id];
    this.commentCount = this.ideaDetail.commentCounts;
    this.topScore = this.ideaDetail.topScores || {};
    this.followersData = this.ideaDetail.followersData;
    this.updateViewCount();

    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: this.idea.opportunityAttachments
    });
    this.getUserOpportunityPermissions();
  }

  async getIdea() {
    this.ideaDetail = await this.opportunityApi
      .getOpportunityOld({
        id: this.idea.id,
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .toPromise()
      .then((res: any) => res.response);

    this.idea = this.ideaDetail.data[0];
    this.upvotes = this.ideaDetail.upvotes;
    this.commentCount = this.ideaDetail.commentCounts;
    this.topScore = this.ideaDetail.topScores || {};
    this.followersData = this.ideaDetail.followersData;

    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: this.idea.opportunityAttachments
    });
    this.getUserOpportunityPermissions();
    if (this.idea.stage) {
      this.getStageAssignees();
      this.getStageCompletionData();
    }
  }

  switchTab(event) {
    this.tab = event;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: event }
    });
  }

  updateIdea() {
    this.getIdea();
  }

  archiveIdea() {
    this.opportunityApi.archiveOpportunity(this.idea.id).subscribe(
      (res: any) => {
        this.router.navigateByUrl('/idea/cards');
        this.notifier.showInfo(
          `${this.idea.title} has been successfully archived`,
          {
            positionClass: 'toast-bottom-right'
          }
        );
      },
      () => this.notifier.showInfo('Something Went Wrong')
    );
  }

  private getStageAssignees() {
    this.opportunityApi
      .getCurrentStageAssignees(this.idea.id)
      .subscribe((res: any) => {
        this.stageAssignees = res.response;
      });
  }

  private getStageCompletionData() {
    this.opportunityApi
      .getStageCompletionStats(this.idea.id)
      .subscribe((res: any) => {
        this.stageStats = res.response;
      });
  }

  private getStageAssignmentSettings() {
    this.workflowApiService
      .getWorkflowStageSettings({
        entityType: this.entityType.id,
        entityObjectId: this.ideaId
      })
      .subscribe((res: any) => {
        const response = get(res, 'response', {});
        this.stageAssignmentSettings = get(response, 'stageAssignmentSettings');
      });
  }
}
