import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { GroupsApiService, NotificationService } from '../../../../services';

@Component({
  selector: 'app-edit-group-modal',
  // templateUrl: './edit-group-modal.component.html'
  template: ''
})
export class EditGroupModalComponent implements OnInit {
  @Input() retdata;
  @Output() close1 = new EventEmitter<any>();

  group;
  dataToSend = [];
  public fileData;
  public previewUrl;
  public fileError = false;

  constructor(
    private groupsApi: GroupsApiService,
    private notifier: NotificationService,
    private formBuilder: FormBuilder
  ) {}

  public submitted = false;
  public parents = [];

  public editGroupsForm;

  ngOnInit() {
    this.editGroupsForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      displayName: [''],
      parentCircleId: [`${this.parents[0] || ''}`]
    });
    this.groupsApi.getGroups().subscribe(
      (res: any) => {
        if (res.wasSuccess) {
          this.parents = _.get(res, 'response.data', []);
          this.parents.unshift({ name: 'None', id: '' });
          this.group.parentCircleId
            ? this.editGroupsForm.controls[`parentCircleId`].setValue(
                this.group.parentCircleId
              )
            : this.editGroupsForm.controls[`parentCircleId`].setValue(
                this.parents[0].id
              );
        }
      },
      (err) => {
        //
      }
    );
    this.groupsApi.getGroup(this.retdata).subscribe(
      (resp: any) => {
        this.group = resp.response[0];
        this.editGroupsForm.controls[`name`].setValue(this.group.name);
      },
      (err) => {
        // debugger;
      }
    );
  }

  submitt(form) {
    this.submitted = true;
    if (form.status.toLowerCase() === 'valid') {
      Object.assign(this.group, form.value);
      this.groupsApi.editGroup(this.group).subscribe(
        (resp) => {
          this.notifier.showSuccess('Alerts.GroupUpdated');
        },
        (err) => {
          //
        }
      );
    }
  }

  fileProgress(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    if (this.fileData.type.match(/image\/*/) == null) {
      this.fileError = true;
      this.fileData = {};
      return;
    }
    this.fileError = false;
    this.preview();
  }

  preview() {
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    const reader2 = new FileReader();

    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.previewUrl = reader.result;
    };
    reader2.readAsBinaryString(this.fileData);
    reader2.onload = this._handleReaderLoaded.bind(this);
  }
  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.fileData = btoa(binaryString);
  }

  get editGroupFormControls() {
    return this.editGroupsForm.controls;
  }
}
