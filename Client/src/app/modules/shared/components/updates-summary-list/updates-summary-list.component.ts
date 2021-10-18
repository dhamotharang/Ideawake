import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  EntityApiService,
  NotificationService,
  SharedApi,
  UtilService
} from 'src/app/services';
import {
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE,
  UPDATES_DEFAULT_BANNER
} from 'src/app/utils/constants';
import { find } from 'lodash';
import { UpdatesModalComponent } from '../updates-modal/updates-modal.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-updates-summary-list',
  templateUrl: './updates-summary-list.component.html',
  styleUrls: ['./updates-summary-list.component.scss']
})
export class UpdatesSummaryListComponent implements OnInit {
  closeResult: string;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public displayImage = UPDATES_DEFAULT_BANNER;
  announcements = [];
  announcement;
  totalCount;
  @Input() level = 'community';
  @Input() entityObjectId;
  @Input() inCard = false;

  constructor(
    private modalService: NgbModal,
    private sharedApi: SharedApi,
    private entityApi: EntityApiService,
    private notifier: NotificationService,
    private util: UtilService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadAnnouncements();
  }

  openModal(announcement) {
    this.util.navigateTo({ announcementId: announcement.id });
    const modalRef = this.modalService.open(UpdatesModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.level = this.level;
    modalRef.componentInstance.announcement = announcement;

    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.activatedRoute.snapshot.queryParams };
        delete p.announcementId;
        this.util.navigateTo(p);
        this.modalService.dismissAll();
      }
    );
  }

  setAnnouncement(announcement) {
    this.announcement = announcement;
  }

  loadAnnouncements() {
    let params = null;
    params = {
      take: 3,
      skip: 0
    };
    if (this.level == 'challenge') {
      let entityObjectId = Number(this.entityObjectId);
      let entityType = this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id;
      params = {
        entityObjectId: entityObjectId,
        entityType: entityType,
        take: 3,
        skip: 0
      };
    }
    this.sharedApi.getAnnouncements(params).subscribe(
      (res: any) => {
        // this.announcements = res.response.announcements;
        this.totalCount = res.response.totalCount;
        res.response.announcements.forEach((element) => {
          if (element.attachments.length) {
            const f = find(element.attachments, ['attachmentType', 'image']);

            if (f) {
              this.announcements.push({
                displayImage: f.url,
                data: element
              });
            } else {
              this.announcements.push({
                displayImage: this.displayImage,
                data: element
              });
            }
          } else {
            this.announcements.push({
              displayImage: this.displayImage,
              data: element
            });
          }
        });
      },
      (err) => {}
    );
  }

  dismissModal() {
    this.modalService.dismissAll();
    this.announcement = null;
  }

  archiveUpdate() {
    this.sharedApi.deleteAnnouncement(this.announcement.id).subscribe(
      (res: any) => {
        this.notifier.showSuccess('Update deleted successfully');
        this.loadAnnouncements();
      },
      (err) => {}
    );
  }
}
