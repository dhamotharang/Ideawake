import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { CustomFieldApiService, GroupsApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { CUSTOM_FIELD_TYPES } from '../../../../utils/constants';
import { forEach, get, find, map, includes, compact } from 'lodash';
@Component({
  selector: 'app-stage-assign-by-custom-filed',
  templateUrl: './stage-assign-by-custom-filed.component.html'
})
export class StageAssignByCustomFiledComponent implements OnInit, OnChanges {
  @Input() customFieldAssignee;
  @Output() output = new EventEmitter<any>();
  allCustomFields;
  selectedField;
  fieldType;
  options = [];
  optionsData = [];
  groupsList = [];
  usersList = [];
  fieldTypes = [];
  constructor(
    private groupApi: GroupsApiService,
    private customFieldsApi: CustomFieldApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  async ngOnInit() {
    const types: any = await this.customFieldsApi.getTypes().toPromise();
    this.fieldTypes = compact(
      map(types.response, (val) => {
        if (
          includes(
            [
              CUSTOM_FIELD_TYPES.MULTI_SELECT,
              CUSTOM_FIELD_TYPES.SINGLE_SELECT,
              CUSTOM_FIELD_TYPES.COMMUNITY_USER_GROUP
            ],
            val.abbreviation
          )
        ) {
          return val.id;
        }
      })
    );
    const groupRes = await this.groupApi.getGroups().toPromise();
    this.groupsList = get(groupRes, 'response.data');
    const userRes = await this.groupApi
      .getUsersByCommunityId(
        this.ngRedux.getState().userState.currentCommunityId
      )
      .toPromise();
    this.usersList = get(userRes, 'response');
    this.getFieldsList();
  }

  ngOnChanges() {
    this.selectedField = find(this.allCustomFields, [
      'id',
      get(this.customFieldAssignee, 'fieldId')
    ]);
    this.options = get(this.customFieldAssignee, 'options', []);
    this.fillUsers();
    this.output.emit({ customFieldAssignee: this.customFieldAssignee });
  }

  fillUsers() {
    for (let i = 0; i < this.options.length; i++) {
      const tempData = [];
      forEach(this.options[i].users, (value) => {
        tempData.push({
          id: value,
          type: 'User'
        });
      });
      forEach(this.options[i].groups, (value) => {
        tempData.push({
          id: value,
          type: 'Group'
        });
      });
      this.optionsData[i] = tempData;
    }
  }

  getIndividuals(event, index) {
    const individuals = [];
    const groups = [];
    forEach(event, (value) => {
      if (value.type === 'User') {
        individuals.push(parseInt(value.id, 10));
      } else if (value.type === 'Group') {
        groups.push(parseInt(value.id, 10));
      }
    });
    this.customFieldAssignee.options[index].groups = groups;
    this.customFieldAssignee.options[index].users = individuals;
    this.output.emit({ customFieldAssignee: this.customFieldAssignee });
  }

  selectCustomFields(customField) {
    this.options = [];
    this.selectedField = customField;
    this.fieldType = get(customField, 'fieldDataObject.type');
    const data = get(customField, 'fieldDataObject.data');
    if (
      this.fieldType === CUSTOM_FIELD_TYPES.MULTI_SELECT ||
      this.fieldType === CUSTOM_FIELD_TYPES.SINGLE_SELECT
    ) {
      this.options = map(data, (option) => {
        return {
          value: option.value,
          label: option.label,
          value_type: 'single_multi_select',
          groups: [],
          users: []
        };
      });
    } else if (this.fieldType === CUSTOM_FIELD_TYPES.COMMUNITY_USER_GROUP) {
      if (data.isPreselected) {
        forEach(data.groups, (value) => {
          const tempGroup = find(this.groupsList, ['id', parseInt(value, 10)]);
          this.options.push({
            value: tempGroup.id,
            label: tempGroup.name,
            value_type: 'group',
            groups: [],
            users: []
          });
        });
        forEach(data.users, (value) => {
          const tempUser = find(this.usersList, ['id', parseInt(value, 10)]);
          this.options.push({
            value: tempUser.id,
            label: tempUser.firstName + ' ' + tempUser.lastName,
            value_type: 'user',
            groups: [],
            users: []
          });
        });
      } else {
        forEach(this.groupsList, (tempGroup) => {
          this.options.push({
            value: tempGroup.id,
            label: tempGroup.name,
            value_type: 'group',
            groups: [],
            users: []
          });
        });
        forEach(this.usersList, (tempUser) => {
          this.options.push({
            value: tempUser.id,
            label: tempUser.firstName + ' ' + tempUser.lastName,
            value_type: 'user',
            groups: [],
            users: []
          });
        });
      }
    }
    this.customFieldAssignee = {
      fieldId: customField.id,
      options: this.options
    };
    this.output.emit({ customFieldAssignee: this.customFieldAssignee });
  }

  getCustomFields(open) {
    if (!this.allCustomFields && open) {
      this.getFieldsList();
    }
  }

  getFieldsList(searchText?) {
    this.customFieldsApi
      .getAllCustomFields({
        customFieldTypes: this.fieldTypes,
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId,
        searchText
      })
      .subscribe((res: any) => {
        this.allCustomFields = res.response;
        this.selectedField = find(this.allCustomFields, [
          'id',
          get(this.customFieldAssignee, 'fieldId')
        ]);
      });
  }
}
