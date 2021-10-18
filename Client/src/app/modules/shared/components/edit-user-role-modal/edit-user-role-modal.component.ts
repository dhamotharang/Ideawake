import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { find, get } from 'lodash';
import { NgRedux } from '@angular-redux/store';
import {
  GroupsApiService,
  NotificationService,
  SettingsApiService,
  ShareDataService
} from '../../../../services';
import { AppState } from '../../../../store';
import { PERMISSIONS_MAP } from '../../../../utils';

@Component({
  selector: 'app-edit-user-role-modal',
  templateUrl: './edit-user-role-modal.component.html',
  providers: [GroupsApiService]
})
export class EditUserRoleModalComponent implements OnInit {
  @Input() user;
  @Input() dismiss;
  @Input() close;
  @Output() outPut = new EventEmitter<any>();
  roles = [];
  currentCommunityRole;
  canEdit = true;
  public currentUser = this.ngRedux.getState().userState;
  public communityPermissions = this.ngRedux.getState().userState
    .userCommunityPermissions;
  public editUserRoleForm = this.formBuilder.group({
    userRole: [null]
  });

  constructor(
    private ngRedux: NgRedux<AppState>,
    private settingsApi: SettingsApiService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private shareService: ShareDataService
  ) {}

  ngOnInit() {
    this.currentCommunityRole =
      this.user.role ||
      find(this.user.roles, [
        'communityId',
        this.currentUser.currentCommunityId
      ]);
    if (
      get(this.currentCommunityRole, 'role.abbreviation') === 'admin' &&
      this.communityPermissions.manageUserRoles ===
        PERMISSIONS_MAP.PARTIAL_ACCESS
    ) {
      this.canEdit = false;
    }
    if (this.currentCommunityRole) {
      this.editUserRoleForm.controls[`userRole`].setValue(
        this.currentCommunityRole.roleId
      );
    }
    this.getCommunityRoles();
  }

  getCommunityRoles() {
    this.settingsApi
      .getCommunityRoles('community', { manageableRoles: true })
      .subscribe((res: any) => {
        this.roles = res.response;
      });
  }

  saveRole(form) {
    const dupRows = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    if (this.user.inviteId) {
      const data = {
        role: form.value.userRole
      };
      this.settingsApi.updateInviteRole(this.user.id, data).subscribe(
        (resp) => {
          dupRows.forEach((elem) => {
            if (elem.id !== this.user.inviteId) {
              this.shareService.pushRowsToPrint(elem);
            } else {
              this.shareService.pushRowsToPrint(Object.assign(elem, data));
            }
          });
          this.modalService.dismissAll();
          this.notifier.showSuccess('Invitee Role Updated');
        },
        (err) => {}
      );
    } else {
      const data = {
        community: this.currentUser.currentCommunityId,
        userId: this.user.id,
        role: form.value.userRole
      };
      this.settingsApi.updateRole(data).subscribe(
        (resp) => {
          this.outPut.emit(true);
          dupRows.forEach((elem) => {
            if (elem.id !== this.user.id) {
              this.shareService.pushRowsToPrint(elem);
            } else {
              this.shareService.pushRowsToPrint(Object.assign(elem, data));
            }
          });
          this.modalService.dismissAll();
          this.notifier.showSuccess('User Role Updated');
        },
        (err) => {
          if (err.status === 500) {
            this.notifier.showError('Network error! Please try again.');
          } else {
            this.notifier.showError(err.message);
          }
        }
      );
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
