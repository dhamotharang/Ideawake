import * as _ from 'lodash';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DEFAULT_PRELOADED_IMAGE, PERMISSIONS_MAP } from '../../../../utils';
import { NotificationService, SettingsApiService } from '../../../../services';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

/* import { EditUserRoleModalComponent } from '../../../shared/components';
 */
@Component({
  selector: 'app-users-list-container',
  templateUrl: './users-list-container.component.html',
  styleUrls: ['./users-list-container.component.scss']
})
export class UsersListContainerComponent implements OnInit, OnDestroy {
  public image = 'https://via.placeholder.com/30x30';
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public currentUser = this.ngRedux.getState().userState;
  private communityId = this.currentUser.currentCommunityId;
  public selectAll = false;
  public currFilter = 'active';
  public count = {
    active: 0,
    pending: 0,
    archived: 0
  };
  public filters = {
    active: 'active',
    pending: 'pending',
    archived: 'archived'
  };
  userIds = [];
  usersDetail: any;
  selected = [];
  closeResult: string;
  rows = [];
  totalCount = 0;
  searchParams: any;
  permissionsMap = PERMISSIONS_MAP;

  public defaultPage = {
    sortType: 'desc',
    sortBy: 'lastLogin',
    take: 10,
    skip: 0
  };

  constructor(
    private modalService: NgbModal,
    private settingsApi: SettingsApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.changeFilter(this.currFilter);
    this.getCounts();
  }

  changeAllSelection(setVal: any) {
    this.selectAll = setVal;
    _.forEach(this.rows, (value, key) => {
      _.set(this.rows[key], 'checked', setVal);
    });
    this.selections();
  }

  selections() {
    const selection = [];
    _.forEach(this.rows, (value) => {
      if (value.checked) {
        selection.push(value.id);
      }
    });
    this.selected = selection;
  }

  getUserDetail() {
    this.settingsApi
      .getUsersDetail({ community: this.communityId, userIds: this.userIds })
      .subscribe((resp: any) => {
        this.usersDetail = resp.response;
      });
  }

  getList() {
    if (this.currFilter === this.filters.pending) {
      this.settingsApi
        .getInvitesList(this.communityId, {
          inviteAccepted: false,
          ...this.searchParams
        })
        .subscribe((res: any) => {
          this.rows = res.response.invites;
          this.totalCount = res.response.count;
        });
    } else {
      this.settingsApi
        .getUsers({
          communityId: this.communityId,
          ...this.searchParams,
          isUserPending: false
        })
        .subscribe((resp: any) => {
          this.rows = resp.response.data;
          this.totalCount = resp.response.count;
          this.userIds = _.map(this.rows, 'id');
          this.getUserDetail();
        });
    }
  }

  changeFilter(filter) {
    this.currFilter = filter;
    this.searchParams = _.cloneDeep(this.defaultPage);
    if (this.currFilter === this.filters.pending) {
      _.set(this.searchParams, 'inviteAccepted', false);
    } else if (this.currFilter === this.filters.archived) {
      _.set(this.searchParams, 'showArchived', true);
    } else if (this.currFilter === this.filters.active) {
      _.set(this.searchParams, 'showArchived', false);
    }
    this.getList();
  }

  searchUser(text) {
    if (text) {
      this.searchParams.searchText = text;
    } else {
      delete this.searchParams.searchText;
    }
    this.getList();
  }

  exportUserList() {
    if (this.currFilter !== this.filters.pending) {
      this.settingsApi
        .getUsers({
          communityId: this.communityId,
          exportData: true,
          showArchived:
            this.currFilter === this.filters.archived ? true : false,
          isUserPending: false
        })
        .subscribe(
          (resp: any) => {
            const csvData = resp.response;
            const blob = new Blob([`\ufeff${csvData.headers}${csvData.data}`], {
              type: 'text/csv;charset=utf-8;'
            });
            const dwldLink = document.createElement('a');
            const url = URL.createObjectURL(blob);
            dwldLink.setAttribute('target', '_blank');
            dwldLink.setAttribute('href', url);
            dwldLink.setAttribute('download', 'Users' + '.csv');
            dwldLink.style.visibility = 'hidden';
            document.body.appendChild(dwldLink);
            dwldLink.click();
            document.body.removeChild(dwldLink);
            this.notifier.showSuccess('Download successful');
          },
          (err) => {
            this.notifier.showError('Error');
          }
        );
    } else {
      this.settingsApi
        .getInvites({
          communityId: this.communityId,
          exportData: true
        })
        .subscribe(
          (resp: any) => {
            const csvData = resp.response;
            const blob = new Blob([`\ufeff${csvData.headers}${csvData.data}`], {
              type: 'text/csv;charset=utf-8;'
            });
            const dwldLink = document.createElement('a');
            const url = URL.createObjectURL(blob);
            dwldLink.setAttribute('target', '_blank');
            dwldLink.setAttribute('href', url);
            dwldLink.setAttribute('download', 'Pending Users' + '.csv');
            dwldLink.style.visibility = 'hidden';
            document.body.appendChild(dwldLink);
            dwldLink.click();
            document.body.removeChild(dwldLink);
            this.notifier.showSuccess('Download successful');
          },
          (err) => {
            this.notifier.showError('Error');
          }
        );
    }
  }

  getCounts() {
    this.settingsApi
      .getInvitesCounts({ community: this.communityId })
      .subscribe((resp: any) => {
        this.count.pending = resp.response.pending;
      });
    this.settingsApi
      .getUsersCount({ communityId: this.communityId })
      .subscribe((resp: any) => {
        this.count.active = resp.response.active;
        this.count.archived = resp.response.archive;
      });
  }

  open(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title'
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {}
      );
  }

  bulkArchive() {
    this.settingsApi.deleteUser(this.selected).subscribe(() => {
      this.getList();
      this.getCounts();
      this.notifier.showSuccess('User(s) Archived');
    });
  }

  archiveUser(id) {
    this.settingsApi.deleteUser([id]).subscribe(() => {
      this.getList();
      this.getCounts();
      this.notifier.showSuccess('User Archived');
    });
  }

  bulkUnarchive() {
    this.settingsApi.unarchiveUser(this.selected).subscribe(() => {
      this.getList();
      this.getCounts();
      this.notifier.showSuccess('User(s) Archived');
    });
  }

  unarchiveUser(id) {
    this.settingsApi.unarchiveUser([id]).subscribe(() => {
      this.getList();
      this.getCounts();
      this.notifier.showSuccess('User Unarchived');
    });
  }

  editUserRole(user) {
    /*  const modalRef = this.modalService.open(EditUserRoleModalComponent);
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.close = modalRef.close;
    modalRef.componentInstance.dismiss = modalRef.dismiss;
    modalRef.componentInstance.outPut.subscribe(() => { */
    this.getList();
    /*     });
     */
  }

  copyToClipboard(link) {
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    this.notifier.showSuccess('Alerts.LinkClipboard');
  }

  resendInvite(inviteId) {
    const inviteIds = [inviteId];
    this.settingsApi
      .reSendInvites({
        inviteIds,
        communityId: this.communityId
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showSuccess('Invite resent successfully.');
        } else {
          this.notifier.showError(res.message);
        }
      });
  }

  deleteInvite(inviteId) {
    this.settingsApi.deleteInvite(inviteId).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.notifier.showSuccess('Alerts.InviteRevoked');
        this.getList();
        this.getCounts();
      } else {
        this.notifier.showError(res.message);
      }
    });
  }

  populateDetail(type, id) {
    if (type === 'rank') {
      const rank = _.get(this.usersDetail, `${type}.${id}`, 0);
      switch (rank) {
        case 0:
          return '--';
        case 1:
          return '1st';
        case 2:
          return '2nd';
        case 3:
          return '3rd';
        default:
          return rank + 'th';
      }
    } else {
      return _.get(this.usersDetail, `${type}.${id}`, 0);
    }
  }

  changePage(event) {
    this.defaultPage.take = event.take;
    this.searchParams = { ...this.searchParams, ...event };
    this.getList();
  }
  ngOnDestroy() {}
}
