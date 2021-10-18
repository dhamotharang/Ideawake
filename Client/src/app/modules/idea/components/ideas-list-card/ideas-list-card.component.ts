import * as _ from 'lodash';
import * as moment from 'moment/moment';

import { AppState, STATE_TYPES } from '../../../../store';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  ENTITY_TYPE,
  MANAGE_ACTIONS,
  DisplayOptions,
  Utility
} from '../../../../utils';

import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  UtilService
} from '../../../../services';

import { ActivatedRoute } from '@angular/router';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from '../../../workflow/components';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { FORM_SUBMISSION } from '../../../../actions';
import { IdeaSummaryComponent } from '../idea-summary/idea-summary.component';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostIdeaComponent } from '../post-idea/post-idea.component';
import { Subscription } from 'rxjs';
import { ArchiveIdeaModalComponent } from '../archive-idea-modal/archive-idea-modal.component';

@Component({
  selector: 'app-ideas-list-card',
  templateUrl: './ideas-list-card.component.html',
  styleUrls: ['./ideas-list-card.component.scss']
})
export class IdeasListCardComponent implements OnInit, OnDestroy {
  currentUser = this.ngRedux.getState().userState;
  currentUserId = this.currentUser.user.id;
  communityId = this.currentUser.currentCommunityId;
  scrollDownDistance = 2;
  selectedView;
  appliedFilters: any[] = [];
  ideas;
  opportunityIds;
  ideaEntity;
  upvotes;
  upvoteCount;
  upvoteDetail;
  tagsData;
  followersData;
  commentCounts;
  topScores;
  count = 0;
  isLoading = true;
  isFilter = false;
  searchParams: any;
  currentCount = 0;
  defaultPage = { take: 28, skip: 0 };
  joinData = false;

  dateFrom = null;
  dateTo = null;

  timeFilter = false;
  opportunityFilter = false;
  sortOpportunityFilter = false;

  public notPosted = false;
  public toggleFilterVisibility = false;
  public filterOptions: DisplayOptions = {
    display: false,
    mobileRender: false,
    webRender: false
  };
  private sub: Subscription[] = [];
  exportFlag = false;
  paramAppliedFilters: {};
  updateFilters = false;
  isSavedView = true;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private opportunityApi: OpportunityApiService,
    private entityApi: EntityApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private route: ActivatedRoute,
    private util: UtilService
  ) {}

  async ngOnInit() {
    this.exportFlag = !!this.ngRedux.getState().userState
      .userCommunityPermissions.exportOpportunity;
    this.openIdeaModalFromUrl();
    this.ideaEntity = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
    const params = _.cloneDeep(this.route.snapshot.queryParams);
    this.appliedFilters = params.sideFilter
      ? JSON.parse(params.sideFilter)
      : {};
    this.dateFrom = !_.isEmpty(params.fromDate)
      ? moment(params.fromDate)
      : null;
    this.dateTo = !_.isEmpty(params.toDate) ? moment(params.toDate) : null;
    params.sideFilter = this.appliedFilters;
    this.searchParams = { ...params, ...this.defaultPage };
    this.applyFilters();
    this.getOpportunities();
    this.subscribeForNewPosting();
    this.toggleFilter();
  }

  fetchUpdatedFilters(updateFilters) {
    this.updateFilters = updateFilters;
  }

  setSelectedView(view) {
    this.selectedView = view ? view : undefined;
  }

  private async getOpportunities(isLoading = true) {
    this.isLoading = isLoading;

    this.fillNavigation(this.searchParams);

    const filters = this.applyFilters();

    const queryParams = this.util.cleanObject({
      ...filters.params,
      ...filters.parameters,
      community: this.communityId,
      isDeleted: false
    });

    this.paramAppliedFilters = queryParams;
    const res: any = await this.opportunityApi
      .getOpportunity(queryParams)
      .toPromise();

    this.isLoading = false;

    const data = _.get(res, 'response.data', []);
    this.opportunityIds = _.map(data, (idea) => idea.id);

    this.joinData
      ? (this.ideas = _.uniqBy(_.concat(this.ideas, data), 'id'))
      : (this.ideas = _.get(res, 'response.data', []));

    this.currentCount = this.ideas.length;
    this.count = _.get(res, 'response.count', 0);

    if (this.ideas.length) {
      this.getOpportunitiesData();
    }
    if (!this.isFilter && this.count === 0) {
      this.notPosted = true;
    } else {
      this.notPosted = false;
    }
  }

  getOpportunitiesData() {
    this.getOpportunitiesDetails();
    this.getOpportunitiesVisibiliy();
    this.getOpportunitiesExperienceSettings();
    this.getOpportunitiesPermissions();
  }

  private async getOpportunitiesDetails() {
    const res = await this.opportunityApi
      .getOpportunityDetails(this.opportunityIds, {
        upvoteData: 1,
        user: 1,
        workflow: 1,
        stage: 1,
        opportunityType: 1,
        commentCount: 1,
        upvoteCount: 1,
        tags: 1
      })
      .toPromise();

    this.extractDataDictionaries(res);
    this.extractData(res);
  }

  private async getOpportunitiesPermissions() {
    const res = await this.opportunityApi
      .getOpportunitiesPermissionSettings(this.opportunityIds)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(this.ideas, (idea) => idea.id === s.opportunityId).permissions =
          s.permissions)
    );
  }

  private extractDataDictionaries(res) {
    const upvoteData = _.get(res, 'response.upvoteData', {});
    const commentCounts = _.get(res, 'response.commentCounts', {});
    const upvoteCounts = _.get(res, 'response.upvotes', {});
    const tagsData = _.get(res, 'response.tagsData', {});

    if (this.joinData) {
      this.upvoteDetail = _.merge(this.upvoteDetail, upvoteData);
      this.commentCounts = _.merge(this.commentCounts, commentCounts);
      this.upvoteCount = _.merge(this.upvoteCount, upvoteCounts);
      this.tagsData = _.merge(this.tagsData, tagsData);
    } else {
      this.upvoteDetail = upvoteData;
      this.commentCounts = commentCounts;
      this.upvoteCount = upvoteCounts;
      this.tagsData = tagsData;
    }
  }

  private extractData(res) {
    _.forEach(_.get(res, 'response.data', []), (ideaDetail) => {
      const ideaRef = _.find(this.ideas, ['id', ideaDetail.id]);

      if (ideaDetail.user) {
        ideaRef.user = ideaDetail.user;
      }
      if (ideaDetail.workflow) {
        ideaRef.workflow = ideaDetail.workflow;
      }
      if (ideaDetail.stage) {
        ideaRef.stage = ideaDetail.stage;
      }
      if (ideaDetail.opportunityType) {
        ideaRef.opportunityType = ideaDetail.opportunityType;
      }
    });
  }

  private async getOpportunitiesVisibiliy() {
    const res = await this.opportunityApi
      .getOpportunitiesVisibilitySettings(this.opportunityIds)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) => (_.find(this.ideas, ['id', s.entityObjectId]).visibility = s)
    );
  }

  private async getOpportunitiesExperienceSettings() {
    const res = await this.roleAndPermissionsApi
      .getPermissionsByEntityAndObjectBulk({
        community: this.currentUser.currentCommunityId,
        entityData: _.map(this.opportunityIds, (id) => ({
          entityObjectId: id,
          entityType: this.ideaEntity.id
        }))
      })
      .toPromise();

    _.forEach(_.get(res, 'response', []), (ideaPerm) => {
      _.find(this.ideas, [
        'id',
        ideaPerm.entityObjectId
      ]).experienceSettings = ideaPerm;
    });
  }

  subscribeForNewPosting() {
    this.sub.push(
      this.ngRedux.select(STATE_TYPES.formSubmitted).subscribe((state: any) => {
        const isNewSubmission = _.get(
          state,
          'latestSubmission.opportunity',
          false
        );
        if (isNewSubmission) {
          this.searchParams = { ...this.searchParams, ...this.defaultPage };
          this.currentCount = 0;
          this.joinData = false;
          this.getOpportunities(false);
          this.ngRedux.dispatch({
            type: FORM_SUBMISSION,
            latestSubmission: { opportunity: false }
          });
        }
      })
    );
  }

  applyFilters() {
    const params = _.cloneDeep(this.searchParams);
    let parameters: any = {};
    if (params.sideFilter) {
      this.isFilter = true;
      parameters = params.sideFilter;
      parameters.workflow = _.get(parameters.workflow, 'id');
      parameters.stage = _.get(parameters.stage, 'id');
      parameters.challenge = _.get(parameters.challenge, 'id');
      parameters.opportunityTypes = _.map(parameters.opportunityTypes, 'id');
      parameters.statuses = _.map(parameters.statuses, 'id');
      parameters.tags = _.map(parameters.tags, 'id');
      if (parameters.challenges) {
        const challenges = _.cloneDeep(parameters.challenges);
        parameters.challenges = [];
        challenges.forEach((challenge) => {
          parameters.challenges.push(challenge.id);
        });
      }
      delete parameters.sideFilter;
    }
    return { params, parameters };
  }

  cardActions(event, opportunity) {
    switch (event.action) {
      case MANAGE_ACTIONS.edit:
        this.editOpportuntiyModal(opportunity);
        break;
      case MANAGE_ACTIONS.settings:
        this.editOpportunitySettingsModal(opportunity);
        break;
      case MANAGE_ACTIONS.workflow:
        this.editOpportunityWorkflow(opportunity);
        break;
      case MANAGE_ACTIONS.stage:
        this.openChangeStage(opportunity, event.data);
        break;
      case MANAGE_ACTIONS.archive:
        this.openArchiveModal(opportunity);
        break;
    }
  }

  private openArchiveModal(idea) {
    const modalRef = this.modalService.open(ArchiveIdeaModalComponent);
    modalRef.componentInstance.idea = idea;
    modalRef.componentInstance.archive.subscribe(() => {
      modalRef.close();
      this.archiveIdea(idea);
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
      this.joinData = true;
      this.getOpportunities(false);
    });
    modalRef.componentInstance.followerData = this.followersData;
  }

  private editOpportuntiyModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.edit;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      // this.getOpportunitiesData();
      this.getOpportunities(false);
    });
  }

  private editOpportunitySettingsModal(idea) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.ideaId = idea.id;
    modalRef.componentInstance.tab = MANAGE_ACTIONS.settings;
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getOpportunitiesData();
      // this.getOpportunitiesAttachment();
    });
  }

  private editOpportunityWorkflow(idea) {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = idea;
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.followerData = this.followersData;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.joinData = true;
      this.getOpportunities(false);
    });
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  fillNavigation(params) {
    const queryParams = _.cloneDeep(params);
    delete queryParams.take;
    delete queryParams.skip;
    queryParams.sideFilter = JSON.stringify(queryParams.sideFilter);
    this.util.navigateTo(queryParams);
  }

  changePage() {
    if (this.currentCount >= this.count) {
      return false;
    }
    const page = { take: 8, skip: this.currentCount };
    this.searchParams = { ...this.searchParams, ...page };
    this.joinData = true;
    this.getOpportunities();
  }

  openIdeaModalFromUrl() {
    const params = _.cloneDeep(this.route.snapshot.queryParams);
    const ideaId = parseInt(params.oid, 10);
    if (ideaId) {
      this.openSummaryModal(ideaId);
      return false;
    }
  }

  private openSummaryModal(ideaId) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      size: 'xl'
    });

    modalRef.componentInstance.ideaId = ideaId;
    modalRef.componentInstance.changeRef.detectChanges();
    modalRef.componentInstance.archive.subscribe((response) => {
      this.archiveIdea(response);
    });
    modalRef.componentInstance.closed.subscribe(() => {
      this.getOpportunitiesData();
      // this.getOpportunitiesAttachment();
    });

    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.route.snapshot.queryParams };
        delete p.oid;
        this.util.navigateTo(p);
        this.modalService.dismissAll();
      }
    );
  }

  updateSummaryParams(idea) {
    this.openSummaryModal(idea.id);
    const p = { ...this.route.snapshot.queryParams, oid: idea.id };
    this.util.navigateTo(p);
  }

  openPostIdea() {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modalRef = modalRef;
  }

  archiveIdea(idea) {
    this.opportunityApi.archiveOpportunity(idea.id).subscribe(
      (res: any) => {
        this.notifier.showInfo(`${idea.title} has been successfully archived`, {
          positionClass: 'toast-bottom-right'
        });
        const index = this.ideas.findIndex((r) => r.id === idea.id);
        this.ideas.splice(index, 1);
        this.count = this.count - 1;
      },
      (err) => this.notifier.showInfo('Something Went Wrong')
    );
  }

  sortFilter(filter) {
    this.sortOpportunityFilter = true;
    const params = {
      sortBy: filter.sortBy,
      sortType: filter.sortType
    };
    this.searchParams = {
      ...this.searchParams,
      ...params,
      ...this.defaultPage
    };
    this.getOpportunities();
  }

  dateFilter(value) {
    this.isFilter = true;
    this.timeFilter = value.startDate && value.endDate ? true : false;
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
    this.searchParams = {
      ...this.searchParams,
      ...params,
      ...this.defaultPage
    };
    this.getOpportunities();
  }

  setSavedView(view) {
    this.isSavedView = view;
    if (this.deepCheckEmptyObject(this.appliedFilters)) {
      this.isSavedView = true;
    }
  }

  filterOpportunities(event) {
    this.opportunityFilter = this.deepCheckEmptyObject(event) ? false : true;
    if (_.isEmpty(event.tags)) {
      delete event.tags;
    }
    if (_.isEmpty(event.opportunityTypes)) {
      delete event.opportunityTypes;
    }
    this.appliedFilters = _.cloneDeep(event);
    this.isFilter = true;
    const params = _.cloneDeep(event);
    if (event.workflow) {
      params.workflow = _.get(params.workflow, 'id');
    }
    if (event.stage) {
      params.stage = _.get(params.stage, 'id');
    }
    if (event.challenge) {
      params.challenge = _.get(params.challenge, 'id');
    }

    params.opportunityTypes = _.map(params.opportunityTypes, 'id');
    params.statuses = _.map(params.statuses, 'id');
    params.tags = _.map(params.tags, 'id');
    this.searchParams = { ...this.searchParams, ...{ sideFilter: event } };
    this.currentCount = 0;
    this.joinData = false;
    this.ideas = null;
    this.getOpportunities();
  }
  deepCheckEmptyObject(obj) {
    return Object.values(obj).every((value) => {
      if (value === undefined) return true;
      else if (
        (value instanceof Array || value instanceof Object) &&
        _.isEmpty(value)
      )
        return true;
      else return false;
    });
  }

  public toggleFilter(): void {
    this.filterOptions.display = !this.filterOptions.display;
    this.onResize();
  }
  @HostListener('window:resize')
  onResize(): void {
    this.filterOptions = Utility.setDisplayOptions(this.filterOptions);
  }
  ngOnDestroy() {
    if (this.sub && this.sub.length) {
      this.sub.forEach((x) => x && x.unsubscribe());
    }
  }
}
