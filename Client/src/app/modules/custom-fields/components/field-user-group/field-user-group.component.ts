import { cloneDeep } from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { FIELD_DATA_TYPE } from '../../../../utils';

@Component({
  selector: 'app-field-user-group',
  templateUrl: './field-user-group.component.html',
  styleUrls: ['./field-user-group.component.scss']
})
export class FieldUserGroupComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data: EventEmitter<any> = new EventEmitter<any>();

  fieldDataType = FIELD_DATA_TYPE;
  isPreSelected;
  groups = [];
  users = [];
  selection = [];

  backupSelected;
  dataAvailable = false;
  editMode = false;

  constructor() {}

  getParticipants(selectedData) {
    this.selection = selectedData;
    if (!this.view) {
      this.data.emit(selectedData);
    }
  }

  ngOnChanges() {
    if (this.customField) {
      this.setData(this.customField.fieldDataObject.data.isPreselected);
    }
  }

  setData(preSelected) {
    if (preSelected) {
      this.isPreSelected = preSelected;
      this.groups = this.customField.fieldDataObject.data.groups;
      this.users = this.customField.fieldDataObject.data.users;
    }
    if (
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.selection = this.customField.opportunityFieldData[0].fieldData.selected;
      this.backupSelected = cloneDeep(this.selection);
      this.dataAvailable = true;
      if (!this.view) {
        this.data.emit(this.selection);
      }
    }
  }

  saveChanges() {
    if (this.selection) {
      this.dataAvailable = true;
      this.backupSelected = cloneDeep(this.selection);
    }
    this.editMode = false;
    this.data.emit(this.selection);
  }

  cancelChanges() {
    this.selection = cloneDeep(this.backupSelected);
    this.editMode = false;
  }
}
