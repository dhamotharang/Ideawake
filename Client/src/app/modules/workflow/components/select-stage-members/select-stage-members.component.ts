import {
  Component,
  OnChanges,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { forEach, map, get, merge } from 'lodash';
@Component({
  selector: 'app-select-stage-members',
  templateUrl: './select-stage-members.component.html'
})
export class SelectStageMembersComponent implements OnChanges {
  @Input() assigneeSettings;
  @Input() potentialCounts;
  @Input() membersInfo;
  @Output() emitMembers = new EventEmitter<any>();
  constructor() {}

  viewDetails = false;
  assignByCustomFields = false;
  assignGroups = false;
  individualAssigneeUsers = [];

  ngOnChanges() {
    this.loadUsersAndGroups();
  }

  toggleMergeDetails() {
    this.viewDetails = !this.viewDetails;
  }

  toggleCustomFields() {
    this.assignByCustomFields = !this.assignByCustomFields;
    this.assigneeSettings.customFieldAssignee = null;
  }

  toggleGroups() {
    this.assignGroups = !this.assignGroups;
    this.assigneeSettings.individuals = [];
    this.assigneeSettings.groups = [];
    this.emitValues();
  }

  emitValues() {
    this.emitMembers.emit(this.assigneeSettings);
  }

  getIndividuals(event) {
    const individuals = [];
    const groups = [];
    forEach(event, (value) => {
      if (value.type === 'User') {
        individuals.push(value.id);
      } else if (value.type === 'Group') {
        groups.push(value.id);
      }
    });
    this.assigneeSettings.individuals = individuals;
    this.assigneeSettings.groups = groups;
    this.emitValues();
  }

  customFieldAssignee(event) {
    this.assigneeSettings = merge(this.assigneeSettings, event);
    this.emitValues();
  }

  loadUsersAndGroups() {
    map(get(this.assigneeSettings, 'individuals', []), (value) => {
      this.individualAssigneeUsers.push({
        id: value,
        type: 'User'
      });
    });
    map(get(this.assigneeSettings, 'groups', []), (value) => {
      this.individualAssigneeUsers.push({
        id: value,
        type: 'Group'
      });
    });
    if (this.individualAssigneeUsers.length) {
      this.assignGroups = true;
    }
    if (get(this.assigneeSettings, 'customFieldAssignee.fieldId')) {
      this.assignByCustomFields = true;
    }
  }
}
