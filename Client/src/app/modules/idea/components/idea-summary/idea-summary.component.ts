import {
  ACTION_ITEM_ABBREVIATIONS,
  ENTITY_TYPE,
  IDEA_TABS
} from '../../../../utils';
import {
  ApiService,
  CustomFieldApiService,
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  SharedApi,
  UtilService,
  WorkflowApiService
} from '../../../../services';
import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  find,
  first,
  get,
  isEqual,
  map,
  nth,
  remove,
  sortedUniq,
  groupBy
} from 'lodash';

import { LOAD_SELECTED_IDEA_FILES } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-idea-summary',
  templateUrl: './idea-summary.component.html',
  styleUrls: ['./idea-summary.component.scss']
})
export class IdeaSummaryComponent implements OnInit, OnDestroy {
  @Input() ideaId;
  @Input() switchStageTab = true;

  @Output() update = new EventEmitter();
  @Output() updatedIdea = new EventEmitter();
  @Output() updatedIdeaAttachment = new EventEmitter();
  @Output() archive = new EventEmitter();
  @Output() closed = new EventEmitter();

  idea;
  upvotes;
  upvoteDetail;
  tags;
  followersData;
  commentCount;
  topScore;

  stageAssignees;
  stageStats;
  stageAssignmentSettings;
  files = [];
  attachmentIds = [];
  tabs = IDEA_TABS;
  tab = IDEA_TABS.summary.key;
  entity = ENTITY_TYPE.IDEA;
  upvoteAction = false;
  isUpvote = true;
  mouseLeaveFlag = false;
  entityType;
  upvoteData;
  ideaUpvoters;
  otherCount;
  objectKeys;
  userOpportunityPermissions;
  permissionsData;

  addLinkedOpportunity = false;
  showLinkedList = true;
  showMergedList = false;

  isLoading = true;
  workflow;

  customFields;
  opportunityTypeFieldsData;

  hide = true;

  notVisited = true;

  private sub: Subscription;

  linkedOpportunties = [];
  linkedOppoGrouped;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private sharedApi: SharedApi,
    private router: Router,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private entityApi: EntityApiService,
    private opportunityApi: OpportunityApiService,
    private customFieldApi: CustomFieldApiService,
    public changeRef: ChangeDetectorRef,
    public util: UtilService,
    private workflowApiService: WorkflowApiService
  ) {}

  private async loadIdeaDetail() {
    this.isLoading = true;
    const ideaDetail = await this.opportunityApi
      .getOpportunityOld({
        id: this.ideaId,
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .toPromise()
      .then((res: any) => res.response);

    if (!ideaDetail.data.length) {
      this.router.navigateByUrl('/error/access-denied');
      this.closed.emit(true);
      this.modalService.dismissAll();
      return;
    }
    this.idea = ideaDetail.data[0];
    this.upvotes = ideaDetail.upvotes;
    this.commentCount = ideaDetail.commentCounts;
    this.topScore = ideaDetail.topScores || {};
    this.followersData = ideaDetail.followersData;
    this.tags = ideaDetail.tagsData;
    this.upvoteDetail = ideaDetail.upvoteData;
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: ideaDetail.opportunityAttachments
    });
    this.ideaUpvoters = this.upvoteDetail[this.ideaId];
    this.getUserOpportunityPermissions();
    this.processDescription();
    this.subscribeSelectedFiles();
    this.updateViewCount();
    this.attachmentIds = sortedUniq(
      map(this.idea.opportunityAttachments, 'id')
    );
  }

  ngOnInit() {
    this.objectKeys = Object.keys;
    this.loadIdeaDetail();
    this.getCustomFieldsWithData();
    this.getUpvoteStatus();
    this.getStageAssignees();
    this.getStageCompletionData();
    this.getIdeaEntity();
    this.getExperienceSettings();
    this.getStageAssignmentSettings();
    this.getLinkedOpportunities();
  }

  hideLinkOption(value) {
    this.addLinkedOpportunity = !value;
  }

  updateLinkedOppoList(value) {
    if (value) {
      this.getLinkedOpportunities();
    }
  }

  private getLinkedOpportunities() {
    this.opportunityApi
      .getLinkedOpportunities(this.ideaId)
      .subscribe((res: any) => {
        if (res.response) {
          this.linkedOpportunties = res.response.linkedOpportunities;
          const linkedOppo = map(this.linkedOpportunties, (val) => {
            val.opportunityTypeName =
              val.linkedOpportunity.opportunityType.name;
            return val;
          });

          this.linkedOppoGrouped = groupBy(linkedOppo, 'opportunityTypeName');
        }
      });
  }

  private getUpvoteStatus() {
    this.sharedApi
      .getIdeaUpvoteStatus(
        this.ideaId,
        this.ngRedux.getState().userState.currentCommunityId
      )
      .subscribe((res: any) => {
        if (res.response) {
          this.upvoteData = res.response;
          this.isUpvote = true;
          this.mouseLeaveFlag = true;
        } else {
          this.isUpvote = false;
        }
      });
  }

  private getIdeaEntity() {
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  private subscribeSelectedFiles() {
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: this.idea.opportunityAttachments
    });

    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.files = files.ideaFiles.selected;
      });
  }

  private getUserOpportunityPermissions() {
    this.roleAndPermissionsApi
      .getUserPermissionsInOpportunity(this.ideaId)
      .subscribe((res: any) => {
        this.userOpportunityPermissions = res.response;
        if (
          this.userOpportunityPermissions &&
          this.userOpportunityPermissions.viewStageSpecificTab &&
          this.switchStageTab
        ) {
          const currentTool = get(this.idea, 'stage.actionItem.abbreviation');
          if (currentTool === ACTION_ITEM_ABBREVIATIONS.REFINEMENT) {
            this.switchTab(this.tabs.moreInfo.key);
          } else if (currentTool === ACTION_ITEM_ABBREVIATIONS.SCORECARD) {
            this.switchTab(this.tabs.questions.key);
          }
        }
        this.isLoading = false;
      });
  }

  private getCustomFieldsWithData() {
    this.customFieldApi
      .getOpportunityCustomField({
        opportunity: this.ideaId,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe(async (res: any) => {
        if (res.response.length) {
          const userCustomFieldPermissions = await this.getCustomFieldPermissions(
            map(res.response, 'field.id')
          );
          this.customFields = map(res.response, (field) => ({
            ...field.field,
            opportunityDataId:
              field.field.opportunityFieldData &&
              field.field.opportunityFieldData.length
                ? first(field.field.opportunityFieldData).id
                : null,
            permissions: find(userCustomFieldPermissions, [
              'customFieldId',
              field.field.id
            ]).permissions
          }));
        } else {
          this.customFields = [];
        }
      });
  }

  private getCustomFieldPermissions(customFieldIds: []) {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCustomFields(this.ideaId, customFieldIds)
      .toPromise()
      .then((res: any) => res.response);
  }

  async processDescription() {
    this.idea.descriptionHtml = '';
    this.idea.descriptionHtml = await this.util.processMentions(
      this.idea.description,
      this.idea.mentions,
      this.idea.tags
    );
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
        this.permissionsData = res.response[0];
      });
  }

  private updateViewCount() {
    this.opportunityApi.updateViewCount(this.ideaId).subscribe((res) =>
      setTimeout(() => {
        this.idea.viewCount = parseInt(this.idea.viewCount, 10);
        this.idea.viewCount++;
      }, 3000)
    );
  }

  bookmarkIdea() {
    const currentUserId = this.ngRedux.getState().userState.user.id;
    if (this.idea.bookmark) {
      this.apiService
        .delete(
          `/bookmark/user/${currentUserId}/bookmark/${this.idea.bookmarkId}`
        )
        .subscribe((result: any) => {
          if (result.statusCode === 200) {
            this.idea.bookmarkId = '';
            this.idea.bookmark = false;
            this.notifier.showInfo('Alerts.BookmarkRemove', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    } else {
      this.apiService
        .post('/bookmark', {
          community: this.ngRedux.getState().userState.currentCommunityId,
          entityType: this.entityType.id,
          entityObjectId: this.ideaId,
          displayName: this.idea.title,
          url: `/idea/view/${this.ideaId}`,
          email: 'idea@idea.com',
          entity: 'idea'
        })
        .subscribe((res: any) => {
          this.idea.bookmarkId = res.response.id;
          if (res.statusCode === 200) {
            this.idea.bookmark = true;
            this.notifier.showSuccess('Alerts.BookmarkSuccess', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    }
  }

  upvoteIdea(isUpvote) {
    this.upvoteAction = true;
    if (isUpvote) {
      this.isUpvote = false;
      this.sharedApi
        .deleteUpvoteIdea(this.upvoteData.id)
        .subscribe((res: any) => {
          setTimeout(() => {
            this.upvoteAction = false;
          }, 200);
        });
    } else {
      const upvoteObject = {
        voteType: 'upvote',
        entityObjectId: this.ideaId,
        entityType: this.entityType.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      };
      this.isUpvote = true;
      this.sharedApi.upvoteIdea(upvoteObject).subscribe((res: any) => {
        this.upvoteData = res.response;
        this.mouseLeaveFlag = false;
        setTimeout(() => {
          this.upvoteAction = false;
        }, 200);
      });
    }
  }

  mouseEnter(div: string) {}

  mouseLeave(event) {
    if (this.isUpvote) {
      this.mouseLeaveFlag = true;
    }
  }

  close() {
    this.closed.emit(true);
    this.modalService.dismissAll();
  }

  teamUpdated(event) {
    this.update.emit(true);
  }

  gotoSearch() {
    this.router.navigateByUrl('/search');
    this.closed.emit(true);
    this.modalService.dismissAll();
  }

  async updateIdea() {
    const ideaDetail = await this.opportunityApi
      .getOpportunityOld({
        id: this.ideaId,
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .toPromise()
      .then((res: any) => res.response);

    this.idea = ideaDetail.data[0];
    this.upvotes = ideaDetail.upvotes;
    this.commentCount = ideaDetail.commentCounts;
    this.topScore = ideaDetail.topScores || {};
    this.followersData = ideaDetail.followersData;
    this.tags = ideaDetail.tagsData;

    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: ideaDetail.opportunityAttachments
    });
    this.updatedIdea.emit(this.idea);
    this.getUserOpportunityPermissions();
    this.getExperienceSettings();
    this.getCustomFieldsWithData();
    this.getStageAssignees();
    this.processDescription();
  }

  switchTab(event) {
    this.tab = event;
    if (this.tab === this.tabs.summary.key) {
      this.getCustomFieldsWithData();
      this.getStageAssignees();
      this.getStageCompletionData();
      this.getStageAssignmentSettings();
    }
  }

  removeUpvoter(data) {
    if (data.type === 'add') {
      this.ideaUpvoters = this.ideaUpvoters || [];
      this.ideaUpvoters.push(data.data);
      this.ideaUpvoters = [...this.ideaUpvoters];
    } else {
      this.ideaUpvoters = this.ideaUpvoters.filter(
        (value) => value.user.id !== data.user.id
      );
    }
  }

  ideaPage() {
    this.router.navigateByUrl(`/idea/view/${this.ideaId}`);
    this.closed.emit(true);
    this.modalService.dismissAll();
  }

  workflowList() {
    this.router.navigateByUrl(`/workflow/list`);
    this.closed.emit(true);
    this.modalService.dismissAll();
  }

  archiveIdea() {
    this.archive.emit(this.idea);
  }

  async updateSummaryCustomFieldData(fieldData) {
    this.opportunityTypeFieldsData = fieldData;
    remove(this.opportunityTypeFieldsData, (d) => !d.field);
    const params = {
      opportunity: this.ideaId,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    const data = {
      data: this.opportunityTypeFieldsData
    };

    try {
      await this.customFieldApi
        .updateCustomFieldsData(params, data)
        .toPromise();
      this.getStageAssignees();
      this.getStageCompletionData();
      this.getCustomFieldsWithData();
    } catch (e) {
      console.log(e);
    }
  }

  private getStageAssignees() {
    this.opportunityApi
      .getCurrentStageAssignees(this.ideaId)
      .subscribe((res: any) => {
        this.stageAssignees = res.response;
      });
  }

  private getStageCompletionData() {
    this.opportunityApi
      .getStageCompletionStats(this.ideaId)
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

  editIdeaImages() {
    this.opportunityApi
      .updateOpportunity(this.ideaId, {
        stopNotifications: true,
        title: this.idea.title,
        attachments: this.files
      })
      .subscribe();
  }

  async ngOnDestroy() {
    if (this.sub) {
      this.updatedIdea.emit(this.idea);
      this.sub.unsubscribe();
    }
  }

  toggleAddLink() {
    this.addLinkedOpportunity = !this.addLinkedOpportunity;
  }

  toggleShowLinks() {
    this.showLinkedList = !this.showLinkedList;
  }

  toggleShowMerged() {
    this.showMergedList = !this.showMergedList;
  }

  renderIdeaUpvoters(ideaUpvoters) {
    let str = '';
    if (ideaUpvoters) {
      const firstVoter = first(ideaUpvoters);
      if (firstVoter) {
        str += firstVoter.user.firstName + ' ' + firstVoter.user.lastName;
        if (ideaUpvoters.length === 2) {
          str += ' and ';
        } else {
          str += ', ';
        }

        const secondVoter = nth(ideaUpvoters, 1);
        if (secondVoter) {
          str += secondVoter.user.firstName + ' ' + secondVoter.user.lastName;
          if (ideaUpvoters.length === 3) {
            str += ' and ';
          } else {
            str += ', ';
          }

          const thirdVoter = nth(ideaUpvoters, 2);
          if (thirdVoter) {
            str += thirdVoter.user.firstName + ' ' + thirdVoter.user.lastName;
          }
          if (ideaUpvoters.length > 3) {
            const remaining = ideaUpvoters.length - 3;
            str +=
              ' and ' + remaining + ' other' + (remaining === 1 ? '' : 's');
          }
        }
      }
    }
    return str;
  }
}
