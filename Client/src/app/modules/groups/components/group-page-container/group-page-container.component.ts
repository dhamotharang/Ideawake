import * as _ from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ApiService,
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  DEFAULT_PRELOADED_IMAGE,
  TableColumnConfig,
  TablePaginationConfig
} from 'src/app/utils';

@Component({
  selector: 'app-group-page-container',
  templateUrl: './group-page-container.component.html',
  styleUrls: ['./group-page-container.component.scss']
})
export class GroupPageContainerComponent implements OnInit, OnDestroy {
  @ViewChild('nameColumnTemplate', { static: true })
  nameColumnTemplate: TemplateRef<any>;
  @ViewChild('groupsColumnTemplate', { static: true })
  groupsColumnTemplate: TemplateRef<any>;
  @ViewChild('manageCol', { static: true })
  manageColTemplate: TemplateRef<any>;
  public groupId;
  private communityId;

  public currFilter = '';
  closeResult: string;
  users;
  public count = {
    active: 0,
    pending: 0,
    archived: 0
  };

  public resolved = false;
  public isLoading = false;
  group;
  private sub: Subscription;
  public columnConfigs: TableColumnConfig[];
  private allSub: Subscription[] = [];
  public totalCount: number = 0;
  public tablePaginationConfig: TablePaginationConfig;
  public searchQuery: string = '';
  public refreshState$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private modalService: NgbModal,
    private groupsApi: GroupsApiService,
    private route: ActivatedRoute,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private router: Router,
    private shareService: ShareDataService,
    private apiService: ApiService
  ) {
    this.rows = this.shareService.rowsToPrint;
  }
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  image = 'https://via.placeholder.com/40x40';

  selected = [];

  rows;

  columns = [
    { name: 'Name', key: 'name', routerLink: '/groups' },
    { name: 'Email', key: 'email' },
    { name: 'Username', key: 'username' },
    { name: 'Groups', key: 'groups', modified: 'array' }
    // { name: 'Status', key: 'status' }
  ];

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.columnConfigs = [
      {
        key: 'name',
        header: 'Name',
        customCellTemplate: this.nameColumnTemplate
      },
      { key: 'email', header: 'Email' },
      { key: 'username', header: 'Username' },
      {
        key: 'groups',
        header: 'Groups',
        customCellTemplate: this.groupsColumnTemplate
      },
      {
        key: 'manage',
        header: 'Manage',
        customCellTemplate: this.manageColTemplate
      }
    ];
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.communityId = state.currentCommunityId;

        this.changeFilter('users');
        this.getCounts();
        this.groupsApi.getGroup(this.groupId).subscribe(
          (resp: any) => {
            this.resolved = true;
            this.group = resp.response[0];
          },
          (err) => {
            // debugger;
          }
        );
      });
    this.allSub.push(
      this.refreshState$.asObservable().subscribe((x) => {
        x && this.refreshPageState();
      })
    );
  }

  open(content) {
    if (content._def.references.addUserstoGroup) {
      this.groupsApi
        .getUsersByCommunityId(this.communityId)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            this.users = res.response;
          }
        });
    }
    this.modalService
      .open(content, {
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  removeUserGrp(row) {
    const data = {
      circleIds: [row.groupId],
      user: row.id
    };
    const dupRows = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    this.groupsApi.removeGroupsFromUser(data).subscribe(
      (resp: any) => {
        if (resp.wasSuccess) {
          if (dupRows.length == 1 && this.tablePaginationConfig.skip) {
            this.tablePaginationConfig.skip -= this.tablePaginationConfig.take;
          }
          this.refreshPageState();
          this.notifier.showSuccess('User removed from groups');
          this.modalService.dismissAll();
        }
      },
      (err) => {
        this.notifier.showError('Server Error');
      }
    );
  }
  resendInvitesUser(row) {
    this.allSub.push(
      this.ngRedux.select(STATE_TYPES.userState).subscribe((state: any) => {
        this.apiService
          .post('/invite/reset-invite', {
            inviteIds: [row.id],
            communityId: state.currentCommunityId
          })
          .subscribe((response: any) =>
            this.notifier.showSuccess('Invite Sent Successfully')
          );
      })
    );
    this.modalService.dismissAll();
  }

  exportUserList() {
    this.groupsApi
      .getUsersByGroupId({
        groupId: this.groupId,
        communityId: this.communityId,
        exportData: true,
        showArchived:
          this.currFilter.toLowerCase() === 'archived' ? true : false,
        isUserPending:
          this.currFilter.toLowerCase() === 'invites' ? true : false
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
          dwldLink.setAttribute('download', 'filename' + '.csv');
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
  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
  }

  search1(val) {
    if (val.length > 2 || !val) {
      this.changeFilter(this.currFilter, val);
    }
  }

  changeFilter(filter = this.currFilter, searchQuery = this.searchQuery) {
    if (this.currFilter != filter) {
      this.resetTablePaginationObj();
      this.currFilter = filter;
    }
    if (this.searchQuery != searchQuery) {
      this.resetTablePaginationObj();
      this.searchQuery = searchQuery;
    }

    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    this.setResetLoading(true);

    this.groupsApi
      .getUsersByGroupId({
        groupId: this.groupId,
        communityId: this.communityId,
        showArchived: filter === 'archived' ? true : false,
        searchByName: this.searchQuery,
        searchByEmail: this.searchQuery,
        offset: this.tablePaginationConfig.skip,
        limit: this.tablePaginationConfig.take,
        isUserPending: filter === 'invites' ? true : false
      })
      .subscribe(
        (resp: any) => {
          const users = resp.response.data;
          this.totalCount = resp.response.count || this.totalCount;
          (users || []).forEach((user) => {
            this.shareService.pushRowsToPrint({
              groupId: this.groupId,
              id: user.id,
              name: user.fullName,
              email: user.email,
              username: user.userName,
              profileImage: user.profileImage,
              groups: user.userCircles,
              status: user.isDeleted ? 'Archived' : 'Active'
            });
          });
        },
        (err) => {
          // debugger;
        }
      )
      .add(() => this.setResetLoading(false));
  }

  getCounts() {
    this.groupsApi
      .getUsersCount({ groupId: this.groupId, communityId: this.communityId })
      .subscribe(
        (resp: any) => {
          this.count.active = _.get(resp, 'response.active', 0);
          this.count.archived = _.get(resp, 'response.archive', 0);
          this.count.pending = _.get(resp, 'response.pending', 0);
        },
        (err) => {
          //
        }
      );
  }

  onSelect(selection) {}

  pageSelected(page) {}

  archiveGroup() {
    this.groupsApi.deleteGroup(this.groupId).subscribe((res) => {
      this.modalService.dismissAll();
      this.notifier.showSuccess('Group Archived');
      this.router.navigateByUrl('/groups/list');
    });
  }
  setResetLoading(flag = false) {
    this.isLoading = flag;
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  tablePageChange(event: TablePaginationConfig) {
    this.tablePaginationConfig = event;
    event.firstLoad || this.changeFilter(this.currFilter, this.searchQuery);
  }
  resetTablePaginationObj() {
    this.tablePaginationConfig = {
      skip: 0,
      take: 10,
      firstLoad: true
    };
  }
  refreshPageState() {
    this.changeFilter();
    this.getCounts();
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.allSub && this.allSub.length) {
      this.allSub.forEach((x) => x && x.unsubscribe());
    }
  }
}
