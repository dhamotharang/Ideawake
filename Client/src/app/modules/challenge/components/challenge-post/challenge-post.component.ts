import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LOAD_ALL_FILES,
  LOAD_SELECTED_CHALLENGE_FILES
} from '../../../../actions';
import {
  ChallengesApiService,
  NotificationService
} from '../../../../services';
import { AppState, Files, STATE_TYPES } from '../../../../store';

@Component({
  selector: 'app-challenge-post',
  templateUrl: './challenge-post.component.html',
  styleUrls: ['./challenge-post.component.scss']
})
export class ChallengePostComponent implements OnInit, OnDestroy {
  @ViewChild('tabset', { static: false }) tabsElement: ElementRef<any>;

  challengeId = this.activatedRoute.snapshot.params.id;
  queryParams: any = this.activatedRoute.snapshot.queryParams;
  challengePermissions = _.get(
    this.activatedRoute.snapshot.data.permissions,
    'response'
  );
  challenge: any = {};
  communityId;
  attachments;
  workFlowSelected;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private challengesApiService: ChallengesApiService,
    private notifier: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.attachments = files.challengeFiles.selected;
      });
  }

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    if (this.challengeId) {
      this.getChallenge();
    } else if (this.queryParams.opportunityType) {
      this.challenge.opportunityType = this.queryParams.opportunityType;
      this.challenge.community = this.communityId;
      this.challenge.user = this.ngRedux.getState().userState.user.id;
    }
  }

  getChallenge() {
    this.challengesApiService
      .getChallengeById(this.challengeId)
      .subscribe((res: any) => {
        this.challenge = _.first(_.get(res, 'response', []));
        this.challenge.opportunityType = this.challenge.opportunityType.id;
        this.ngRedux.dispatch({
          type: LOAD_ALL_FILES,
          all: []
        });
        this.ngRedux.dispatch({
          type: LOAD_SELECTED_CHALLENGE_FILES,
          selected: this.challenge.challengeAttachments
        });
      });
  }

  updateChallenge() {
    this.challenge.participants = this.challenge.challengeParticipant;
    this.challengesApiService
      .updateChallenge(this.challengeId, {
        ...this.challenge,
        attachments: _.map(this.attachments, (obj) => {
          obj.isSelected = obj.isSelected ? 1 : 0;
          return obj;
        })
      })
      .subscribe((res: any) => {
        this.notifier.showSuccess('Alerts.ChallengeUpdateSuccess');
        this.router.navigateByUrl(`/challenges/view/${this.challengeId}`);
      });
  }

  postChallenge() {
    this.challenge.participants = this.challenge.challengeParticipant;
    this.challengesApiService
      .postChallenge({
        ...this.challenge,
        ...(!this.challenge.haveExpiry && {
          expiryStartDate: null,
          expiryEndDate: null
        }),
        attachments: _.map(this.attachments, (obj) => {
          obj.isSelected = obj.isSelected ? 1 : 0;
          return obj;
        })
      })
      .subscribe((res: any) => {
        this.notifier.showSuccess('Alerts.ChallengePostSuccess', {
          positionClass: 'toast-bottom-center'
        });
        this.router.navigateByUrl(`/challenges/view/${res.response.id}`);
      });
  }

  audienceCollection(audience) {
    this.challenge.challengeParticipant = audience.challengeParticipant;
    this.challenge.moderators = audience.moderators;
    this.challenge.sponsors = audience.sponsors;
  }

  briefInfo(brief) {
    this.challenge.title = brief.title;
    this.challenge.description = brief.description;
    this.challenge.bannerImage = brief.bannerImage;
    this.challenge.tags = brief.tags;
    this.challenge.hasAdditionalBrief = brief.hasAdditionalBrief;
    this.challenge.additionalBrief = brief.additionalBrief;
    this.challenge.haveExpiry = brief.haveExpiry;
    this.challenge.expiryStartDate = brief.expiryStartDate;
    this.challenge.expiryEndDate = brief.expiryEndDate;
  }

  experienceSettings(data) {
    this.challenge.entityExperienceSetting = data.settings;
    this.challenge.submissionVisibilitySetting =
      data.submissionVisibilitySetting;
    this.challenge.prizes = data.prizes;
    this.challenge.subFormFields = data.subFormFields;
  }

  switchTab(event, tabset) {
    tabset.select(event.tab);
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: []
    });

    this.ngRedux.dispatch({
      type: LOAD_SELECTED_CHALLENGE_FILES,
      selected: []
    });
  }

  saveChallenge() {
    this.challenge.workflow = _.get(this.workFlowSelected, 'id', null);
    this.challenge.workflowId = _.get(this.workFlowSelected, 'id', null);
    if (!this.challengeId) {
      this.postChallenge();
    } else {
      this.updateChallenge();
    }
  }
}
