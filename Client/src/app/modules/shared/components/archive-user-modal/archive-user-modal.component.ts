import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import {
  NotificationService,
  SettingsApiService,
  ShareDataService
} from '../../../../services';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-archive-user-modal',
  templateUrl: './archive-user-modal.component.html'
})
export class ArchiveUserModalComponent implements OnInit {
  @Input() users;
  @Input() dismiss;
  @Input() close;
  @Output() outPut = new EventEmitter<any>();
  public currentUser = this.ngRedux.getState().userState;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private SettingsApi: SettingsApiService,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private shareService: ShareDataService
  ) {}

  ngOnInit() {}

  archiveUsers() {
    const dupRows = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );
    if (this.users.inviteId) {
      this.SettingsApi.deleteInvite(this.users.id).subscribe((res) => {
        dupRows.forEach((elem) => {
          if (elem.id !== this.users.inviteId) {
            this.shareService.pushRowsToPrint(elem);
          }
        });
        this.modalService.dismissAll();
        this.notifier.showSuccess('User Archived');
      });
    } else {
      this.SettingsApi.deleteUser([this.users.id]).subscribe((res) => {
        this.outPut.emit(true);
        dupRows.forEach((elem) => {
          if (elem.id !== this.users.id) {
            this.shareService.pushRowsToPrint(elem);
          }
        });
        this.modalService.dismissAll();
        this.notifier.showSuccess('User Archived');
      });
    }
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
