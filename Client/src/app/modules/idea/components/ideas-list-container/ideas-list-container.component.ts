import * as _ from 'lodash';
import * as moment from 'moment/moment';

import {
  ACTION_ITEM_ABBREVIATIONS,
  ACTION_ITEM_ICONS,
  BULK_UPDATE_TYPES,
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE,
  IDEA_USERS,
  OPPORTUNITY_PERMISSIONS,
  EVALUATION_TYPES_ABBREVIATION
} from '../../../../utils';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from '../../../workflow/components';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  ReviewCriteriaApiService,
  UtilService,
  CustomFieldApiService
} from '../../../../services';

import { DisplayOptions, IDEA_LIST_DEFAULT_COLUMNS } from '../../../../utils';
import { Utility } from 'src/app/utils/utility';

import { ActivatedRoute } from '@angular/router';
import { AddUserComponent } from '../addUsers/addUsers.component';
import { IdeaSummaryComponent } from '../idea-summary/idea-summary.component';
import { NgRedux } from '@angular-redux/store';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PostIdeaComponent } from '../post-idea/post-idea.component';
import { interval, of, Subscription } from 'rxjs';
import {
  CLEAR_SELECTED_LIST,
  LOAD_SELECTED_COLUMN,
  UPDATE_SELECTED_LIST
} from 'src/app/actions';
import { delay, take } from 'rxjs/operators';
import { IdeaEvaluationsStageComponent } from '../idea-evaluations-stage/idea-evaluations-stage.component';
import { columnsTotalWidth } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-ideas-list-container',
  templateUrl: './ideas-list-container.component.html',
  styleUrls: ['./ideas-list-container.component.scss']
})
export class IdeasListContainerComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @ViewChild('categoryClick', { static: false }) click: ElementRef;
  @Input() hideFooter = true;
  currentUser = this.ngRedux.getState().userState;
  currentUserId = this.currentUser.user.id;
  communityId = this.currentUser.currentCommunityId;
  public selectGreaterThanOne = false;
  public showStageAnalytics = false;
  public viewIndividualResponses = false;
  public isSearching;
  public dateFrom = null;
  public dateTo = null;
  public ceiling: (x: number) => number;

  allChecked;
  closeResult: string;

  rows: any[] = [];
  appliedFilters: any[] = [];
  userTypes = IDEA_USERS;
  actionItemsIcon = ACTION_ITEM_ICONS;
  actionItems = ACTION_ITEM_ABBREVIATIONS;
  showManageOptions = false;
  rowCount;
  upvoteCount;
  upvoteDetail;
  ideaEntity;
  followersData;
  commentCounts;
  viewCounts;
  topScores;
  private sub: Subscription[] = [];
  count;
  tagsData;
  selectedView;
  stageAssignmentSettings = {};
  columnOptions = [];
  customField;
  criteria;
  customFieldData;
  criteriaResponses;
  customFieldConfig = [];
  modalRef: NgbModalRef;
  bindedCustomFieldData;
  typeAbbreviation = EVALUATION_TYPES_ABBREVIATION;

  isNumber = Number;
  round = Math.round;

  public toggleFilterVisibility = true;
  public filterScrollBarFlag = false;
  public filterOptions: DisplayOptions = {
    display: false,
    mobileRender: false,
    webRender: false
  };
  searchParams: any;
  defaultPage = {
    take: 30,
    skip: 0
  };

  stageEntity;
  isFilter = false;
  notPosted = false;
  paramAppliedFilters: {};
  exportFlag = false;
  totalScoreIcon = 'sort';
  totalStageScoreIcon = 'sort';
  showUndoChangesDialog = false;
  shouldUpdate = false;
  BULK_UPDATE_TYPES = BULK_UPDATE_TYPES;
  remainingTime = 0;
  isSelectAllOpportunities = false;
  numbers$: Subscription;
  bulkUpdate$: Subscription;
  timeFilter = false;
  sortOpportunityFilter = false;
  updateFilters = false;
  currentView;
  loadOpportunities = true;
  isSavedView = true;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private route: ActivatedRoute,
    private util: UtilService,
    private opportunityApi: OpportunityApiService,
    private reviewCriteriaApi: ReviewCriteriaApiService,
    private entityApi: EntityApiService,
    private customFieldApi: CustomFieldApiService
  ) {
    this.ceiling = Math.ceil;
  }

  ngOnInit() {
    // this.getColumns();
    this.exportFlag = !!this.ngRedux.getState().userState
      .userCommunityPermissions.exportOpportunity;
    this.ideaEntity = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
    this.stageEntity = this.entityApi.getEntity(ENTITY_TYPE.STAGE);

    const params = _.cloneDeep(this.route.snapshot.queryParams);
    this.dateFrom = !_.isEmpty(params.fromDate)
      ? moment(params.fromDate)
      : null;
    this.dateTo = !_.isEmpty(params.toDate) ? moment(params.toDate) : null;
    this.appliedFilters = params.sideFilter
      ? JSON.parse(params.sideFilter)
      : {};
    params.sideFilter = this.appliedFilters;
    this.searchParams = { ...params, ...this.defaultPage };
    this.subscribeNewSubmission();
    this.sub.push(
      this.util
        .getIdeaFilterDateDropdownEmitter()
        .subscribe((flag) => (this.filterScrollBarFlag = flag))
    );
  }

  setSelectedView(view) {
    this.selectedView = view ? view : undefined;
    this.getColumns();
  }

  fetchUpdatedColumns(updateColumns) {
    if (updateColumns) {
      this.getColumns(true);
    }
  }

  fetchUpdatedFilters(updateFilters) {
    this.updateFilters = updateFilters;
  }

  private getColumns(subscribeLatesColumns = false) {
    if (
      this.selectedView &&
      this.selectedView.columnOptions &&
      !subscribeLatesColumns
    ) {
      this.columnOptions = this.selectedView.columnOptions;
      if (this.loadOpportunities) {
        this.getOpportunities();
      }
    } else {
      this.opportunityApi
        .getOpportunityColumnOptions()
        .subscribe((res: any) => {
          const response = _.get(res, 'response', {});
          if (response.length) {
            this.columnOptions = response[0].optionsData;
          } else {
            this.columnOptions = IDEA_LIST_DEFAULT_COLUMNS;
          }
          this.columnOptions = this.columnOptions.filter(
            (val) => !val.title.includes('ID and Title')
          );
          _.forEach(this.columnOptions, (column) => {
            if (column.type === 'criteria') {
              if (
                column.evaluationType.abbreviation ===
                this.typeAbbreviation.NUMERICAL_RANGE
              ) {
                column.title =
                  column.title +
                  ' (' +
                  column.criteriaObject.minValue +
                  '-' +
                  column.criteriaObject.maxValue +
                  ')';
              } else {
                column.title = column.title + ' (1-10) ';
              }
            }
          });
          if (this.loadOpportunities) {
            this.getOpportunities();
          }
          this.ngRedux.dispatch({
            type: LOAD_SELECTED_COLUMN,
            selected: this.columnOptions
          });
        });
    }
  }

  parseSelectedColumns() {
    let opportunityUsers = 0;
    let stage = 0;
    let opportunityType = 0;
    let tags = 0;
    let assignedTo = 0;
    let evalSummary = 0;
    let customField = 0;
    let criteria = 0;
    let challenge = 0;
    let submitterGroups = 0;
    let currentPreviousStage = 0;

    _.forEach(this.columnOptions, (column) => {
      switch (
        column.uniqueId.match(/\d+/g)
          ? column.uniqueId.replace(/\d+/g, '')
          : column.uniqueId
      ) {
        case 'tags':
          tags = 1;
          break;
        case 'teamMembersWidget':
        case 'ownersWidget':
        case 'submittersWidget':
          opportunityUsers = 1;
          break;
        case 'currentStage':
          stage = 1;
          break;
        case 'opportunityType':
          opportunityType = 1;
          break;
        case 'assignedTo':
          assignedTo = 1;
          break;
        case 'totalScore':
        case 'currentStageScore':
          evalSummary = 1;
          break;
        case 'customField':
          customField = 1;
          break;
        case 'criteria':
          criteria = 1;
          break;
        case 'challengeName':
          challenge = 1;
          break;
        case 'submitterMember':
          submitterGroups = 1;
          break;
        case 'previousStage':
          currentPreviousStage = 1;
          break;
        case 'daysInPreviousStage':
          currentPreviousStage = 1;
          break;
        case 'daysInCurrentStage':
          currentPreviousStage = 1;
          break;
        default:
          break;
      }
    });
    return {
      opportunityUsers: opportunityUsers,
      workflow: 1,
      stage: stage,
      opportunityType: opportunityType,
      commentCount: 1,
      upvoteCount: 1,
      assignedTo: assignedTo,
      tags: tags,
      stageAssignmentSettings: 1,
      evalSummary: evalSummary,
      customField: customField,
      criteria: criteria,
      challenge: challenge,
      submitterGroups: submitterGroups,
      currentPreviousStage: currentPreviousStage
    };
  }

  onTableChanged(ev) {
    this.updateSelectedRows();
  }

  applyFilters(reloadOnly = false) {
    if (!reloadOnly) {
      this.openIdeaModalFromUrl();
    }
    const params = _.cloneDeep(this.searchParams);
    let sideFilter: any = {};
    if (!_.isEmpty(params.sideFilter)) {
      this.isFilter = true;
      sideFilter = params.sideFilter;
      sideFilter.opportunityTypes = _.map(sideFilter.opportunityTypes, 'id');
      sideFilter.statuses = _.map(sideFilter.statuses, 'id');
      sideFilter.tags = _.map(sideFilter.tags, 'id');
      sideFilter.workflow = _.get(sideFilter.workflow, 'id');
      sideFilter.stage = _.get(sideFilter.stage, 'id');
      if (sideFilter.challenges) {
        const challenges = _.cloneDeep(sideFilter.challenges);
        sideFilter.challenges = [];
        challenges.forEach((challenge) => {
          sideFilter.challenges.push(challenge.id);
        });
      }
      delete params.sideFilter;
    }

    return { params, sideFilter };
  }

  private updateSortingIcon(queryParams) {
    this.totalScoreIcon = 'sort';
    this.totalStageScoreIcon = 'sort';
    if (queryParams['sortBy'] == 'totalScore') {
      if (queryParams['sortType'] == 'ASC') {
        this.totalScoreIcon = 'caret-up';
      } else if (queryParams['sortType'] == 'DESC') {
        this.totalScoreIcon = 'caret-down';
      }
    } else if (queryParams['sortBy'] == 'currStageScore') {
      if (queryParams['sortType'] == 'ASC') {
        this.totalStageScoreIcon = 'caret-up';
      } else if (queryParams['sortType'] == 'DESC') {
        this.totalStageScoreIcon = 'caret-down';
      }
    }
  }

  private async getOpportunities(isSearching = true, reloadOnly = false) {
    this.isSearching = isSearching;
    if (!reloadOnly) {
      this.fillNavigation(this.searchParams);
    }
    const filters = this.applyFilters(reloadOnly);

    const queryParams = this.util.cleanObject({
      ...filters.params,
      ...filters.sideFilter,
      community: this.communityId,
      isDeleted: false,
      preselectIds: this.selectedList,
      preselectAllIds: this.isSelectAllOpportunities
    });
    this.updateSortingIcon(queryParams);
    this.paramAppliedFilters = queryParams;
    const res: any = await this.opportunityApi
      .getOpportunity(queryParams)
      .toPromise();
    this.isSearching = false;
    if (this.isSelectAllOpportunities) {
      const selected = _.get(res, 'response.preselectedIds', []);
      this.dispatchSelectedRows(selected);
    }
    this.rows = _.get(res, 'response.data', []);
    this.count = _.get(res, 'response.count', 0);

    if (this.rows.length) {
      this.getOpportunitiesData();
    }
    if (this.count === 0 && !this.isFilter) {
      this.notPosted = true;
    } else {
      this.notPosted = false;
    }
  }

  updateSelectedRows() {
    const selected = this.selectedList;

    if (selected.length) {
      _.forEach(selected, (id) => {
        const c = 'select' + id;
        const checkboxElem = document.getElementById(c) as HTMLInputElement;
        if (checkboxElem) checkboxElem.checked = true;

        const s = 'checkable' + id;
        const rowElem = document.getElementById(s);
        if (rowElem) {
          rowElem.setAttribute('class', 'bg-light-gray');
          rowElem.classList.remove('alwaysWhite');
        }
      });

      // Check Select All if all ideas are selected
      this.markSelectAll();
    }
  }

  markSelectAll() {
    const selectAllElem = document.getElementById(
      'selectAll'
    ) as HTMLInputElement;
    if (this.isAllSelected) {
      if (selectAllElem) {
        selectAllElem.checked = true;
      }
    } else {
      if (selectAllElem) {
        selectAllElem.checked = false;
      }
    }
  }

  get isAllSelected(): boolean {
    const selected = this.selectedList;
    const currentRowIds = _.map(this.rows, 'id');
    const isAllSelected = _.difference(currentRowIds, selected).length === 0;
    return isAllSelected;
  }

  getOpportunitiesData() {
    const opportunityIds = _.map(this.rows, (idea) => idea.id);
    const parsedColumns = this.parseSelectedColumns();
    this.getOpportunitiesDetails(opportunityIds, parsedColumns);
    this.getOpportunitiesPermissions(opportunityIds);
    this.getOpportunitiesVisibility(opportunityIds);
    if (parsedColumns.stage) {
      this.getOpportunitiesCompletionStats(opportunityIds);
    }
    if (parsedColumns.assignedTo) {
      this.getOpportunitiesStageAssignees(opportunityIds);
    }
    if (parsedColumns.evalSummary) {
      this.getOpportunitiesEvalSummary({
        opportunityIds: opportunityIds,
        entityTypeId: this.stageEntity.id
      });
    }
    if (parsedColumns.currentPreviousStage) {
      this.getOpportunitiesCurrentPreviousStage({
        opportunityIds: opportunityIds
      });
    }
  }

  private async getOpportunitiesStageAssignees(opportunityIds: []) {
    const data = {
      opportunityIds
    };

    const res = await this.opportunityApi
      .getOpportunitiesStageAssigneesForList(data)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (a) =>
        (_.find(this.rows, (idea) => idea.id === a.opportunityId).assignees =
          a.assignees)
    );
  }

  /**
   * @deprecated in favor of stored total scores.
   */
  private async getTotalScore(opportunityIds: []) {
    const data = {
      opportunityIds,
      community: this.ngRedux.getState().userState.currentCommunityId
    };

    const res = await this.opportunityApi
      .getOpportunitiesScore(data)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (score) =>
        (_.find(
          this.rows,
          (idea) => idea.id === score.opportunityId
        ).opportunityScore = score.opportunityScore)
    );
  }

  /**
   * @deprecated in favor of stored current stage scores.
   */
  private async getStageScore() {
    const data = {
      community: this.ngRedux.getState().userState.currentCommunityId,
      requestData: _.map(this.rows, (idea) => ({
        entityObjectId: idea.stageId,
        entityType: this.stageEntity.id,
        opportunity: idea.id
      }))
    };
    const res = await this.reviewCriteriaApi
      .getEvaluationCriteriaScores(data)
      .toPromise();

    _.forEach(
      _.get(res, 'response', []),
      (score) =>
        (_.find(
          this.rows,
          (idea) => idea.id === score.opportunityId
        ).stageScore = score.entityScore)
    );
  }

  private async getOpportunitiesDetails(opportunityIds: [], columns: any) {
    const queryParams = {
      challenge: columns.challenge,
      opportunityUsers: columns.opportunityUsers,
      workflow: columns.workflow,
      stage: columns.stage,
      opportunityType: columns.opportunityType,
      commentCount: columns.commentCount,
      upvoteCount: columns.upvoteCount,
      tags: columns.tags,
      stageAssignmentSettings: columns.stageAssignmentSettings,
      customFieldData: columns.customField,
      criteriaResponses: columns.criteria,
      submitterGroups: columns.submitterGroups
    };
    const customFields = this.columnOptions.filter((val) =>
      val.uniqueId.includes('customField')
    );
    const criterias = this.columnOptions.filter((val) =>
      val.uniqueId.includes('criteria')
    );
    const customFieldIds = customFields.map((customField) => customField.id);
    const criteriaIds = criterias.map((criteria) => criteria.id);

    const res = await this.opportunityApi
      .getOpportunityDetails(
        opportunityIds,
        queryParams,
        customFieldIds,
        criteriaIds
      )
      .toPromise();
    const response = _.get(res, 'response', {});
    this.extractDataDictionaries(response);
    this.extractCustomFieldData(response);
    this.extractSubmitterGroupsData(response);
    this.extractCriteriaData(response);
    this.setStageCompletionDate();
    this.extractData(response);
  }

  private extractDataDictionaries(res: {}) {
    this.commentCounts = _.get(res, 'commentCounts', {});
    this.upvoteCount = _.get(res, 'upvotes', {});
    this.tagsData = _.get(res, 'tagsData', {});
    this.stageAssignmentSettings = _.get(res, 'stageAssignmentSettings', {});
  }

  private extractCustomFieldData(res: {}) {
    this.customFieldData = _.get(res, 'customFieldsData', {});
    let htmlTagsRegex = /(<([^>]+)>)/gi;

    _.forEach(this.rows, (idea) => {
      _.forEach(this.customFieldData[idea.id], (customField) => {
        if (customField.fieldData.file) {
          customField.fieldData.name = _.last(
            _.split(customField.fieldData.file, '/')
          ).replace(/^[0-9]+/, '');
        }
        if (
          customField.fieldData.text &&
          htmlTagsRegex.test(customField.fieldData.text)
        ) {
          customField.fieldData.text = customField.fieldData.text.replace(
            htmlTagsRegex,
            ''
          );
        }
        idea['customField' + customField.fieldId] = customField;
      });
    });
  }

  private extractCriteriaData(res: {}) {
    this.criteriaResponses = _.get(res, 'criteriaResponses', {});
    this.criteriaResponses = _.groupBy(this.criteriaResponses, 'opportunityId');

    _.forEach(this.rows, (idea) => {
      _.forEach(this.criteriaResponses[idea.id], (criteriaData) => {
        idea['criteria' + criteriaData.evaluationCriteriaId] = criteriaData;
      });
    });
  }

  private extractSubmitterGroupsData(res: {}) {
    const submitterGroupsData = _.get(res, 'submitterGroups', null);
    _.forEach(this.rows, (idea) => {
      idea.submitterGroups = _.compact(
        _.map(_.get(submitterGroupsData, idea.userId, []), (userCircle) =>
          _.get(userCircle, 'circle.name')
        )
      );
    });
  }

  private setStageCompletionDate() {
    const stageSettings = this.stageAssignmentSettings;
    _.forEach(this.rows, (idea) => {
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
        }
      }
    });
  }

  private extractData(res: {}) {
    _.forEach(_.get(res, 'data', []), (ideaDetail) => {
      const ideaRef = _.find(this.rows, ['id', ideaDetail.id]);
      ideaRef.opportunityUsers = _.groupBy(
        _.get(ideaDetail, 'opportunityUsers', []),
        'opportunityUserType'
      );
      ideaRef.workflow = _.get(ideaDetail, 'workflow', null);
      ideaRef.stage = _.get(ideaDetail, 'stage', null);
      ideaRef.opportunityType = _.get(ideaDetail, 'opportunityType', null);
      ideaRef.challenge = _.get(ideaDetail, 'challenge', null);
    });
    this.getOpportunitiesTypeExperienceAndVisibility(
      _.uniq(_.map(this.rows, (row) => row.opportunityTypeId))
    );
  }

  private async getOpportunitiesVisibility(opportunityIds: []) {
    const res = await this.opportunityApi
      .getOpportunitiesVisibilitySettings(opportunityIds)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(
          this.rows,
          (idea) => idea.id === s.entityObjectId
        ).visibility = s)
    );
  }

  private async getOpportunitiesPermissions(opportunityIds: []) {
    const res = await this.opportunityApi
      .getOpportunitiesPermissionSettings(opportunityIds)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(this.rows, (idea) => idea.id === s.opportunityId).permissions =
          s.permissions)
    );
  }

  private async getOpportunitiesEvalSummary(body) {
    const res = await this.opportunityApi
      .getOpportunitiesEvaluationSummary(body)
      .toPromise();
    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(this.rows, (idea) => idea.id === s.opportunityId).summary =
          s.summary)
    );
  }

  private async getOpportunitiesCurrentPreviousStage(body) {
    const res = await this.opportunityApi
      .getOpportunitiesCurrentPreviousStage(body)
      .toPromise();
    res['response'].forEach((s) => {
      const row = _.find(this.rows, (idea) => idea.id === s.opportunityId);
      row.daysInCurrentStage = s.daysInCurrentStage;
      row.previousStage = s.previousStage;
      row.daysInPreviousStage = s.daysInPreviousStage;
    });
  }

  private async getOpportunitiesTypeExperienceAndVisibility(
    opportunityTypes: []
  ) {
    const data = {
      opportunityTypes,
      community: this.ngRedux.getState().userState.currentCommunityId
    };

    const res: any = await this.opportunityApi
      .getOpportunitiesExperienceAndVisibility(data)
      .toPromise();

    const settings = _.groupBy(_.get(res, 'response', []), 'entityObjectId');
    _.forEach(
      this.rows,
      (row) =>
        (row.experience = settings[row.opportunityTypeId]
          ? settings[row.opportunityTypeId][0]
          : OPPORTUNITY_PERMISSIONS)
    );
  }

  private async getOpportunitiesCompletionStats(opportunityIds: []) {
    const res = await this.opportunityApi
      .getOpportunitiesCompletionData({ opportunityIds })
      .toPromise();

    _.forEach(
      _.get(res, 'response', []),
      (s) =>
        (_.find(
          this.rows,
          (idea) => idea.id === s.opportunityId
        ).completionStats = s)
    );
  }

  openSummaryModal(ideaId) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      windowClass: 'ideaSummaryModal'
    });

    modalRef.componentInstance.ideaId = ideaId;
    modalRef.componentInstance.changeRef.detectChanges();

    modalRef.componentInstance.closed.subscribe(() => {
      this.getOpportunities(false, true);
    });
    modalRef.componentInstance.archive.subscribe((idea) => {
      this.archiveIdea(idea);
      this.getOpportunities(false, true);
    });
    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.route.snapshot.queryParams };
        delete p.oid;
        this.util.navigateTo(p);
      }
    );
  }

  updateSummaryParams(ideaId) {
    this.openSummaryModal(ideaId);
    this.util.navigateTo({
      ...this.route.snapshot.queryParams,
      oid: ideaId
    });
  }

  subscribeNewSubmission() {
    this.sub.push(
      this.ngRedux.select(STATE_TYPES.formSubmitted).subscribe((state: any) => {
        const isNewSubmission = _.get(
          state,
          'latestSubmission.opportunity',
          false
        );
        if (isNewSubmission) {
          this.searchParams = { ...this.searchParams, ...this.defaultPage };
          this.getOpportunities();
        }
      })
    );
  }

  fillNavigation(params) {
    const queryParams = _.cloneDeep(params);
    delete queryParams.take;
    delete queryParams.skip;
    queryParams.sideFilter = JSON.stringify(queryParams.sideFilter);
    this.util.navigateTo(queryParams);
  }

  changePage(event) {
    this.defaultPage.take = event.take;
    this.searchParams = {
      ...this.searchParams,
      take: event.take,
      skip: event.skip
    };

    if (!event.firstLoad) {
      this.getOpportunities();
    }
  }

  openIdeaModalFromUrl() {
    const params = _.cloneDeep(this.route.snapshot.queryParams);
    const ideaId = parseInt(params.oid, 10);
    if (ideaId) {
      this.openSummaryModal(ideaId);
      return false;
    }
  }

  getIdeaEntity() {
    return this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  open(content) {
    this.modalService.open(content, {
      size: 'xl',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  selectAllIdeas(checked) {
    this.allChecked = checked;

    const allCheckBoxes = document.querySelectorAll('.customCheckbox');
    const allRows = document.querySelectorAll('tr');

    let selected = this.selectedList;

    if (checked) {
      allCheckBoxes.forEach((e1: any) => {
        e1.checked = true;
      });

      allRows.forEach((e2: any) => {
        e2.setAttribute('class', 'bg-light-gray');
      });
      allRows[0].setAttribute('class', 'alwaysWhite');

      this.rows.forEach((row) => {
        if (selected.indexOf(row.id) === -1) {
          selected.push(row.id);
        }
      });
    } else {
      allCheckBoxes.forEach((e1: any) => {
        e1.checked = false;
      });
      allRows.forEach((e2: any) => {
        e2.classList.remove('bg-light-gray');
        e2.setAttribute('class', 'alwaysWhite');
      });

      this.rows.forEach((row) => {
        if (selected.indexOf(row.id) !== -1) {
          selected = selected.filter((e) => e !== row.id);
        }
      });
    }
    this.dispatchSelectedRows(selected);
  }

  private dispatchSelectedRows(selected: number[]) {
    this.ngRedux.dispatch({
      type: UPDATE_SELECTED_LIST,
      selected
    });
  }

  private clearSelectedRows() {
    this.ngRedux.dispatch({
      type: CLEAR_SELECTED_LIST
    });
  }

  get selectedList(): number[] {
    const selected = this.ngRedux.getState().ideasState.list.selected;
    return selected;
  }

  rowCheck(e, id) {
    const s = 'checkable' + id;

    let selected = this.selectedList;
    // if (e.toElement.checked) {
    if (e.target.checked) {
      document.getElementById(s).setAttribute('class', 'bg-light-gray');
      document.getElementById(s).classList.remove('alwaysWhite');
      selected.push(id);
    } else {
      document.getElementById(s).classList.remove('bg-light-gray');
      document.getElementById(s).setAttribute('class', 'alwaysWhite');
      selected = selected.filter((e) => e !== id);
    }

    this.dispatchSelectedRows(selected);
    this.markSelectAll();
  }

  selectAllOpportunities() {
    this.isSelectAllOpportunities = true;
    this.getOpportunities();
  }

  deselectAllOpportunities() {
    this.isSelectAllOpportunities = false;
    this.clearSelectedRows();
    this.selectAllIdeas(false);
  }

  ngOnDestroy() {
    if (this.sub && this.sub.length) {
      this.sub.forEach((x) => x && x.unsubscribe());
    }
  }

  archiveIdea(data) {
    this.opportunityApi.archiveOpportunity(data.id).subscribe((res: any) => {
      if (res.statusCode === 200) {
        _.remove(this.rows, (value) => value.id == data.id);
        this.notifier.showInfo(
          `${data.title} has been successfully archived.`,
          {
            positionClass: 'toast-bottom-right'
          }
        );
        this.count = this.count - 1;

        // Remove idea from store
        let selected = this.selectedList;
        selected = selected.filter((s) => s !== data.id);
        this.dispatchSelectedRows(selected);
      } else {
        this.notifier.showInfo('Something Went Wrong');
      }
    });
  }

  bulkUpdate(type: string, data = null) {
    this.showUndoChangesDialog = true;
    this.shouldUpdate = true;

    this.remainingTime = 5;
    const numbers = interval(1000);
    this.numbers$ = numbers
      .pipe(take(4))
      .subscribe((num) => (this.remainingTime = 4 - num));
    let selectedIdeaIds = this.selectedList;

    const obs = of([]).pipe(delay(5000));
    this.bulkUpdate$ = obs.subscribe(() => {
      this.showUndoChangesDialog = false;
      if (this.shouldUpdate) {
        switch (type) {
          case BULK_UPDATE_TYPES.ARCHIVE_IDEAS:
            this.archiveIdeas();
            return;
          case BULK_UPDATE_TYPES.CHANGE_STAGE:
            this.bulkUpdateStage(data);
            return;
          case BULK_UPDATE_TYPES.OPPORTUNITY_SETTINGS:
            this.updateBulkOpportunitySettings(data);
            return;
          case BULK_UPDATE_TYPES.USER_SETTINGS:
            this.bulkAddUsers(data);
            return;
          case BULK_UPDATE_TYPES.CUSTOM_FIELDS:
            this.bulkAttachCustomFieldsData(data, selectedIdeaIds);
            return;
          default:
            return;
        }
      }
    });
  }

  undoChanges() {
    if (this.numbers$) {
      this.numbers$.unsubscribe();
    }
    if (this.bulkUpdate$) {
      this.bulkUpdate$.unsubscribe();
    }
    this.shouldUpdate = false;
    this.showUndoChangesDialog = false;
  }

  bulkUpdateStage(data) {
    this.opportunityApi
      .bulkUpdateOpportunities({
        stopNotifications: true,
        ...data
      })
      .subscribe(
        () => {
          this.clearSelectedRows();
          this.notifier.showInfo('Alerts.StageUpdated', {
            positionClass: 'toast-bottom-right'
          });
          // this.modal.close();
          this.updateAll(null);
          this.modalService.dismissAll();
        },
        () => this.notifier.showError('Something Went Wrong')
      );
  }

  archiveIdeas() {
    const selected = this.selectedList;

    this.opportunityApi.archiveOpportunities(selected).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.clearSelectedRows();
        this.searchParams.skip = 0;
        this.getOpportunities();
        let baseMsg = 'ideas have';
        if (selected.length == 1) {
          baseMsg = 'idea has';
        }
        this.notifier.showInfo(
          `${selected.length} ${baseMsg} been successfully archived`,
          {
            positionClass: 'toast-bottom-right'
          }
        );

        // Remove all ideas from store
        this.clearSelectedRows();
      } else {
        this.notifier.showInfo('Something Went Wrong');
      }
    });
  }

  updateRow() {
    this.getOpportunities(false);
  }

  updateRowAttachment(attachments, i) {
    this.rows[i].opportunityAttachments = attachments;
  }

  sortScore(sortBy, sortType) {
    const filter = {
      sortBy: sortBy,
      sortType: sortType
    };
    this.sortFilter(filter);
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

  getUserByType(row, type) {
    return _.get(row, `opportunityUsers.${type.key}`, null);
  }

  updateAll(event) {
    this.getOpportunities();
  }

  setSavedView(view) {
    this.isSavedView = view;
    if (this.deepCheckEmptyObject(this.appliedFilters)) {
      this.isSavedView = true;
    }
  }

  filterOpportunities(event) {
    this.isFilter = true;

    if (_.isEmpty(event.tags)) {
      delete event.tags;
    }
    if (_.isEmpty(event.opportunityTypes)) {
      delete event.opportunityTypes;
    }
    this.appliedFilters = _.cloneDeep(event);
    // this.util.navigateTo({ sideFilter: JSON.stringify(event) });
    // const params = _.cloneDeep(event);
    // params.opportunityTypes = _.map(params.opportunityTypes, 'id');
    // params.tags = _.map(params.tags, 'id');
    this.searchParams = { ...this.searchParams, ...{ sideFilter: event } };
    this.getOpportunities();
    this.loadOpportunities = false;
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

  openPostIdea() {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.postedIdeaId.subscribe(() => {
      this.getOpportunities(false);
    });
  }

  private async getOpportunityFollowersData(oId) {
    const queryParams = {
      followersData: 1
    };
    const res = await this.opportunityApi
      .getOpportunityDetails([oId], queryParams)
      .toPromise();
    return _.get(res, 'response.followersData', {});
  }

  async addToWorkflowModal(opportunity) {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = opportunity;
    modalRef.componentInstance.updatedOpportunity.subscribe((o) => {
      this.getOpportunities(false);
    });
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.followerData = this.getOpportunityFollowersData(
      opportunity.id
    );
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunitiesData();
    });
    modalRef.componentInstance.closePopup.subscribe(() => {
      modalRef.close();
    });
  }

  async openCustomFieldModal(content, opportunity, customField) {
    this.customFieldConfig = [];
    customField.permissions = {
      viewCustomFieldData: true,
      editCustomFieldData: true
    };
    this.customFieldConfig.push(customField);
    this.modalRef = this.modalService.open(content, {
      size: 'lg'
    });
  }

  bindCustomFieldData(customField) {
    this.bindedCustomFieldData = customField;
  }

  async openChangeStage(opportunity) {
    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = opportunity;
    modalRef.componentInstance.selectedStage = opportunity.stage;
    modalRef.componentInstance.workFlowSelected = opportunity.workflow;
    modalRef.componentInstance.updatedOpportunity.subscribe(() => {
      this.getOpportunitiesData();
    });
    modalRef.componentInstance.followerData = this.followersData;
  }

  public async openAddNewBox(type, opportunity) {
    const modalRef = this.modalService.open(AddUserComponent, {
      ariaLabelledBy: 'modal-basic-title'
    });

    const userIds = await this.getUsersList(opportunity);
    modalRef.componentInstance.exclude = userIds[type.key];
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
    modalRef.componentInstance.data.subscribe((result) => {
      if (result) {
        const dataSet = _.map(result.users, (value) => {
          return {
            user: value,
            opportunity: opportunity.id,
            community: this.currentUser.currentCommunityId,
            message: result.message,
            opportunityUserType: type.key
          };
        });
        this.opportunityApi.postOpportunityUsers(dataSet).subscribe(() => {
          this.getOpportunities(false);
        });
        modalRef.close('save');
      }
    });
  }

  private async getUsersList(opportunity) {
    const params = {
      community: this.currentUser.currentCommunityId,
      opportunity: opportunity.id
    };

    const res = await this.opportunityApi
      .getOpportunityUsers(params)
      .toPromise();

    const opportunityUsers = _.groupBy(
      _.get(res, 'response', []),
      'opportunityUserType'
    );

    const userIds = {
      owner: _.map(
        _.get(opportunityUsers, IDEA_USERS.owner.key, []),
        'user.id'
      ),
      submitter: _.map(
        _.get(opportunityUsers, IDEA_USERS.submitter.key, []),
        'user.id'
      ),
      contributor: _.map(
        _.get(opportunityUsers, IDEA_USERS.contributors.key, []),
        'user.id'
      )
    };

    return userIds;
  }

  roundValue(value) {
    return _.round(value, 2);
  }
  public toggleFilter(): void {
    this.filterOptions.display = !this.filterOptions.display;
    this.onResize();
  }
  @HostListener('window:resize')
  onResize(): void {
    this.filterOptions = Utility.setDisplayOptions(this.filterOptions);
  }
  public unAssignedOrNot(assignee) {
    if (
      assignee.unassigned ||
      (!assignee.allMembers &&
        !(assignee['individuals'] || []).length &&
        !(assignee['groups'] || []).length &&
        !assignee.communityAdmins &&
        !assignee.communityModerators &&
        !assignee.communityUsers &&
        !assignee.opportunityTeams &&
        !assignee.opportunitySubmitters &&
        !assignee.opportunityOwners)
    ) {
      return true;
    }
    return false;
  }

  openIdeaEvalutionsStage(idea) {
    const modalRef = this.modalService.open(IdeaEvaluationsStageComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.idea = idea;
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
  }

  public updateBulkOpportunitySettings(opportunitySettings) {
    let selectedIdeaIds = this.selectedList;

    opportunitySettings.opportunityIds = selectedIdeaIds;

    if (opportunitySettings) {
      this.opportunityApi
        .bulkUpdateOpportunitySettings(opportunitySettings)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.clearSelectedRows();
            this.getOpportunities();
            this.notifier.showInfo(
              `Your Idea settings have been updated successfully`,
              {
                positionClass: 'toast-bottom-right'
              }
            );
          }
        });
    }
  }
  public bulkAddUsers(usersData) {
    let selectedIdeaIds = this.selectedList;

    if (usersData) {
      const dataSet = {
        opportunityIds: selectedIdeaIds,
        users: _.map(usersData.users, (value) => {
          return {
            user: value,
            message: usersData.message,
            opportunityUserType: usersData.type.key
          };
        })
      };
      this.opportunityApi
        .postBulkOpportunityUsers(dataSet)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.clearSelectedRows();
            this.getOpportunities();
            this.notifier.showInfo(`Users have been successfully added`, {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showInfo('Something went wrong');
          }
        });
    }
  }

  public bulkAttachCustomFieldsData(customFieldsData, selectedIdeaIds) {
    this.modalRef.close();

    if (customFieldsData) {
      const dataSet = {
        opportunityIds: selectedIdeaIds,
        communityId: this.communityId,
        field: customFieldsData[0]
      };
      this.customFieldApi
        .bulkAttachCustomFieldData(dataSet)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.clearSelectedRows();
            this.getOpportunities();
            this.notifier.showInfo(
              `Custom fields have been successfully attached/updated`,
              {
                positionClass: 'toast-bottom-right'
              }
            );
          } else {
            this.notifier.showInfo('Something went wrong', {
              positionClass: 'toast-bottom-right'
            });
          }
        });
    }
  }
  close() {
    this.modalRef.close();
  }
}
