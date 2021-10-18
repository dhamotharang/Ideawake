import * as _ from 'lodash';

import { AppState, STATE_TYPES } from '../../../../store';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { FormBuilder } from '@angular/forms';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-user-groups-modal',
  templateUrl: './manage-user-groups-modal.component.html',
  providers: [GroupsApiService]
})
export class ManageUserGroupsModalComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() user;
  @Input() dismiss;
  @Input() close;

  notUserGroups = [];
  userGroups = [];
  removedGroups = [];

  public editUserRoleForm = this.formBuilder.group({
    userRole: [``]
  });

  private sub: Subscription;

  constructor(
    private groupsApi: GroupsApiService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private shareService: ShareDataService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        // this.communityId = state.currentCommunityId;
        this.groupsApi.getGroups().subscribe((resp: any) => {
          this.userGroups = _.map(this.user.groups, (a) => a.circle);
          this.notUserGroups = _.filter(
            resp.response,
            (a) =>
              false ===
              this.userGroups.some((b) => {
                if (a.id === b.id) {
                  b.userCount = a.userCount;
                }
                return a.id === b.id;
              })
          );
        });
      });
  }

  save() {
    if (this.removedGroups.length) {
      const dupRows = [...this.shareService.rowsToPrint];
      this.shareService.rowsToPrint.splice(
        0,
        this.shareService.rowsToPrint.length
      );
      const data = {
        circleIds: _.map(this.removedGroups, (a) => a.id),
        user: this.user.id
      };

      this.groupsApi.removeGroupsFromUser(data).subscribe(
        (resp: any) => {
          if (resp.wasSuccess) {
            _.forEach(dupRows, (elem) => {
              if (elem.id !== this.user.id) {
                this.shareService.pushRowsToPrint(elem);
              } else {
                elem.groups = elem.groups.filter((obj) => {
                  return !this.removedGroups.some((obj2) => {
                    return obj.circle.id === obj2.id;
                  });
                });
                this.shareService.pushRowsToPrint(elem);
              }
            });
            this.notifier.showSuccess('User removed from groups');
            this.dismiss('Success');
          }
        },
        (err) => {
          //  debugger;
        }
      );
    } else {
      this.dismiss();
    }
  }
  remove(id) {
    let removedGroup;
    this.userGroups = this.userGroups.filter((a) => {
      if (a.id === id) {
        removedGroup = a;
      }
      return a.id !== id;
    });
    this.notUserGroups.push(removedGroup);
    this.removedGroups.push(removedGroup);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
