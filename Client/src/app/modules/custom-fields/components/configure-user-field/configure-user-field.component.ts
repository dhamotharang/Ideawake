import * as _ from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { CUSTOM_FIELD_TYPES, UserFieldInput } from '../../../../utils';

@Component({
  selector: 'app-configure-user-field',
  templateUrl: './configure-user-field.component.html'
})
export class ConfigureUserFieldComponent implements OnChanges {
  @Input() type = '';
  @Input() inputData: UserFieldInput;
  @Output() output = new EventEmitter<any>();
  public preSelects = [];
  public model = {
    type: CUSTOM_FIELD_TYPES.COMMUNITY_USER_GROUP,
    data: {
      isPreselected: false,
      users: [],
      groups: []
    }
  };
  constructor() {}

  ngOnChanges() {
    this.inputData.type = this.type;
    if (_.isEmpty(this.inputData.data)) {
      this.inputData = this.model;
      this.emitValue();
    }
    const groups = _.get(this.inputData, 'data.groups', []);
    const users = _.get(this.inputData, 'data.users', []);
    if (groups.length) {
      _.forEach(groups, (value) => {
        this.preSelects.push({ id: value, type: 'Group' });
      });
    }
    if (users.length) {
      _.forEach(users, (value) => {
        this.preSelects.push({ id: value, type: 'User' });
      });
    }
  }

  getPreSelect(event) {
    const groups = [];
    const users = [];
    _.forEach(event, (value) => {
      value.id = parseInt(value.id);
      if (value.type == 'User') {
        users.push(value.id);
      } else {
        groups.push(value.id);
      }
    });
    this.inputData.data.groups = groups;
    this.inputData.data.users = users;
    this.emitValue();
  }

  isPreselected() {
    this.inputData.data.isPreselected = !this.inputData.data.isPreselected;
  }

  emitValue() {
    this.output.emit(this.inputData);
  }
}
