import * as _ from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { AppState } from '../../../../store';
import {
  DEFAULT_PRELOADED_IMAGE,
  UsersOrGroupDropdownConfig
} from '../../../../utils';
import { GroupsApiService } from '../../../../services';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GroupsApiService]
})
export class SearchUsersComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;

  @Input() exclude = [];
  @Input() hideSelected = true;
  @Input() closeOnSelect = false;
  @Input() placeHolder = 'Start typing to search people...';
  @Input() selected = [];
  @Input() communityBadge = false;
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
  extraUsers = [];
  searhUsers = [];
  users = [];

  @Output() dataEmitter = new EventEmitter();

  items = [];
  image = 'https://via.placeholder.com/30x30';
  communityId;
  entityType;

  allCommunity = true;

  constructor(
    private groupApi: GroupsApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getDataForDropdown();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          // case 'communityBadge':
          //   this.addDefaultBadge();
          //   break;
          default:
            break;
        }
      }
    }
  }

  private async getUsers() {
    this.dropdownPaginationState.isLoading = true;
    this.updatePaginationFlag = true;

    const userRes = await this.groupApi
      .getUsersByPagination({
        take: this.dropdownPaginationState.take,
        skip: this.dropdownPaginationState.searchText
          ? this.dropdownPaginationState.searchSkip
          : this.dropdownPaginationState.skip,
        searchText: this.dropdownPaginationState.searchText,
        extraUserIds: this.dropdownPaginationState.firstLoad
          ? this.selected || []
          : [],
        excludedIds: this.selected || []
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
      this.searhUsers = _.concat(
        this.searhUsers,
        _.get(userRes, 'response.data')
      );
    } else {
      this.users = _.concat(this.users, _.get(userRes, 'response.data'));
    }
    if (this.dropdownPaginationState.firstLoad) {
      this.dropdownPaginationState.firstLoad = false;
      this.extraUsers = _.get(userRes, 'response.extraUsers');
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
    if (
      !this.dropdownPaginationState.searchText &&
      (this.users.length < this.dropdownPaginationState.userTotalCount ||
        !!!this.dropdownPaginationState.skip)
    ) {
      await this.getUsers();
    } else if (
      this.dropdownPaginationState.searchText &&
      (this.searhUsers.length < this.dropdownPaginationState.userSearchCount ||
        !!!this.dropdownPaginationState.searchSkip)
    ) {
      await this.getUsers();
    }

    this.updatePaginationmetadata();
  }
  emitData() {
    // this.selected = _.filter(this.selected, (s) => s !== 0);
    let selected = _.cloneDeep(this.selected);
    // if (_.isEmpty(selected)) {
    //   selected = _(this.items)
    //     .filter((i) => i.id !== 0)
    //     .map((i) => i.id)
    //     .value();
    // }
    this.dataEmitter.emit(selected);
    // this.addDefaultBadge();
    this.resetSearchMetaData();
  }

  // private addDefaultBadge() {
  //   if (_.isEmpty(this.selected) && this.communityBadge) {
  //     this.selected = [0];
  //     this.allCommunity = true;
  //   }
  // }
  formatData() {
    this.items = [
      ..._.sortBy(_.compact(this.extraUsers), 'userName'),
      ..._.sortBy(_.compact(this.users), 'userName'),
      ..._.sortBy(_.compact(this.searhUsers), 'userName')
    ];

    this.items = _.uniqBy(this.items, 'id');
    if (!_.isEmpty(this.exclude)) {
      this.items = _.filter(
        this.items,
        (value) => !_.includes(this.exclude, value.id)
      );
    }
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
    this.searhUsers = [];
  }
}
