import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

import {
  GroupsApiService,
  NotificationService,
  ShareDataService
} from '../../../../services';

@Component({
  selector: 'app-archive-groups',
  templateUrl: './archive-groups.component.html',
  styleUrls: ['./archive-groups.component.scss']
})
export class ArchiveGroupsComponent implements OnInit {
  @Input() groupId;
  @Input() dismiss;
  @Input() close;
  @Input() onArchivingItemSub: BehaviorSubject<boolean>;

  constructor(
    private groupService: GroupsApiService,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private router: Router,
    private shareService: ShareDataService
  ) {}

  ngOnInit() {}

  archiveGroup() {
    const dupRows = [...this.shareService.rowsToPrint];
    this.shareService.rowsToPrint.splice(
      0,
      this.shareService.rowsToPrint.length
    );

    this.groupService.deleteGroup(this.groupId).subscribe((res) => {
      dupRows.forEach((elem) => {
        if (elem.id !== this.groupId) {
          this.shareService.pushRowsToPrint(elem);
        }
      });
      this.modalService.dismissAll();
      this.notifier.showSuccess('Group Archived');
      this.router.navigateByUrl('/groups/list');
      this.onArchivingItemSub && this.onArchivingItemSub.next(true);
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
