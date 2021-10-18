import * as _ from 'lodash';
import * as moment from 'moment';
import { interval, Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ChallengesApiService } from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import {
  CHALLENGE_DEFAULT_BANNER,
  CHALLENGE_STATUSES,
  CHALLENGE_STATUSES_ABBR,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';
import { PostIdeaComponent } from '../../../idea/components';
import { CollectOpportunityTypeComponent } from '../../../shared/components';

@Component({
  selector: 'app-challenges-list',
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.scss']
})
export class ChallengesListComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  isLoading = true;
  public selectedStatus = CHALLENGE_STATUSES_ABBR.OPEN;
  public challenges = [];
  public postOppPermissions;
  public expiryCounter = [];
  public dialogBox;
  public defaultBanner = CHALLENGE_DEFAULT_BANNER;
  public challengeStatuses = CHALLENGE_STATUSES;
  public challengeStatusesAbbr = CHALLENGE_STATUSES_ABBR;
  public currentUser = this.ngRedux.getState().userState;
  private sub: Subscription;
  private sub1: Subscription;
  private sub2: Subscription;
  public userCommunityPermissions;
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private challengesApiService: ChallengesApiService
  ) {}

  ngOnInit() {
    this.sub1 = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.userCommunityPermissions = state.userCommunityPermissions;
      });
    this.getChallenges();
    this.sub2 = interval(1000).subscribe((x) => {
      this.getTimeIntervals();
    });
  }

  getTimeIntervals() {
    for (let i = 0; i < this.challenges.length; i++) {
      if (_.get(this.challenges[i], 'haveExpiry', false)) {
        const expiryDate = _.get(this.challenges[i], 'expiryEndDate', moment());
        const diffDuration = moment.duration(moment(expiryDate).diff(moment()));
        const tempObj = {
          seconds: Math.max(0, diffDuration.get('seconds')),
          minutes: Math.max(0, diffDuration.get('minutes')),
          hours: Math.max(0, diffDuration.get('hours')),
          days: Math.max(0, moment(expiryDate).diff(moment(), 'days'))
        };
        this.expiryCounter[i] = tempObj;
      }
    }
  }
  getChallenges() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: UserState) => {
        this.isLoading = true;
        this.challengesApiService
          .searchChallenges({
            community: state.currentCommunityId,
            isDeleted: false,
            status: this.selectedStatus
          })
          .subscribe((res: any) => {
            this.challenges = _.get(res, 'response', []);
            this.isLoading = false;

            this.challengesApiService
              .getPostOpportunityPermissions({
                challenges: this.challenges.map((challenge) => challenge.id)
              })
              .subscribe((permRes: any) => {
                this.postOppPermissions = _.keyBy(
                  _.get(permRes, 'response', []),
                  'challenge'
                );
              });
          });
      });
  }

  changeStatusFilter(status) {
    this.selectedStatus = status;
    this.getChallenges();
  }

  open(challenge) {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.challenge = challenge;
    modalRef.componentInstance.modalRef = modalRef;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub) {
      this.sub1.unsubscribe();
    }
    if (this.sub) {
      this.sub2.unsubscribe();
    }
  }

  openPostChallenge() {
    const modalRef = this.modalService.open(CollectOpportunityTypeComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.data.subscribe((result) => {
      modalRef.close('success');
      this.router.navigate(['/challenges/post'], {
        queryParams: { opportunityType: result.id }
      });
    });
  }
}
