import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import {
  CustomFieldApiService,
  NotificationService
} from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import { CustomFieldRoles, CUSTOM_FIELD_TYPES } from '../../../../utils';

@Component({
  selector: 'app-custom-field-detail',
  templateUrl: './custom-field-detail.component.html',
  styleUrls: ['./custom-field-detail.component.scss']
})
export class CustomFieldDetailComponent implements OnInit, OnDestroy {
  @Input() isEdit = false;
  @Input() id = null;
  @Input() type;
  @Output() outPutResult = new EventEmitter<any>();
  fieldTypes = CUSTOM_FIELD_TYPES;

  public currentUser = this.ngRedux.getState().userState;
  public form;
  public duplicate = false;
  public editRole = _.last(CustomFieldRoles);
  public viewRole = _.last(CustomFieldRoles);
  public rolesList = CustomFieldRoles;
  public addMultipleFieldGroups = false;
  public fieldDescription = false;
  public customPlaceholder = false;
  public userCommunityPermissions;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private fb: FormBuilder,
    private notification: NotificationService,
    private customFieldApiService: CustomFieldApiService
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userCommunityPermissions = userState.userCommunityPermissions;
      });
  }

  toggleFieldGroups() {
    this.addMultipleFieldGroups = !this.addMultipleFieldGroups;
  }

  toggleFieldDescription() {
    this.form.controls.description.setValue(null);
    this.fieldDescription = !this.fieldDescription;
  }

  toggleFieldPlaceholder() {
    this.form.controls.placeholderText.setValue(null);
    this.customPlaceholder = !this.customPlaceholder;
  }

  ngOnInit() {
    this.initializeForm();
    this.getRoles();
  }

  getFieldDetails() {
    this.customFieldApiService.getById(this.id).subscribe((res: any) => {
      this.type = _.get(res, 'response.customFieldType');
      const dataSet = _.get(res, 'response');
      this.initializeForm(dataSet);
      this.loadEditData(dataSet);
    });
  }

  loadEditData(dataSet) {
    const viewRolesArray = _.sortedUniq(_.get(dataSet, 'visibilityRoles', []));
    const editRolesArray = _.sortedUniq(_.get(dataSet, 'editRoles', []));
    _.forEach(CustomFieldRoles, (role) => {
      const rolesArray = _.sortedUniq(role.ids);
      if (_.isEqual(rolesArray, viewRolesArray)) {
        this.viewRole = role;
      }
      if (_.isEqual(rolesArray, editRolesArray)) {
        this.editRole = role;
      }
    });
    if (_.get(dataSet, 'description', null)) {
      this.fieldDescription = true;
    }
    if (_.get(dataSet, 'placeholderText', null)) {
      this.customPlaceholder = true;
    }
  }

  initializeForm(dataSet?) {
    this.form = this.fb.group({
      fieldDataObject: [
        _.get(dataSet, 'fieldDataObject', { type: '', data: {} })
      ],
      title: [_.get(dataSet, 'title', null), Validators.required],
      uniqueId: [_.get(dataSet, 'uniqueId', null), Validators.required],
      customFieldType: [_.get(this.type, 'id', null), Validators.required],
      description: [_.get(dataSet, 'description', null)],
      placeholderText: [_.get(dataSet, 'placeholderText', null)],
      groupId: [_.get(dataSet, 'groupId', null)],
      isRequired: [_.get(dataSet, 'isRequired', false)],
      editRoles: [_.get(dataSet, 'editRoles', this.editRole.ids)],
      editRolesText: [_.get(dataSet, 'editRolesText', this.editRole.title)],
      visibilityRoles: [_.get(dataSet, 'visibilityRoles', this.viewRole.ids)],
      visibilityRolesText: [
        _.get(dataSet, 'visibilityRolesText', this.viewRole.title)
      ],
      community: [
        _.get(dataSet, 'communityId', this.currentUser.currentCommunityId)
      ]
    });
  }

  setUniqueId() {
    this.form.controls.uniqueId.setValue(_.snakeCase(this.form.value.title));
  }

  checkDuplicate() {
    const params = {
      uniqueId: this.form.value.uniqueId,
      community: this.currentUser.currentCommunityId,
      ...{ ignoreId: this.id }
    };
    this.customFieldApiService.checkUnique(params).subscribe((res: any) => {
      if (res.response === false) {
        this.duplicate = true;
      } else {
        this.duplicate = false;
      }
    });
  }

  getRoles() {
    const params = { community: this.currentUser.currentCommunityId };
    this.customFieldApiService.roleOptions(params).subscribe((res: any) => {
      const allRoles = _.keyBy(res.response, 'abbreviation');
      this.rolesList = _.map(CustomFieldRoles, (role) => {
        _.forEach(role.keys, (value) => {
          role.ids.push(allRoles[value].id);
        });
        role.ids = _.uniq(role.ids);
        return role;
      });
      if (this.id) {
        this.getFieldDetails();
      } else {
        this.selectViewRole(_.find(CustomFieldRoles, ['title', 'Public']));
        this.selectEditRole(
          _.find(CustomFieldRoles, ['title', 'Team Members'])
        );
      }
    });
  }

  selectType(value) {
    this.type = value.type;
    this.form.controls.customFieldType.setValue(_.get(this.type, 'id', null));
  }

  selectViewRole(value) {
    this.viewRole = value;
    this.form.controls.visibilityRoles.setValue(
      _.get(this.viewRole, 'ids', [])
    );
    this.form.controls.visibilityRolesText.setValue(
      _.get(this.viewRole, 'title')
    );
  }

  selectEditRole(value) {
    this.editRole = value;
    this.form.controls.editRoles.setValue(_.get(this.editRole, 'ids', []));
    this.form.controls.editRolesText.setValue(_.get(this.editRole, 'title'));
  }

  close() {
    this.outPutResult.emit({ close: true });
  }

  setFieldDataObject(event) {
    this.form.controls.fieldDataObject.setValue(event);
  }

  onSubmit(model) {
    _.set(model, 'fieldDataObject.type', _.get(this.type, 'abbreviation'));
    if (this.isEdit) {
      this.customFieldApiService
        .updateById(this.id, model)
        .subscribe((res: any) => {
          this.customFieldApiService.getById(this.id).subscribe((res: any) => {
            const dataSet = _.get(res, 'response');
            this.outPutResult.emit(dataSet);
            this.notification.showSuccess(`Custom Field updated successfully.`);
          });
        });
    } else {
      this.customFieldApiService.createNew(model).subscribe((res: any) => {
        this.outPutResult.emit({ created: true, field: res.response });
        this.notification.showSuccess(`New custom field created successfully.`);
      });
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
