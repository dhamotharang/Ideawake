import { first, get, remove, isEmpty } from 'lodash';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ChallengesApiService,
  EntityApiService,
  NotificationService,
  RoleAndPermissionsApi,
  SharedApi,
  UtilService
} from '../../../../services';
import {
  CHALLENGE_DEFAULT_BANNER,
  CHALLENGE_STATUSES,
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE
} from 'src/app/utils/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import { AppState } from 'src/app/store';
import { PostIdeaComponent } from 'src/app/modules/idea/components';
import * as moment from 'moment';
import { UpdatesModalComponent } from 'src/app/modules/shared/components/updates-modal/updates-modal.component';

@Component({
  selector: 'app-challenge-updates',
  templateUrl: './challenge-updates.component.html',
  styleUrls: ['./challenge-updates.component.scss']
})
export class ChallengeUpdatesComponent implements OnInit {
  @Input() challengeId = this.activatedRoute.snapshot.params.id;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public challenge;
  public challengePermissions;
  totalCount;
  announcements = [];
  choice = 'feed';
  announcementId;
  isLoading = true;
  public defaultBanner = CHALLENGE_DEFAULT_BANNER;
  public challengeEntity;
  public currentUser;
  public permissionsData;
  public challengeStatuses = CHALLENGE_STATUSES;
  public expiryCounter;
  scrollDownDistance = 2;
  public count = 0;
  disableScroll = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private challengesApiService: ChallengesApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private sharedApi: SharedApi,
    private entityApi: EntityApiService,
    private modalService: NgbModal,
    private notifier: NotificationService,
    private entityApiService: EntityApiService,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private util: UtilService
  ) {}
  ngOnInit() {
    this.currentUser = this.ngRedux.getState().userState;
    this.activatedRoute.params.forEach((params: any) => {
      this.challengeId = params.id;
    });
    this.getChallenge();
    this.loadAnnouncements(this.choice);
    this.loadAnnouncement();
  }

  loadAnnouncement() {
    this.activatedRoute.queryParams.subscribe((param) => {
      const announcementId = parseInt(param.announcementId, 10);
      if (!announcementId) {
        return;
      }
      this.sharedApi.getAnnouncement(announcementId).subscribe(
        (res: any) => {
          if (!isEmpty(res.response)) {
            this.openModal(res.response);
          } else {
            this.router.navigateByUrl('/error/404');
          }
        },
        (err) => {
          this.router.navigateByUrl('/error/404');
        }
      );
    });
  }

  openModal(announcement) {
    const modalRef = this.modalService.open(UpdatesModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.level = 'community';
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

  changePage() {
    if (this.count >= this.totalCount) {
      return false;
    }
    this.loadAnnouncements(this.choice);
  }

  getChallenge() {
    this.getChallengeDetail();
    this.getChallengeAccessPermissions();
  }

  getChallengeDetail() {
    this.challengesApiService
      .getChallengeById(this.challengeId)
      .subscribe((res: any) => {
        this.challenge = first(get(res, 'response', []));
        this.isLoading = false;
      });
  }

  getChallengeAccessPermissions() {
    this.roleAndPermissionsApi
      .getUserPermissionsInChallenge(this.challengeId)
      .subscribe((res: any) => {
        this.challengePermissions = res.response;
      });
  }

  getChallengePermissions() {
    this.challengeEntity = this.entityApiService.getEntity(
      ENTITY_TYPE.CHALLENGE
    );

    const permissionParams = {
      entityType: this.challengeEntity.id,
      entityObjectId: this.challengeId,
      community: this.currentUser.currentCommunityId
    };

    this.roleAndPermissionsApi
      .getPermissionsByEntityTypeAndObjectId(permissionParams)
      .subscribe((res: any) => {
        this.permissionsData = res.response[0];
      });
  }

  openPostIdea() {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.modalRef = modalRef;
  }

  getTimeIntervals() {
    const expiryDate = get(this.challenge, 'expiryEndDate', moment());
    const diffDuration = moment.duration(moment(expiryDate).diff(moment()));
    const tempObj = {
      seconds: Math.max(0, diffDuration.get('seconds')),
      minutes: Math.max(0, diffDuration.get('minutes')),
      hours: Math.max(0, diffDuration.get('hours')),
      days: Math.max(0, moment(expiryDate).diff(moment(), 'days'))
    };
    this.expiryCounter = tempObj;
  }

  loadAnnouncements(value) {
    if (this.choice != value) {
      this.announcements = [];
      this.count = 0;
    }
    this.choice = value;
    if (value == 'feed') {
      let params = {
        entityObjectId: this.challengeId,
        entityType: this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id,
        take: 6,
        skip: this.count
      };

      this.sharedApi.getAnnouncements(params).subscribe(
        (res: {}) => {
          res['response']['announcements'].forEach((element) => {
            this.announcements.push(element);
          });
          this.count = this.announcements.length || 0;
          this.totalCount = res['response'].totalCount;
          this.disableScroll = false;
        },
        (err) => {}
      );
    } else if (value == 'allUpdates') {
      let params = {
        isDeleted: false,
        entityObjectId: this.challengeId,
        entityType: this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id,
        take: 6,
        skip: this.count
      };

      this.sharedApi.getFilteredAnnouncements(params).subscribe(
        (res: {}) => {
          res['response']['announcements'].forEach((element) => {
            this.announcements.push(element);
          });
          this.count = this.announcements.length || 0;
          this.totalCount = res['response'].totalCount;
          this.disableScroll = false;
        },
        (err) => {}
      );
    } else {
      let params = {
        isDeleted: false,
        entityObjectId: this.challengeId,
        entityType: this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id,
        status: value,
        take: 6,
        skip: this.count
      };

      this.sharedApi.getFilteredAnnouncements(params).subscribe(
        (res: {}) => {
          res['response']['announcements'].forEach((element) => {
            this.announcements.push(element);
          });
          this.count = this.announcements.length || 0;
          this.totalCount = res['response'].totalCount;
          this.disableScroll = false;
        },
        (err) => {}
      );
    }
  }

  open(content, announcementId) {
    this.announcementId = announcementId;
    this.modalService.open(content, {
      size: ''
    });
  }

  archiveUpdate() {
    this.sharedApi.deleteAnnouncement(this.announcementId).subscribe(
      (res: any) => {
        this.notifier.showSuccess('Update deleted successfully');
        remove(this.announcements, (value) => value.id == this.announcementId);
        this.totalCount = this.totalCount - 1;
      },
      (err) => {}
    );
  }
}
