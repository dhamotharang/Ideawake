import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ChallengesApiService,
  EntityApiService,
  NotificationService,
  SharedApi
} from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import {
  CHALLENGE_DEFAULT_BANNER,
  CHALLENGE_STATUSES,
  ENTITY_TYPE
} from '../../../../utils';
import { PostIdeaComponent } from '../../../idea/components';
import { ArchiveChallengeModalComponent } from '../archive-challenge-modal/archive-challenge-modal.component';
import { ChallengeChangeStatusComponent } from '../challenge-change-status/challenge-change-status.component';
import { ChallengeSettingsComponent } from '../challenge-settings/challenge-settings.component';
import { ChallengeAudienceComponent } from '../challenge-audience/challenge-audience.component';
import { ChallengeBriefComponent } from '../challenge-brief/challenge-brief.component';
import { AddEditChallengeWorkflowComponent } from 'src/app/modules/workflow/components';

@Component({
  selector: 'app-challenge-top',
  templateUrl: './challenge-top.component.html',
  styleUrls: ['./challenge-top.component.scss']
})
export class ChallengeTopComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userChallengePermissions;
  @Input() challenge;

  @Output() update = new EventEmitter<void>();

  stateSub;
  userCommunityPermissions;

  // challenge;
  isLoading = true;
  defaultBanner = CHALLENGE_DEFAULT_BANNER;
  public challengeStatuses = CHALLENGE_STATUSES;

  public toggleDate = false;
  public toggleAlert = false;
  public selectGroups = false;
  totalCount;

  constructor(
    @Inject(DOCUMENT) document,
    private modalService: NgbModal,
    private challengesApiService: ChallengesApiService,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private router: Router,
    private entityApi: EntityApiService,
    private sharedApi: SharedApi
  ) {
    this.stateSub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userCommunityPermissions = userState.userCommunityPermissions;
      });
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    if (window.pageYOffset > 50) {
      const element = document.getElementById('navbar');
      element.classList.remove('hide-navigation');
      element.classList.add('topCallout');
    } else {
      const element = document.getElementById('navbar');
      element.classList.remove('topCallout');
      element.classList.add('hide-navigation');
    }
  }

  ngOnChanges() {
    this.isLoading = true;
    if (this.challenge) {
      this.isLoading = false;
      this.loadAnnouncements();
    }
  }

  openEditSettings() {
    const modalRef = this.modalService.open(ChallengeSettingsComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.modal = true;
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.challengeId = this.challenge.id;
    modalRef.componentInstance.data.subscribe(() => {
      this.update.emit();
    });
  }

  openEditAudience() {
    const modalRef = this.modalService.open(ChallengeAudienceComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.modal = true;
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.challengeId = this.challenge.id;
    modalRef.componentInstance.updateData.subscribe(() => {
      this.update.emit();
    });
  }

  openEditDetails() {
    const modalRef = this.modalService.open(ChallengeBriefComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.modal = true;
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.challengeId = this.challenge.id;
    modalRef.componentInstance.updateData.subscribe(() => {
      this.update.emit();
    });
  }

  openEditWorkflow() {
    const modalRef = this.modalService.open(AddEditChallengeWorkflowComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.modal = true;
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.challengeId = this.challenge.id;
    modalRef.componentInstance.updateData.subscribe(() => {
      this.update.emit();
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

  archiveChallenge() {
    this.challengesApiService
      .deleteChallenge(this.challenge.id)
      .subscribe(() => {
        this.notifier.showInfo('Challenge Archived', {
          positionClass: 'toast-bottom-center'
        });
        this.router.navigateByUrl('/');
      });
  }

  open(content) {
    this.modalService.open(content, {
      windowClass: 'outcomes-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  openArchiveModal() {
    const modalRef = this.modalService.open(ArchiveChallengeModalComponent, {
      windowClass: 'archive-modal',
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.componentInstance.archive.subscribe(() => {
      this.archiveChallenge();
      modalRef.close();
    });
  }

  openChallengeStatusSettings() {
    const modalRef = this.modalService.open(ChallengeChangeStatusComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.challenge = this.challenge;
    modalRef.componentInstance.update.subscribe(() => {
      this.update.emit();
    });
  }

  loadAnnouncements() {
    let entityObjectId = Number(this.challenge.id);
    let entityType = this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE).id;
    let params = {
      entityObjectId: entityObjectId,
      entityType: entityType,
      take: 1,
      skip: 0
    };

    this.sharedApi.getAnnouncements(params).subscribe((res: any) => {
      this.totalCount = res.response.totalCount;
    });
  }

  ngOnDestroy() {
    if (this.stateSub) {
      this.stateSub.unsubscribe();
    }
  }
}
