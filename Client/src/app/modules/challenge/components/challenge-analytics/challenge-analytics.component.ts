import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { AnalyticsApiService, ChallengesApiService } from '../../../../services';
import { TOP_USER_TYPE } from '../../../../utils';

@Component({
  selector: 'app-challenge-analytics',
  templateUrl: './challenge-analytics.component.html',
  styleUrls: ['./challenge-analytics.component.scss'],
  providers: [AnalyticsApiService]
})
export class ChallengeAnalyticsComponent implements OnInit {
  challengeId;
  challenge;
  topUserType = TOP_USER_TYPE;
  challengeActivitySummary;
  challengeActorEngagement;
  challengeLocationBasedPoints;

  constructor(
    private analyticsApi: AnalyticsApiService,
    private route: ActivatedRoute,
    private challengesApiService: ChallengesApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.challengeId = params.id;
      const challengeDetail = await this.getChallengeDetail();
      this.challenge = _.first(_.get(challengeDetail, 'response', []));
      this.getActiveSummary();
      this.getActorEngagement();
      this.getLocationBasedData();
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  private getChallengeDetail() {
    this.challengesApiService.getChallengeById(this.challengeId).toPromise();
  }

  private getActiveSummary() {
    this.analyticsApi
      .getChallengeActiveSummary(this.challengeId)
      .subscribe((res: any) => {
        this.challengeActivitySummary = res.response;
      });
  }

  private getActorEngagement() {
    this.analyticsApi
      .getChallengeActorEngagement(this.challengeId)
      .subscribe((res: any) => {
        this.challengeActorEngagement = res.response;
      });
  }

  private getLocationBasedData() {
    this.analyticsApi
      .getChallengeAnalyticsOnGeolocation(this.challengeId)
      .subscribe((res: any) => {
        this.challengeLocationBasedPoints = res.response;
      });
  }
}
