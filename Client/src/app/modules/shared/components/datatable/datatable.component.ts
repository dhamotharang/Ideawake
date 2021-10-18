import {
  ApiService,
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { DATA_TYPES, DEFAULT_PRELOADED_IMAGE } from '../../../../utils';

import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  providers: [GroupsApiService]
})
export class DatatableComponent implements OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  constructor(
    private modalService: NgbModal,
    private changeRef: ChangeDetectorRef,
    private groupApiService: GroupsApiService,
    private ngRedux: NgRedux<AppState>,
    private apiService: ApiService,
    private notifier: NotificationService,
    private router: Router,
    private shareService: ShareDataService
  ) {}
  @Input() rows;
  @Input() columns;
  @Input() selectionType;
  @Input() selectAllRowsOnPage;
  @Input() limit;
  @Input() rowHeight;
  @Input() headerHeight;
  @Input() footerHeight;
  @Input() columnWidth;
  @Input() columnSortable;
  @Input() columnAutoResizable;
  @Input() columnDraggable;
  @Input() columnResizable;
  @Input() headerCheckboxable;
  @Input() checkboxable;
  @Input() actions;
  @Input() modalCallback;
  @Input() archived;
  @Output() Select = new EventEmitter<any>();
  @Output() Page = new EventEmitter<any>();

  image = 'https://via.placeholder.com/40x40';

  users = [];
  groups = [];

  private sub1: Subscription;
  private sub2: Subscription;

  onSelect(row) {
    this.Select.emit(row);
  }

  pageSelected(page) {
    this.Page.emit(page);
  }

  detach() {}
  triggerCallback(str) {
    this.changeRef.detach();

    if (typeof this.modalCallback === DATA_TYPES.FUNCTION) {
      this.modalCallback(str);
    } else {
    }

    setTimeout(() => this.changeRef.reattach(), 2000);
  }

  resendInvitesUser(row) {
    this.sub1 = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.apiService
          .post('/invite/reset-invite', {
            inviteIds: [row.id],
            communityId: state.currentCommunityId
          })
          .subscribe((response: any) =>
            this.notifier.showSuccess('Invite Sent Successfully')
          );
      });
    this.modalService.dismissAll();
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
    this.groupApiService.removeGroupsFromUser(data).subscribe(
      (resp: any) => {
        if (resp.wasSuccess) {
          dupRows.forEach((elem) => {
            if (elem.id !== row.id) {
              this.shareService.pushRowsToPrint(elem);
            }
          });
          this.notifier.showSuccess('User removed from groups');
          this.modalService.dismissAll();
        }
      },
      (err) => {
        this.notifier.showError('Server Error');
        dupRows.forEach((elem) => {
          this.shareService.pushRowsToPrint(elem);
        });
      }
    );
  }

  resendInvite(row) {
    this.sub2 = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.groupApiService
          .getUsersByGroupId({
            groupId: row.id,
            communityId: state.currentCommunityId
          })
          .subscribe((res: any) => {
            const users = res.response.data;
            const inviteIds = [];
            users.forEach((user) => {
              inviteIds.push(user.id);
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
      });
    this.modalService.dismissAll();
    this.router.navigate(['settings', 'invites-pending']);
  }

  ngOnDestroy() {
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
    if (this.sub1) {
      this.sub2.unsubscribe();
    }
  }
}
