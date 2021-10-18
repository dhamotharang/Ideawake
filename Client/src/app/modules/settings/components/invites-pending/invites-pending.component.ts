import { Socket } from 'ngx-socket-io';
import { NgRedux } from '@angular-redux/store';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsApiService, NotificationService } from '../../../../services';
import { AppState } from '../../../../store';
@Component({
  selector: 'app-invites-pending',
  templateUrl: './invites-pending.component.html',
  styleUrls: ['./invites-pending.component.scss'],
  providers: [NotificationService]
})
export class InvitesPendingComponent implements OnInit, DoCheck, OnDestroy {
  public currentUser = this.ngRedux.getState().userState;
  private communityId = this.currentUser.currentCommunityId;
  constructor(
    private socket: Socket,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private settingsApiService: SettingsApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>
  ) {}
  public totalCount = 0;
  public counts;
  public invites;
  public confirmResend = false;
  public types = {
    all: 'all',
    pending: 'pending',
    accepted: 'accepted'
  };
  public defaultPage = {
    take: 10,
    skip: 0
  };
  public selectedTab =
    this.activatedRoute.snapshot.queryParams.tab || this.types.all;
  public searchParams: any;
  ngOnInit() {
    this.getInvitesCounts();
    this.searchParams = { ...this.defaultPage };
    this.changeTab(this.selectedTab);
    this.socket.fromEvent(this.communityId).subscribe((e) => {
      this.getInvitesList();
    });
  }

  search(text) {
    if (text) {
      this.searchParams.searchText = text;
    } else {
      delete this.searchParams.searchText;
    }
    this.getInvitesList();
  }

  changeTab(type) {
    this.selectedTab = type;
    if (this.selectedTab === this.types.accepted) {
      this.searchParams.inviteAccepted = true;
    } else if (this.selectedTab === this.types.pending) {
      this.searchParams.inviteAccepted = false;
    } else {
      delete this.searchParams.inviteAccepted;
    }
    this.searchParams = { ...this.searchParams, ...this.defaultPage };
    this.getInvitesList();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { tab: type }
    });
  }

  getInvitesCounts() {
    this.settingsApiService
      .getInvitesCounts({ community: this.communityId })
      .subscribe((res: any) => {
        this.counts = res.response;
      });
  }

  getInvitesList() {
    this.settingsApiService
      .getInvitesList(this.communityId, this.searchParams)
      .subscribe((res: any) => {
        this.invites = res.response.invites;
        this.totalCount = res.response.count;
      });
  }

  ngDoCheck() {}

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
    this.settingsApiService
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
    this.settingsApiService.deleteInvite(inviteId).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.notifier.showSuccess('Alerts.InviteRevoked');
        this.getInvitesList();
        this.getInvitesCounts();
      } else {
        this.notifier.showError(res.message);
      }
    });
  }

  resendAllInvites() {
    this.settingsApiService
      .reSendAllInvites({ community: this.communityId })
      .subscribe((res: any) => {
        this.confirmResend = false;
        if (res.statusCode === 200) {
          this.notifier.showSuccess('All pending invites have been resent.');
        } else {
          this.notifier.showError(res.message);
        }
      });
  }

  changePage(event) {
    this.defaultPage.take = event.take;
    this.searchParams = { ...this.searchParams, ...event };
    this.getInvitesList();
  }

  export() {
    this.settingsApiService
      .getInvites({ communityId: this.communityId, exportData: true })
      .subscribe((resp: any) => {
        const csvData = resp.response;
        const blob = new Blob([`\ufeff${csvData.headers}${csvData.data}`], {
          type: 'text/csv;charset=utf-8;'
        });
        const dwldLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        dwldLink.setAttribute('target', '_blank');
        dwldLink.setAttribute('href', url);
        dwldLink.setAttribute('download', 'Pending Invites' + '.csv');
        dwldLink.style.visibility = 'hidden';
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
        this.notifier.showSuccess('Download successful');
      });
  }

  ngOnDestroy() {
    // Disconnecting invites socket listener.
    this.socket.removeListener(this.communityId);
  }
}
