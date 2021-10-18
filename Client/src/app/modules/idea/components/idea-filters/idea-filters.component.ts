import * as _ from 'lodash';

import { AppState, STATE_TYPES } from '../../../../store';
import {
  CUSTOM_FIELD_TYPES,
  ON_PAGE_DEFAULT_FILTERS,
  PAGE_TYPE_ENUM
} from '../../../../utils';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  ChallengesApiService,
  CustomFieldApiService,
  OpportunityApiService,
  StatusApiService,
  WorkflowApiService
} from '../../../../services';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ACTION_ITEM_ICONS,
  ACTION_ITEM_ABBREVIATIONS
} from '../../../../utils';
import {
  CUSTOM_FIELD_FILTER_OUTPUT_BULK,
  LOAD_SELECTED_FILTER
} from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-idea-filters',
  templateUrl: './idea-filters.component.html',
  styleUrls: ['./idea-filters.component.scss']
})
export class IdeaFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() pageType = PAGE_TYPE_ENUM.challenge;
  @Input() appFilters: any = {};
  @Input() challengeId;
  @Input() entity;
  @Input() horizontalFilter = false;
  @Input() showSearch = true;
  @Input() onChallengePage = false;
  @Input() showChallengeSearch = false;
  @Input() selectedFilterView;
  @Input() updateFilters;
  @Output() filterApplied = new EventEmitter<any>();
  @Output() tagsOutput = new EventEmitter<any>();
  @Output() selectedFilterList = new EventEmitter<any>();
  @Output() isSavedView = new EventEmitter<any>();
  isLoading = true;
  public objectKeys = Object.keys;
  public currentUser = this.ngRedux.getState().userState;
  public tagsList = [];
  public oppTypes = [];
  public selected = [];
  public filtersData: any;
  public workflows = [];
  public actionItems = ACTION_ITEM_ICONS;
  actionItemAbbreviations = ACTION_ITEM_ABBREVIATIONS;
  public stages = [];
  public statuses = [];
  public selectedWF: any;
  public selectedStage: any;
  public selectAllTags: boolean;
  public selectAllTypes: boolean;
  public fixed = false;
  public toggleQuestion = false;
  public toggleNum = false;
  public toggleTags = false;
  public toggleStatus = false;
  public toggleOppTypes = false;
  public toggleMyFilters = false;
  public clear = false;
  public toggleProjectedBenefits = true;
  public loadingStages = false;
  public fieldTypes = CUSTOM_FIELD_TYPES;
  public opportunityFilters = {
    postedByMe: 'postedByMe',
    votedFor: 'votedFor',
    following: 'followedByMe',
    bookmarkedByMe: 'bookmarkedByMe',
    ownByMe: 'ownByMe'
  };
  public closeResult: string;
  public searchString: string;
  public searchChallenge: string;
  public filtersList: any = ON_PAGE_DEFAULT_FILTERS;
  private customFieldFilters: any = [];
  public customFieldCounts: any;
  private sub: Subscription;
  private sub2: Subscription;
  public challenges;
  public selectedChallenges = [];
  public noChallengeOpportunityCount = 0;
  public currentView;
  public showDefaultFilters;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private statusApiService: StatusApiService,
    private opportunityApiService: OpportunityApiService,
    private customFieldApiService: CustomFieldApiService,
    private workflowApiService: WorkflowApiService,
    private modalService: NgbModal,
    private challangeAPIService: ChallengesApiService
  ) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event: any) {
    const top = window.scrollY;
    if (top > 350) {
      this.fixed = true;
    } else if (this.fixed && top < 329) {
      this.fixed = false;
    }
  }

  ngOnInit() {
    // this.subscribeChange();
    // this.getFilters();
    this.getFilterData();
    this.getCommunityWorkflows();
    this.getGlobalStatuses();
    this.getNoChallengeOpportunityCount();
    this.getAllChallenges();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'appFilters':
            this.preSelectedFilters();
            break;
          default:
            break;
        }
      }
    }
    this.showDefaultFilters = changes['appFilters']
      ? this.deepCheckEmptyObject(changes['appFilters'].currentValue)
      : false;
    if (this.showDefaultFilters) {
      this.getFilters();
    }
    this.currentView = changes['selectedFilterView']
      ? changes['selectedFilterView'].currentValue
      : undefined;
    if (this.currentView) {
      this.getFilters();
    }
    if (changes['updateFilters'] && changes['updateFilters'].currentValue) {
      this.subscribeChange();
    }
  }

  getFilters(subscribeLatestChange = false) {
    this.isSavedView.emit(!_.isEmpty(this.currentView));
    const params = {
      pageType: this.pageType,
      community: this.currentUser.currentCommunityId
    };
    if (
      this.currentView &&
      this.currentView.filterOptions &&
      !this.showDefaultFilters &&
      !subscribeLatestChange
    ) {
      this.filtersList = this.selectedFilterView.filterOptions;
    } else {
      this.opportunityApiService
        .getOpportunityFilterOptions(params)
        .subscribe((res: any) => {
          const options = _.get(res.response[0], 'optionsData', []);
          if (options.length) {
            this.filtersList = _.sortBy(options, 'order');
          } else {
            this.filtersList = _.filter(ON_PAGE_DEFAULT_FILTERS, {
              selected: true
            });
          }
          const customFieldIds = _.map(
            _.filter(this.filtersList, (v) => !v.onPage),
            'id'
          );
          if (customFieldIds.length) {
            this.getCustomFieldsCounts(customFieldIds);
          }
          this.selectedFilterList.emit(this.filtersList);
          this.ngRedux.dispatch({
            type: LOAD_SELECTED_FILTER,
            selected: this.filtersList
          });
        });
    }
  }

  subscribeChange() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.opportunityFilters)
      .subscribe((state: any) => {
        if (_.get(state, 'list.length') > 0) {
          this.filtersList = _.sortBy(state.list, 'order');
        }
        this.getFilters(true);
      });
    this.sub2 = this.ngRedux
      .select(STATE_TYPES.customFieldFilterOutput)
      .subscribe((state: any) => {
        if (!_.isEmpty(state.list)) {
          if (state.emit) {
            this.customFieldFilters = state.list;
            this.emitFilter();
          } else {
            this.customFieldFilters = state.list;
          }
        } else if (_.get(this.appFilters, 'customFields.length') > 0) {
          this.ngRedux.dispatch({
            type: CUSTOM_FIELD_FILTER_OUTPUT_BULK,
            data: _.get(this.appFilters, 'customFields', [])
          });
        }
      });
  }

  getCustomFieldsCounts(fieldIds) {
    const params = {
      community: this.currentUser.currentCommunityId,
      fields: fieldIds
    };
    this.customFieldApiService.getDataCount(params).subscribe((res: any) => {
      this.customFieldCounts = _.keyBy(res.response, 'field');
    });
  }

  getGlobalStatuses() {
    const params = {
      ...{ challenge: this.challengeId },
      community: this.currentUser.currentCommunityId,
      withCounts: true,
      isDeleted: false
    };
    this.statusApiService.getAll(params).subscribe((res: any) => {
      this.statuses = res.response;
      this.refillStatuses();
    });
  }

  refillStatuses() {
    const selectedStatuses = _.map(
      _.get(this.appFilters, 'statuses', []),
      'id'
    );
    this.statuses = _.map(this.statuses, (value) => {
      if (_.includes(selectedStatuses, value.id)) {
        value.isSelected = true;
      } else {
        value.isSelected = false;
      }
      return value;
    });
  }

  getCommunityWorkflows() {
    const params = {
      ...{ challenge: this.challengeId },
      community: this.currentUser.currentCommunityId,
      forFilter: true,
      isDeleted: false
    };
    this.workflowApiService
      .getAllCommunityWorkflows(params)
      .subscribe((res: any) => {
        this.workflows = res.response;
      });
  }

  getStages() {
    if (
      _.get(this.selectedWF, 'id') === _.get(_.first(this.stages), 'workflowId')
    ) {
      return false;
    } else if (!_.get(this.selectedWF, 'id')) {
      this.stages = [];
      return false;
    }
    const params = {
      ...{ challenge: this.challengeId },
      workflow: _.get(this.selectedWF, 'id'),
      withCounts: true,
      isDeleted: false
    };
    if (!this.loadingStages) {
      this.loadingStages = true;
      this.workflowApiService.getAllStages(params).subscribe((res: any) => {
        this.loadingStages = false;
        this.stages = res.response;
      });
    }
  }

  getFilterData() {
    const params = {
      community: this.currentUser.currentCommunityId,
      ...{ challenge: this.challengeId },
      ...{ entityType: _.get(this.entity, 'id', null) }
    };
    this.opportunityApiService
      .getOpportunityFilterIds(params)
      .subscribe((res: any) => {
        this.tagsList = [];
        this.oppTypes = [];
        this.isLoading = true;
        this.filtersData = _.get(res, 'response');
        const tempTag = _.get(res, 'response.tags');
        const tempTypes = _.get(res, 'response.opportunityTypes');
        Object.keys(tempTag).forEach((key) => {
          const tempObject = {
            name: key,
            count: tempTag[key].count,
            id: tempTag[key].id
          };
          this.tagsList.push(tempObject);
        });
        Object.keys(tempTypes).forEach((key) => {
          const tempObject = {
            name: key,
            count: tempTypes[key].count,
            id: tempTypes[key].id
          };
          this.oppTypes.push(tempObject);
        });
        this.preSelectedFilters();
        this.isLoading = false;
      });
  }

  preSelectedFilters() {
    this.selected = [];
    this.selectedWF = {};
    this.selectedStage = {};
    if (this.appFilters) {
      Object.keys(this.appFilters).forEach((key) => {
        if (key === 'workflow') {
          this.selectedWF = _.get(this.appFilters, 'workflow', {});
          this.selectedStage = _.get(this.appFilters, 'stage', {});
          this.getStages();
        } else if (
          _.includes(
            [
              'postedByMe',
              'votedFor',
              'followedByMe',
              'bookmarkedByMe',
              'ownByMe'
            ],
            key
          )
        ) {
          this.selected.push(key);
        }
      });
    }
    if (!_.has(this.appFilters, 'search')) {
      this.clear = true;
      setTimeout(() => {
        this.clear = false;
      }, 100);
    }
    const types = _.map(_.get(this.appFilters, 'opportunityTypes', []), 'id');
    this.oppTypes = _.map(this.oppTypes, (value) => {
      if (_.includes(types, value.id)) {
        value.isSelected = true;
      } else {
        value.isSelected = false;
      }
      return value;
    });
    const tagsIds = _.map(_.get(this.appFilters, 'tags', []), 'id');
    this.tagsList = _.map(this.tagsList, (value) => {
      if (_.includes(tagsIds, value.id)) {
        value.isSelected = true;
      } else {
        value.isSelected = false;
      }
      return value;
    });
    this.selectedChallenges = _.get(this.appFilters, 'challenges', []);
    this.refillStatuses();
  }
  selectFilter(type) {
    this.selected = [];
    this.selected.push(type);
    // For multiple filters
    /* if (_.includes(this.selected, type)) {
      this.selected = _.filter(this.selected, (key) => {
        return key != type;
      });
    } else {
      this.selected.push(type);
    } */
    this.emitFilter();
  }

  selectWF(wf) {
    this.selectedStage = {};
    this.selectedWF = wf;
    this.emitFilter();
  }

  searchText(text) {
    this.searchString = text;
    this.emitFilter();
  }

  getNoChallengeOpportunityCount() {
    this.challangeAPIService
      .getOpportunityCount({
        isDeleted: false,
        challenge: null
      })
      .subscribe((res: {}) => {
        this.noChallengeOpportunityCount = res['response'];
      });
  }

  getAllChallenges() {
    let params = {
      isDeleted: false
    };
    this.challangeAPIService.searchChallenges(params).subscribe((res: {}) => {
      this.challenges = [];
      this.challenges.push({
        id: null,
        title: 'No Challenge',
        opportunityCount: this.noChallengeOpportunityCount
      });
      res['response'].forEach((challenge) => {
        this.challenges.push(challenge);
      });
    });
  }

  getfilterChallenges(text) {
    let params = {
      searchText: text,
      isDeleted: false
    };
    this.challangeAPIService.filterChallenges(params).subscribe((res: {}) => {
      this.challenges = res['response']['challenges'];
    });
  }

  searchChallenges(searchText) {
    setTimeout(() => {
      this.searchChallenge = searchText;
      if (searchText) {
        this.getfilterChallenges(searchText);
      } else {
        this.getAllChallenges();
      }
    }, 500);
  }

  emitFilter() {
    const tempFilter = {
      customFields: [],
      tags: [],
      opportunityTypes: [],
      statuses: [],
      workflow: {},
      stage: {},
      search: null,
      challenges: []
    };
    /* Custom Filter */
    const customFilterArray = [];
    for (const [key, value] of Object.entries(this.customFieldFilters)) {
      if (_.get(value, 'customField')) {
        customFilterArray.push(value);
      }
    }
    /* Custom Filter */
    _.forEach(this.selected, (value) => {
      tempFilter[value] = true;
    });
    tempFilter.tags = _.compact(
      _.map(this.tagsList, (value) => {
        if (_.get(value, 'isSelected')) {
          return { id: value.id, name: value.name };
        }
      })
    );
    tempFilter.opportunityTypes = _.compact(
      _.map(this.oppTypes, (value) => {
        if (_.get(value, 'isSelected')) {
          return { id: value.id, name: value.name };
        }
      })
    );
    tempFilter.statuses = _.compact(
      _.map(this.statuses, (value) => {
        if (_.get(value, 'isSelected')) {
          return { id: value.id, name: value.title };
        }
      })
    );
    if (!_.isEmpty(this.selectedWF)) {
      tempFilter.workflow = {
        id: _.get(this.selectedWF, 'id'),
        title: _.get(this.selectedWF, 'title')
      };
    }
    if (!_.isEmpty(this.selectedStage)) {
      tempFilter.stage = {
        id: _.get(this.selectedStage, 'id'),
        title: _.get(this.selectedStage, 'title')
      };
    }
    if (!_.isEmpty(this.selectedChallenges)) {
      this.selectedChallenges.forEach((ch) => {
        tempFilter.challenges.push({
          id: _.get(ch, 'id'),
          title: _.get(ch, 'title')
        });
      });
    }
    tempFilter.customFields = customFilterArray;
    if (!_.isEmpty(this.searchString)) {
      tempFilter.search = this.searchString;
    } else {
      delete tempFilter.search;
    }
    this.filterApplied.emit(tempFilter);
    if (this.deepCheckEmptyObject(tempFilter)) {
      this.isSavedView.emit(true);
    }
  }

  removeFilter(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.selected = [];
    this.emitFilter();
  }

  isSelected(type) {
    return _.includes(this.selected, type);
  }

  isAnyFilter() {
    return this.selected.length ? true : false;
  }

  selectTag(item) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.tagsList.length; i++) {
      if (this.tagsList[i].id === item.id) {
        this.tagsList[i].isSelected = !this.tagsList[i].isSelected;
      }
    }
    this.isAllSelected();
    this.emitTagsList();
  }

  checkUncheckAllTags() {
    this.selectAllTags = !this.selectAllTags;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.tagsList.length; i++) {
      this.tagsList[i].isSelected = this.selectAllTags;
    }
    this.emitTagsList();
  }

  isAllSelected() {
    this.selectAllTags = this.tagsList.every((item: any) => {
      return item.isSelected === true;
    });
    this.selectAllTypes = this.oppTypes.every((item: any) => {
      return item.isSelected === true;
    });
  }

  emitTagsList() {
    this.emitFilter();
  }

  selectType(item) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oppTypes.length; i++) {
      if (this.oppTypes[i].id === item.id) {
        this.oppTypes[i].isSelected = !this.oppTypes[i].isSelected;
      }
    }
    this.isAllSelected();
    this.emitTypeList();
  }

  selectAllOppTypes() {
    this.selectAllTypes = !this.selectAllTypes;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.oppTypes.length; i++) {
      this.oppTypes[i].isSelected = this.selectAllTypes;
    }
    this.emitTypeList();
  }

  emitTypeList() {
    this.emitFilter();
  }

  selectStage(stage) {
    this.selectedStage = stage;
    this.emitFilter();
  }

  isSelectedStage(stage) {
    return _.get(stage, 'id') === _.get(this.selectedStage, 'id');
  }

  selectChallenge(challenge) {
    const findChallenge = _.find(this.selectedChallenges, {
      id: challenge.id
    });
    if (findChallenge) {
      _.remove(this.selectedChallenges, {
        id: challenge.id
      });
    } else {
      this.selectedChallenges.push(challenge);
    }
    if (this.selectedChallenges.length == 1) {
      const selChallenge = this.selectedChallenges[0];
      if (selChallenge.id != null && selChallenge.workflowId) {
        const findWorkflow = _.find(this.workflows, {
          id: selChallenge.workflowId
        });
        if (findWorkflow) {
          this.selectedStage = {};
          this.selectedWF = findWorkflow;
        }
      }
    }
    this.emitFilter();
  }

  isSelectedChallenge(challenge) {
    const findChallenge = _.find(this.selectedChallenges, {
      id: challenge.id
    });
    if (findChallenge) {
      return true;
    }
    return false;
  }

  selectStatus(item) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.statuses.length; i++) {
      if (this.statuses[i].id === item.id) {
        this.statuses[i].isSelected = !this.statuses[i].isSelected;
      }
    }
    this.emitFilter();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  open(editFilters) {
    this.modalService
      .open(editFilters, {
        size: 'lg',
        ariaLabelledBy: 'Edit Filters',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getValue(object, key) {
    return _.get(object, key, {});
  }

  deepCheckEmptyObject(obj) {
    if (obj) {
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
  }
}
