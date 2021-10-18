import * as _ from 'lodash';

import { AppState, STATE_TYPES } from '../../../../store';
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
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  providers: [GroupsApiService]
})
export class EditGroupModalComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() retdata;
  @Output() close1: EventEmitter<any> = new EventEmitter();

  group;
  dataToSend = [];
  public fileData;
  public previewUrl;
  public fileError = false;
  private sub: Subscription;

  constructor(
    private groupsApi: GroupsApiService,
    private notifier: NotificationService,
    private formBuilder: FormBuilder,
    private shareService: ShareDataService,
    private ngRedux: NgRedux<AppState>
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

    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        // this.communityId = state.currentCommunityId;
        this.groupsApi.getGroups().subscribe((res: any) => {
          if (res.wasSuccess) {
            this.parents = _.get(res, 'response.data', []);
            this.parents.unshift({ name: 'None', id: '' });
          }
        });
        this.groupsApi.getGroup(this.retdata).subscribe(
          (resp: any) => {
            this.group = resp.response[0];
            this.editGroupsForm.controls[`name`].setValue(this.group.name);
            this.editGroupsForm.controls[`displayName`].setValue(
              this.group.displayName
            );
            this.group.parentCircleId
              ? this.editGroupsForm.controls[`parentCircleId`].setValue(
                  this.group.parentCircleId
                )
              : this.editGroupsForm.controls[`parentCircleId`].setValue(
                  this.parents[0].id
                );
          },
          (err) => {
            // debugger;
          }
        );
      });
  }

  submit(form) {
    const dupRows = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );

    this.submitted = true;
    if (form.status.toLowerCase() === 'valid') {
      Object.assign(this.group, form.value);
      this.groupsApi.editGroup(this.group).subscribe(
        (resp) => {
          dupRows.forEach((elem) => {
            if (elem.id !== this.group.id) {
              this.shareService.pushRowsToPrint(elem);
            } else {
              this.shareService.pushRowsToPrint(
                Object.assign(elem, this.group)
              );
            }
          });
          this.notifier.showSuccess('Alerts.GroupUpdated');
          this.close1.emit();
        },
        (err) => {
          dupRows.forEach((elem) => {
            this.shareService.pushRowsToPrint(elem);
          });
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

  closeModal() {
    this.close1.emit();
  }

  get editGroupFormControls() {
    return this.editGroupsForm.controls;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
