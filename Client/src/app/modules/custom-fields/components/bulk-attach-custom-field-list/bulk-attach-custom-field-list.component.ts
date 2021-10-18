import {
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';
import { CustomFieldApiService } from '../../../../services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FieldInputComponent } from '../field-input/field-input.component';
import { map, find, toLower, filter, groupBy } from 'lodash';
import { valHooks } from 'jquery';

@Component({
  selector: 'app-bulk-attach-custom-field-list',
  templateUrl: './bulk-attach-custom-field-list.component.html',
  styleUrls: ['./bulk-attach-custom-field-list.component.scss']
})
export class BulkAttachCustomFieldListComponent implements OnInit, OnChanges {
  modalRef: NgbModalRef;
  allCustomFields;
  customFields: any[];
  selectedCustomField;
  selectedIds;
  communityId;
  attachCustomFieldCount = 0;
  result;

  @Output() customFieldData = new EventEmitter<any>();

  constructor(
    private ngRedux: NgRedux<AppState>,
    private customFieldsApi: CustomFieldApiService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getFieldsList();
  }

  ngOnChanges() {
    this.getFieldsList();
    this.attachedCustomFieldsCount();
  }

  openCustomFieldsModal(content, data) {
    this.customFields = [];
    this.selectedCustomField = data;
    data.permissions = {
      viewCustomFieldData: true,
      editCustomFieldData: true
    };
    this.customFields.push(data);
    this.modalRef = this.modalService.open(content, {
      size: 'lg'
    });
    this.attachedCustomFieldsCount();
  }

  close() {
    this.modalRef.close();
  }

  searchFields(queryParams?) {
    const params = {
      ...queryParams,
      ...{ community: this.communityId }
    };
    this.customFieldsApi.getAllCustomFields(params).subscribe((res: any) => {
      this.allCustomFields = res.response;
    });
  }

  searchText(searchText = '') {
    this.searchFields({ searchText });
  }

  getFieldsList() {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        community: this.communityId
      })
      .subscribe(async (res: any) => {
        this.allCustomFields = res.response;
      });
  }

  bulkAttachCustomFieldData(customFieldsData) {
    this.result = customFieldsData.map((val) => {
      return {
        id: this.selectedCustomField.id,
        field: val.field,
        fieldData: val.fieldData
      };
    });
  }

  save() {
    this.customFieldData.emit(this.result);
    this.modalRef.close();
  }

  attachedCustomFieldsCount() {
    this.selectedIds = this.ngRedux.getState().ideasState.list.selected;
    const dataSet = {
      opportunityIds: this.selectedIds,
      fieldId: this.selectedCustomField.id
    };
    this.customFieldsApi
      .attachedCustomFieldDataCount(dataSet)
      .subscribe((res: any) => {
        res.response.map((res) => {
          this.attachCustomFieldCount = res.opportunityIdCount;
        });
      });
  }
}
