import { BehaviorSubject, Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ApiService,
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  DATA_TYPES,
  TableColumnConfig,
  TablePaginationConfig
} from 'src/app/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups-list-container',
  templateUrl: './groups-list-container.component.html',
  styleUrls: ['./groups-list-container.component.scss']
})
export class GroupsListContainerComponent implements OnInit, OnDestroy {
  closeResult: string;
  public parent; // set this to provide parent group for creating Sub-Group
  public users;
  @ViewChild('manageGroupRoles', { static: false }) m3: TemplateRef<any>;
  @ViewChild('deleteGroup', { static: false }) m4: TemplateRef<any>;
  @ViewChild('anchorTag', { static: true })
  customAnchorTagTemplate: TemplateRef<any>;
  @ViewChild('manageCol', { static: true })
  manageColTemplate: TemplateRef<any>;

  public columnConfigs: TableColumnConfig[];
  private allSub: Subscription[] = [];

  beforeDismiss: () => boolean | Promise<boolean>;
  private sub: Subscription;
  public totalCount: number = 0;
  public searchQuery: string = '';
  public tablePaginationConfig: TablePaginationConfig;
  public count = {
    active: 0,
    pending: 0,
    archived: 0
  };
  public onArchivingItem$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  public isLoading = false;

  constructor(
    private modalService: NgbModal,
    private groupsApiService: GroupsApiService,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private shareService: ShareDataService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.rows = this.shareService.rowsToPrint;
    this.users = [];
  }

  rows;
  rowsLength = 0;
  communityId;
  selected = [];
  archived = false;
  actions = `['fas', 'user-plus']`;

  columns = [
    { name: 'Group Name', key: 'name', routerLink: '/groups/view' },
    { name: 'Display Label', key: 'displayName' },
    { name: 'Users', key: 'users' },
    { name: 'Signup Rate', key: 'signupRate' }
    // { name: 'Child Groups', key: 'childGroups' }
    // { name: 'Status', key: 'status' }
  ];

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getGroupCount();
    this.resetTablePaginationObj();
    this.getGroupsList();
    this.columnConfigs = [
      {
        key: 'name',
        header: 'Group Name',
        customCellTemplate: this.customAnchorTagTemplate
      },
      { key: 'displayName', header: 'Display Label' },
      { key: 'users', header: 'Users' },
      { key: 'signupRate', header: 'Signup Rate' },
      {
        key: 'manage',
        header: 'Manage',
        customCellTemplate: this.manageColTemplate
      }
    ];
    this.allSub.push(
      this.onArchivingItem$.asObservable().subscribe((x) => {
        this.onArchivingItem(x);
      })
    );
  }
  getGroupCount() {
    this.groupsApiService.getGroupsCount().subscribe((data: any) => {
      this.count = data.response;
    });
  }
  getGroupsList(searchQuery = this.searchQuery) {
    if (this.searchQuery != searchQuery) {
      this.resetTablePaginationObj();
      this.searchQuery = searchQuery;
    }
    this.setResetLoading(true);

    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    this.groupsApiService
      .getGroupsByCommunityId(
        this.communityId,
        this.tablePaginationConfig.take,
        this.tablePaginationConfig.skip,
        '',
        'asc',
        this.searchQuery,
        this.archived
      )
      .subscribe((res: any) => {
        const groups = res.response.data;
        this.totalCount = res.response.count || this.totalCount;
        (groups || []).forEach((group) => {
          this.shareService.pushRowsToPrint({
            id: group.id,
            name: group.name,
            displayName: group.displayName,
            users: group.userCount,
            signupRate: group.signupPercentage,
            childGroups: group.numberOfChild,
            status: group.isDeleted ? 'Archived' : 'Active',
            manage: ''
          });
        });
      })
      .add(() => this.setResetLoading(false));
  }

  open(content, e = null) {
    if (e) {
      e.srcElement.blur();
      e.preventDefault();
    }
    this.modalService
      .open(content, {
        size: 'lg',
        backdrop: 'static',
        ariaLabelledBy: 'modal-basic-title'
      })
      .result.then(
        (result) => {},
        (reason) => {}
      );
  }

  onSelect(selection) {}

  pageSelected(page) {}

  showArchived(flag) {
    if (this.archived != flag) {
      this.shareService.rowsToPrint.splice(
        0,
        this.shareService.rowsToPrint.length
      );
    }
    this.archived = flag;
    this.resetTablePaginationObj();
    this.getGroupsList();
  }

  searchGroups(query) {
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    this.groupsApiService
      .getGroupsByCommunityId(
        this.communityId,
        9999,
        0,
        '',
        'asc',
        query,
        this.archived
      )
      .subscribe((res: any) => {
        const groups = res.response.data;
        (groups || []).forEach((group) => {
          this.shareService.pushRowsToPrint({
            id: group.id,
            name: group.name,
            displayName: group.displayName,
            users: group.userCount,
            signupRate: group.signupPercentage,
            childGroups: group.numberOfChild,
            status: group.isDeleted ? 'Archived' : 'Active',
            manage: ''
          });
        });
      });
  }

  resendInvite(row) {
    this.allSub.push(
      this.ngRedux.select(STATE_TYPES.userState).subscribe((state: any) => {
        this.groupsApiService
          .getInvitesByGroupId({
            groupId: row.id,
            communityId: state.currentCommunityId
          })
          .subscribe((res: any) => {
            const invites = res.response.data;
            const inviteIds = [];
            invites.forEach((invite) => {
              inviteIds.push(invite.id);
            });

            this.apiService
              .post('/invite/reset-invite', {
                inviteIds,
                communityId: state.currentCommunityId
              })
              .subscribe((response: any) => {
                this.notifier.showSuccess(response.message);
              });
          });
      })
    );
    this.modalService.dismissAll();
    this.router.navigate(['settings', 'invites-pending']);
  }
  tablePageChange(event: TablePaginationConfig) {
    this.tablePaginationConfig = event;
    event.firstLoad || this.getGroupsList();
  }
  resetTablePaginationObj() {
    this.tablePaginationConfig = {
      skip: 0,
      take: 10,
      firstLoad: true
    };
  }
  onArchivingItem(event) {
    if (event) {
      if (!this.rows.length && this.tablePaginationConfig.skip) {
        this.tablePaginationConfig.skip -= this.tablePaginationConfig.take;
      }
      this.getGroupsList();
      this.getGroupCount();
    }
  }
  setResetLoading(flag = false) {
    this.isLoading = flag;
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
