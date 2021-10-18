import { Component, OnInit } from '@angular/core';

import { AnalyticsApiService } from '../../../../services';
import { TOP_GROUP_TYPE, TOP_USER_TYPE } from '../../../../utils';

@Component({
  selector: 'app-community-analytics',
  templateUrl: './community-analytics.component.html',
  styleUrls: ['./community-analytics.component.scss'],
  providers: [AnalyticsApiService]
})
export class CommunityAnalyticsComponent implements OnInit {
  topUserType = TOP_USER_TYPE;
  topGroupType = TOP_GROUP_TYPE;
  communityOverallAnalytics;
  communityActiveSummary;
  communityLocationBasedPoints;
  constructor(private analyticsApi: AnalyticsApiService) {}

  ngOnInit() {
    this.getOverallCounts();
    this.getActveSummary();
    this.getLocationBasedData();
  }

  private getOverallCounts() {
    this.analyticsApi
      .getCommunityOverallAnalytics()
      .subscribe((res: any) => (this.communityOverallAnalytics = res.response));
  }

  private getActveSummary() {
    this.analyticsApi
      .getCommunityActiveSummary()
      .subscribe((res: any) => (this.communityActiveSummary = res.response));
  }

  private getLocationBasedData() {
    this.analyticsApi
      .getCommunityAnalyticsOnGeolocation()
      .subscribe(
        (res: any) => (this.communityLocationBasedPoints = res.response)
      );
  }
}
