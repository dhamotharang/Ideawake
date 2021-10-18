import {
  differenceBy,
  forEach,
  remove,
  isEmpty,
  find,
  uniqBy,
  get,
  maxBy
} from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';

import { CustomFieldApiService } from '../../../../services';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-custom-field-submission-form',
  templateUrl: './custom-field-submission-form.component.html',
  styleUrls: ['./custom-field-submission-form.component.css']
})
export class CustomFieldSubmissionFormComponent implements OnInit, OnChanges {
  allCustomFields;
  order = 1;

  @Input() refreshList;
  @Input() selectedCustomFields;
  @Input() heading = 'Customize Submission Form';
  @Input() description = 'Customize Submission Form';
  @Output() selectedFields = new EventEmitter();

  constructor(
    private customFieldsApi: CustomFieldApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.getFieldsList();
  }

  ngOnChanges() {
    if (this.refreshList) {
      this.getFieldsList();
    }
    if (get(this.selectedCustomFields, 'length')) {
      this.selectedFields.emit(this.selectedCustomFields);
    }
  }

  getFieldsList() {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.allCustomFields = res.response;
        this.allCustomFields = differenceBy(
          this.allCustomFields,
          this.selectedCustomFields,
          'id'
        );
        const field = find(this.allCustomFields, { id: this.refreshList });
        if (this.refreshList && !isEmpty(field)) {
          this.selectCustomFields(field);
        }
        this.updateOrder();
      });
  }

  getCustomFields(open) {
    this.allCustomFields = [];
    if (open) {
      this.getFieldsList();
    }
  }

  searchCustomFields(searchText) {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId,
        searchText
      })
      .subscribe((res: any) => {
        this.allCustomFields = res.response;
        this.allCustomFields = differenceBy(
          this.allCustomFields,
          this.selectedCustomFields,
          'id'
        );
      });
  }

  selectCustomFields(customField) {
    customField.order = this.order++;
    this.selectedCustomFields.push(customField);
    this.selectedCustomFields = uniqBy(this.selectedCustomFields, 'id');
    remove(this.allCustomFields, (c) => c.id === customField.id);
    this.selectedFields.emit(this.selectedCustomFields);
  }

  removeSelectedField(customField) {
    --this.order;
    delete customField.order;
    remove(this.selectedCustomFields, (c) => c.id === customField.id);
    this.order = 1;
    forEach(this.selectedCustomFields, (field) => {
      field.order = this.order++;
    });
    this.allCustomFields.push(customField);
    this.selectedFields.emit(this.selectedCustomFields);
  }

  updateOrder() {
    this.order = 1;
    forEach(this.selectedCustomFields, (field) => {
      field.order = this.order++;
    });
    this.selectedFields.emit(this.selectedCustomFields);
  }
}
