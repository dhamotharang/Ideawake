import * as _ from 'lodash';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';

import { AppState } from '../../../../store';
import {
  DEFAULT_PRELOADED_IMAGE,
  UsersOrGroupDropdownConfig
} from '../../../../utils';
import { GroupsApiService } from '../../../../services';
import { NgRedux } from '@angular-redux/store';
import { NgSelectComponent } from '@ng-select/ng-select';
import { of, Subject, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';

@Component({
  selector: 'app-search-groups',
  templateUrl: './search-groups.component.html',
  styleUrls: ['./search-groups.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GroupsApiService]
})
export class SearchGroupsComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @ViewChild('select', { static: false }) ngSelect: NgSelectComponent;
  groups = [];
  users = [];
  extraGroups = [];
  extraUsers = [];
  searchGroups = [];
  searUsers = [];
  items = [];
  selected = [];
  outputData = [];

  @Output() dataEmitter = new EventEmitter<any>();

  @Input() placeHolder = 'Start typing to search...';
  @Input() selection = [];
  @Input() isGroup = true;
  @Input() isUser = false;
  @Input() closeOnSelect = false;
  @Input() usersToPrint = [];
  @Input() groupsToPrint = [];
  @Input() preSelectedList = false;
  @Input() readonly = false;
  @Input() focus = false;
  @Input() communityBadge = false;
  @Input() darkColor = false;

  image = 'https://via.placeholder.com/30x30';
  communityId;
  entityType;
  dropdownPaginationState: UsersOrGroupDropdownConfig = {
    take: 10,
    skip: 0,
    searchSkip: 0,
    userTotalCount: 0,
    groupTotalCount: 0,
    userSearchCount: 0,
    groupSearchCount: 0,
    searchText: '',
    isLoading: false,
    firstLoad: true
  };
  numberOfItemsFromEndBeforeFetchingMore = 6;
  updatePaginationFlag: boolean = false;
  private allSub: Subscription[] = [];

  constructor(
    private groupApi: GroupsApiService,
    private ngRedux: NgRedux<AppState>,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  async ngOnChanges() {
    this.formatSelection();
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    await this.getDataForDropdown();
    if (!_.isEqual(this.outputData, this.selection)) {
      this.emitData();
    }

    this.addDefaultBadge();

    if (this.focus) {
      this.changeDetectorRef.detectChanges();
      this.ngSelect.open();
    }
    this.dropdownPaginationState.firstLoad = false;
  }

  formatData() {
    this.items = [
      ..._.sortBy(_.compact(this.groups), 'name'),
      ..._.sortBy(_.compact(this.users), 'name'),
      ..._.sortBy(_.compact(this.extraGroups), 'name'),
      ..._.sortBy(_.compact(this.extraUsers), 'name'),
      ..._.sortBy(_.compact(this.searUsers), 'name'),
      ..._.sortBy(_.compact(this.searchGroups), 'name')
    ];
    this.items = _.uniqBy(this.items, 'selection');
    if (this.communityBadge) {
      this.items.push({
        id: 0,
        name: 'All Community Members',
        selection: '0|Group',
        isGroup: true
      });
    }
  }

  emitData() {
    this.selected = _.filter(this.selected, (s) => _.first(s) !== '0');
    let selected = _.cloneDeep(this.selected);

    this.outputData = _.map(selected, (value) => {
      const temp = _.split(value, '|', 2);
      return {
        id: _.first(temp),
        type: _.last(temp)
      };
    });
    this.dataEmitter.emit(this.outputData);
    this.addDefaultBadge();
    this.resetSearchMetaData();
  }

  formatSelection() {
    this.selected = _.map(
      this.selection,
      (value) => value.id + '|' + value.type
    );
  }

  addDefaultBadge() {
    if (_.isEmpty(this.selected) && this.communityBadge) {
      this.selected = ['0|Group'];
    }
  }
  onScrollToEnd() {
    this.getDataForDropdown();
  }
  onScroll({ end }) {
    if (
      end + this.numberOfItemsFromEndBeforeFetchingMore >=
      this.items.length
    ) {
      this.getDataForDropdown();
    }
  }
  async getDataForDropdown() {
    if (this.dropdownPaginationState.isLoading) {
      return;
    }
    if (this.isGroup) {
      if (
        !this.dropdownPaginationState.searchText &&
        (this.groups.length < this.dropdownPaginationState.groupTotalCount ||
          !!!this.dropdownPaginationState.skip)
      ) {
        await this.getGroups();
      } else if (
        this.dropdownPaginationState.searchText &&
        (this.searchGroups.length <
          this.dropdownPaginationState.groupSearchCount ||
          !!!this.dropdownPaginationState.searchSkip)
      ) {
        await this.getGroups();
      }
    }
    if (this.isUser) {
      if (
        !this.dropdownPaginationState.searchText &&
        (this.users.length < this.dropdownPaginationState.userTotalCount ||
          !!!this.dropdownPaginationState.skip)
      ) {
        await this.getUsers();
      } else if (
        this.dropdownPaginationState.searchText &&
        (this.searUsers.length < this.dropdownPaginationState.userSearchCount ||
          !!!this.dropdownPaginationState.searchSkip)
      ) {
        await this.getUsers();
      }
    }
    this.updatePaginationmetadata();
  }
  async getGroups() {
    this.dropdownPaginationState.isLoading = true;
    this.updatePaginationFlag = true;
    let selectedItems = this.getSelectedItems('Group');
    const groupRes = await this.groupApi
      .getGroupsByPagination({
        take: this.dropdownPaginationState.take,
        skip: this.dropdownPaginationState.searchText
          ? this.dropdownPaginationState.searchSkip
          : this.dropdownPaginationState.skip,
        searchText: this.dropdownPaginationState.searchText,
        extraCircleIds: this.dropdownPaginationState.firstLoad
          ? selectedItems || []
          : [],
        excludedIds: selectedItems || []
      })
      .toPromise();
    if (this.dropdownPaginationState.searchText) {
      this.dropdownPaginationState.groupSearchCount = _.get(
        groupRes,
        'response.count'
      );
    } else {
      this.dropdownPaginationState.groupTotalCount = _.get(
        groupRes,
        'response.count'
      );
    }
    if (this.dropdownPaginationState.searchText) {
      this.searchGroups = this.updateItemsForDropdown(
        'Group',
        this.searchGroups,
        groupRes,
        'response.data'
      );
    } else {
      this.groups = this.updateItemsForDropdown(
        'Group',
        this.groups,
        groupRes,
        'response.data'
      );
    }

    if (this.dropdownPaginationState.firstLoad) {
      this.extraGroups = this.updateItemsForDropdown(
        'Group',
        this.extraGroups,
        groupRes,
        'response.extraCircles'
      );
    }
  }
  async getUsers() {
    this.updatePaginationFlag = true;
    this.dropdownPaginationState.isLoading = true;

    let selectedItems = this.getSelectedItems('User');
    const userRes = await this.groupApi
      .getUsersByPagination({
        take: this.dropdownPaginationState.take,
        skip: this.dropdownPaginationState.searchText
          ? this.dropdownPaginationState.searchSkip
          : this.dropdownPaginationState.skip,
        searchText: this.dropdownPaginationState.searchText,
        extraUserIds: this.dropdownPaginationState.firstLoad
          ? selectedItems || []
          : [],
        excludedIds: selectedItems || []
      })
      .toPromise();
    if (this.dropdownPaginationState.searchText) {
      this.dropdownPaginationState.userSearchCount = _.get(
        userRes,
        'response.count'
      );
    } else {
      this.dropdownPaginationState.userTotalCount = _.get(
        userRes,
        'response.count'
      );
    }
    if (this.dropdownPaginationState.searchText) {
      this.searUsers = this.updateItemsForDropdown(
        'User',
        this.searUsers,
        userRes,
        'response.data'
      );
    } else {
      this.users = this.updateItemsForDropdown(
        'User',
        this.users,
        userRes,
        'response.data'
      );
    }

    if (this.dropdownPaginationState.firstLoad) {
      this.extraUsers = this.updateItemsForDropdown(
        'User',
        this.extraUsers,
        userRes,
        'response.extraUsers'
      );
    }
  }
  getSelectedItems(type: 'User' | 'Group'): [] {
    let selected = _.filter(this.selected, (s) => _.first(s) !== '0');
    selected = _.cloneDeep(selected).filter((x) => x.includes(type));

    let idsArray = _.map(selected, (value) => {
      const temp = _.split(value, '|', 2);
      return parseInt(_.first(temp));
    });
    return idsArray;
  }
  updateItemsForDropdown(
    type: 'User' | 'Group',
    items: any,
    response,
    responseKey
  ) {
    items = _.concat(
      items,
      _.map(_.get(response, responseKey), (value) => {
        if (this.preSelectedList) {
          if (_.indexOf(this.groupsToPrint, value.id) !== -1) {
            value.selection = value.id + '|' + type;
            if (type == 'Group') {
              value.isGroup = true;
            } else if (type == 'User') {
              value.isUser = true;
              value.name = value.userName;
            }
            return value;
          }
        } else {
          value.selection = value.id + '|' + type;
          if (type == 'Group') {
            value.isGroup = true;
          } else if (type == 'User') {
            value.isUser = true;
            value.name = value.userName;
          }
          return value;
        }
      })
    );
    return items;
  }
  updatePaginationmetadata() {
    if (this.updatePaginationFlag) {
      this.updatePaginationFlag = false;
      !this.dropdownPaginationState.searchText &&
        (this.dropdownPaginationState.skip += this.dropdownPaginationState.take);
      this.dropdownPaginationState.searchSkip += this.dropdownPaginationState.take;

      this.formatData();
      this.dropdownPaginationState.isLoading = false;
    }
  }
  onSearch($event) {
    this.resetSearchMetaData();
    if ($event.term.length >= 2) {
      this.dropdownPaginationState.searchText = $event.term;
      this.getDataForDropdown();
    }
  }
  onClose() {
    this.resetSearchMetaData();
  }
  resetSearchMetaData() {
    this.dropdownPaginationState.searchSkip = 0;
    this.dropdownPaginationState.searchText = '';
    this.searUsers = [];
    this.searchGroups = [];
  }
}
