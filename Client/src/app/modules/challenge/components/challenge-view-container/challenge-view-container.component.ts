import * as _ from 'lodash';
import * as moment from 'moment';

import { ActivatedRoute, Router } from '@angular/router';
import {
  AnalyticsApiService,
  ChallengesApiService,
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  PrizeApiService,
  RoleAndPermissionsApi,
  UtilService
} from '../../../../services';
import {
  CHALLENGE_DEFAULT_BANNER,
  CHALLENGE_STATUSES,
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE,
  ANALYTICS
} from '../../../../utils';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';

import { AppState } from '../../../../store';
import { Chart, ChartType } from 'chart.js';
import { DomSanitizer } from '@angular/platform-browser';
import { IdeaSummaryComponent } from '../../../idea/components/idea-summary/idea-summary.component';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostIdeaComponent } from '../../../idea/components';
import { I18nService } from 'src/app/modules/i18n/i18n.service';

@Component({
  selector: 'app-challenge-view-container',
  templateUrl: './challenge-view-container.component.html',
  styleUrls: ['./challenge-view-container.component.scss']
})
export class ChallengeViewContainerComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() challengeId = this.activatedRoute.snapshot.params.id;
  isLoading = true;
  public currentUser;
  public isSearching = false;
  public ideaEntity;
  public challengeEntity;
  public challenge;
  public expiryCounter;
  public ideas = [];
  public upvotes = [];
  public prizes = [];
  public upvoteCount;
  public upvoteDetail;
  public tagsData;
  public followersData;
  public commentCounts;
  public topScores;
  public permissionsData;
  public userChallengePermissions;
  public defaultBanner = CHALLENGE_DEFAULT_BANNER;
  public challengeStatuses = CHALLENGE_STATUSES;
  public chartData = [];
  public chartType: ChartType;
  public chartOptions;
  pieChart: any;

  private sub: Subscription;

  chartLabelData = ['No data'];
  chartColorData = [];
  chartNumbersData = [];
  donutChart: any;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private challengesApiService: ChallengesApiService,
    private opportunityApiService: OpportunityApiService,
    private entityApiService: EntityApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private prizeApiService: PrizeApiService,
    private activatedRoute: ActivatedRoute,
    private notifier: NotificationService,
    private util: UtilService,
    private router: Router,
    private analyticsApi: AnalyticsApiService,
    public sanitizer: DomSanitizer,
    private I18n: I18nService
  ) {
    this.chartType = ANALYTICS.ChartType.DoughNut;
    this.chartOptions = {
      responsive: true,
      legend: {
        display: true,
        position: 'bottom',
        align: 'start'
      },
      plugins: {
        datalabels: {
          display: false
        }
      }
    };
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.isLoading = true;
      this.currentUser = this.ngRedux.getState().userState;
      this.challengeId = params.id;
      this.getChallenge();
      this.viewCountIncrease();
    });
    this.sub = interval(1000).subscribe((x) => {
      if (_.get(this.challenge, 'haveExpiry', false)) {
        this.getTimeIntervals();
      }
    });
  }

  getChallenge() {
    this.getChallengeDetail();
    this.getChallengeAccessPermissions();
    this.getRecentOpportunities();
    this.getChallengePermissions();
    this.getChallengePrizes();
    this.getChartData(this.challengeId);
  }

  getTimeIntervals() {
    const expiryDate = _.get(this.challenge, 'expiryEndDate', moment());
    const diffDuration = moment.duration(moment(expiryDate).diff(moment()));
    const tempObj = {
      seconds: Math.max(0, diffDuration.get('seconds')),
      minutes: Math.max(0, diffDuration.get('minutes')),
      hours: Math.max(0, diffDuration.get('hours')),
      days: Math.max(0, moment(expiryDate).diff(moment(), 'days'))
    };
    this.expiryCounter = tempObj;
  }

  getChallengeDetail() {
    this.challengesApiService
      .getChallengeById(this.challengeId)
      .subscribe((res: any) => {
        this.challenge = _.first(_.get(res, 'response', []));
        this.addNameInAttachments();
        if (_.isEmpty(this.challenge)) {
          this.router.navigateByUrl('/error/404');
        }
        this.isLoading = false;
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

  getChallengeAccessPermissions() {
    this.roleAndPermissionsApi
      .getUserPermissionsInChallenge(this.challengeId)
      .subscribe((res: any) => (this.userChallengePermissions = res.response));
  }

  viewCountIncrease() {
    this.challengesApiService.addChallengeView(this.challengeId).toPromise();
  }

  async getRecentOpportunities(params?) {
    this.ideaEntity = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
    const queryParams = {
      ...params,
      ...{
        take: 3,
        skip: 0,
        isDeleted: false,
        draft: false,
        community: this.currentUser.currentCommunityId,
        challenge: this.challengeId
      }
    };
    this.isSearching = true;
    const ideasDetail = await this.opportunityApiService
      .getOpportunity(queryParams)
      .toPromise()
      .then((res: any) => {
        res.response.data.forEach((row) => {
          row.entityObject = {
            community: this.currentUser.currentCommunityId,
            entityType: this.ideaEntity.id,
            entityObjectId: row.id,
            displayName: row.title,
            url: `/idea/view/${row.id}`,
            email: this.currentUser.user.email,
            entity: this.ideaEntity.entityCode
          };
        });
        return res.response;
      });
    this.ideas = ideasDetail.data;
    this.upvotes = ideasDetail.upvotes;
    this.tagsData = ideasDetail.tagsData;
    this.commentCounts = ideasDetail.commentCounts;
    this.upvoteDetail = ideasDetail.upvoteData;
    this.topScores = ideasDetail.topScores || {};
    this.followersData = ideasDetail.followersData;
    this.openIdeaModalFromUrl();
  }

  openIdeaModalFromUrl() {
    this.activatedRoute.queryParams.subscribe((param) => {
      const ideaId = parseInt(param.oid, 10);
      if (!ideaId) {
        return;
      }
      this.openSummaryModal(ideaId);
    });
  }

  getChartData(challengeId) {
    this.analyticsApi
      .getOpportunityAnalyticsOnStatus({ challenge: challengeId })
      .subscribe((res: any) => {
        if (res.response.length) {
          this.chartLabelData = [];
          this.chartColorData = [];
          this.chartNumbersData = [];
          _.map(res.response, (statusData) => {
            this.chartLabelData.push(
              this.I18n.getTranslation('Statuses.' + statusData.statusTitle)
            );
            this.chartColorData.push(statusData.statusColorCode);
            this.chartNumbersData.push(parseInt(statusData.total, 10));
          });
          this.chartData = [
            {
              labels: 'Opportunities By Status',
              data: this.chartNumbersData,
              backgroundColor: this.chartColorData
            }
          ];
        } else {
          this.chartData = [
            {
              labels: 'No data',
              backgroundColor: ['#D3D3D3'],
              data: [100]
            }
          ];
        }
      });
  }

  open(content) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }

  openSummaryModal(ideaId) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.ideaId = ideaId;
    modalRef.componentInstance.changeRef.detectChanges();
    modalRef.componentInstance.updatedIdea.subscribe(() => {
      this.getChallengeDetail();
    });

    modalRef.componentInstance.archive.subscribe((updatedIdea) => {
      this.archiveIdea(updatedIdea);
    });

    modalRef.result.then(
      () => {},
      () => {
        const p = { ...this.activatedRoute.snapshot.queryParams };
        delete p.oid;
        this.util.navigateTo(p);
        this.modalService.dismissAll();
      }
    );
  }

  archiveIdea(idea) {
    this.opportunityApiService.archiveOpportunity(idea.id).subscribe(
      (res: any) => {
        this.notifier.showInfo(`${idea.title} has been successfully archived`, {
          positionClass: 'toast-bottom-right'
        });
        const index = this.ideas.findIndex((r) => r.id === idea.id);
        this.ideas.splice(index, 1);
      },
      (err) => this.notifier.showInfo('Something Went Wrong')
    );
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

  updatePermissionSettings(permissions) {
    this.permissionsData = permissions;
    this.getChallengePrizes();
  }

  updateSummaryParams(idea, i) {
    const p = { ...this.activatedRoute.snapshot.queryParams, oid: idea.id };
    this.util.navigateTo(p);
    this.openSummaryModal(idea.id);
  }

  getChallengePrizes() {
    this.prizeApiService
      .getPrizes({ challenge: this.challengeId, isDeleted: false })
      .subscribe((res: any) => {
        this.prizes = res.response;
      });
  }

  newPrize(data) {
    data.challenge = this.challengeId;
    data.community = this.currentUser.currentCommunityId;
    this.prizeApiService.postPrize(data).subscribe(() => {
      this.getChallengePrizes();
    });
  }

  prizeUpdated(e) {
    this.getChallengePrizes();
  }

  addNameInAttachments() {
    if (_.get(this.challenge.challengeAttachments, 'length')) {
      this.challenge.challengeAttachments.forEach((value, index) => {
        this.challenge.challengeAttachments[index].name = _.last(
          _.split(value.url, '/')
        ).replace(/^[0-9]+/, '');
      });
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
