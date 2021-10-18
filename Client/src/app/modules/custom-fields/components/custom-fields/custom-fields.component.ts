import { forEach } from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { CustomFieldApiService } from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import { CUSTOM_FIELD_TYPES, FIELD_DATA_TYPE } from '../../../../utils';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})
export class CustomFieldsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() customFields;
  @Input() view = false;
  @Input() ignorePermissions = false;

  @Output() fieldsData = new EventEmitter();

  fieldTypes = CUSTOM_FIELD_TYPES;
  customFieldData;
  allRoles;
  user: UserState;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private customFieldApi: CustomFieldApiService
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        this.user = state;
        this.getAllRoles();
      });
  }

  ngOnChanges() {
    if (this.customFields) {
      this.customFieldData = [];
      for (let i = 0; i < this.customFields.length; i++) {
        this.customFieldData.push({});
        if (this.ignorePermissions) {
          this.customFields[i].permissions = {
            editCustomFieldData: true,
            viewCustomFieldData: true
          };
        }
      }
    }
  }

  private createCustomFieldData(field, data, fieldType) {
    const obj: any = {
      field: field.id,
      fieldData: {
        userId: this.user.user.id
      },
      community: this.user.currentCommunityId
    };

    obj.fieldData[fieldType] = data;
    if (field.opportunityDataId) {
      obj.id = field.opportunityDataId;
    }
    return obj;
  }

  private getAllRoles() {
    this.customFieldApi
      .roleOptions({
        community: this.user.currentCommunityId
      })
      .subscribe((res: any) => {
        this.allRoles = res.response;
      });
  }

  textField(data, customField, i) {
    this.customFieldData[i] = this.createCustomFieldData(
      customField,
      data,
      FIELD_DATA_TYPE.TEXT
    );
    this.fieldsData.emit(this.customFieldData);
  }

  selectableField(data, customField, i) {
    this.customFieldData[i] = this.createCustomFieldData(
      customField,
      data,
      FIELD_DATA_TYPE.SELECTED
    );
    this.fieldsData.emit(this.customFieldData);
  }

  datepickerField(data, customField, i) {
    this.customFieldData[i] = this.createCustomFieldData(
      customField,
      data,
      FIELD_DATA_TYPE.DATE
    );
    this.fieldsData.emit(this.customFieldData);
  }

  uploadField(data, customField, i) {
    this.customFieldData[i] = this.createCustomFieldData(
      customField,
      data,
      FIELD_DATA_TYPE.FILE
    );
    this.fieldsData.emit(this.customFieldData);
  }

  numberField(data, customField, i) {
    this.customFieldData[i] = this.createCustomFieldData(
      customField,
      data,
      FIELD_DATA_TYPE.NUMBER
    );

    this.fieldsData.emit(this.customFieldData);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
