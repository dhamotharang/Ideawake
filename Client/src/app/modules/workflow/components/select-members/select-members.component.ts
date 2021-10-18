import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { forEach, get, map } from 'lodash';

import { AppState } from '../../../../store';
import { GroupsApiService } from '../../../../services';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-select-members',
  templateUrl: './select-members.component.html',
  styleUrls: ['./select-members.component.scss']
})
export class SelectMembersComponent implements OnInit, OnChanges {
  viewDetails = false;
  assignByCustomFields = false;
  assignGroups = false;

  public uniqueUsersCount = 0;
  selectedGroupsAndUsers = [];

  communityId;

  @Input() settings: any = {};
  @Input() potentialCounts;
  @Input() isBulkUpdate = false;

  @Output() updatedSettings = new EventEmitter();

  constructor(
    private ngRedux: NgRedux<AppState>,
    private groupApi: GroupsApiService
  ) {}

  toggleMergeDetails() {
    this.viewDetails = !this.viewDetails;
  }

  toggleCustomFields() {
    this.settings.customFieldAssignee = null;
    this.assignByCustomFields = !this.assignByCustomFields;
  }

  toggleGroups() {
    this.assignGroups = !this.assignGroups;
    if (!this.assignGroups) {
      this.settings.groups = [];
      this.settings.individuals = [];
    }
  }

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
  }

  ngOnChanges() {
    if (this.settings) {
      this.selectedGroupsAndUsers = [
        ...this.settings.groups,
        ...this.settings.individuals
      ];

      if (this.settings.groups.length || this.settings.individuals.length) {
        this.assignGroups = true;
        this.getUniqueUserCount();
      }
      this.settings.unassigned = false;
    }
    if (get(this.settings, 'customFieldAssignee.fieldId')) {
      this.assignByCustomFields = true;
    }
  }

  emitSettings() {
    this.updatedSettings.emit(this.settings);
  }

  customFieldAssignee(event) {
    this.settings = {
      ...this.settings,
      ...event
    };
    this.emitSettings();
  }

  setGroupsAndIndividuals(data) {
    this.settings.groups = [];
    this.settings.individuals = [];

    forEach(data, (d) => {
      if (d.type === 'Group') {
        this.settings.groups.push(d);
      } else if (d.type === 'User') {
        this.settings.individuals.push(d);
      }
    });

    this.getUniqueUserCount();
    this.emitSettings();
  }

  getUniqueUserCount() {
    this.groupApi
      .getUniqueUsersCount({
        users: map(this.settings.individuals, (user) => user.id),
        groups: map(this.settings.groups, (group) => group.id),
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res) => {
        this.uniqueUsersCount = get(res, 'response.count');
      });
  }
}
