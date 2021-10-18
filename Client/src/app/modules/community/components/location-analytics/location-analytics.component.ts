import { Component, OnInit } from '@angular/core';

import { AnalyticsApiService } from '../../../../services';

@Component({
  selector: 'app-location-analytics',
  templateUrl: './location-analytics.component.html',
  styleUrls: ['./location-analytics.component.scss'],
  providers: [AnalyticsApiService]
})
export class LocationAnalyticsComponent implements OnInit {
  communityLocationBasedPoints;
  constructor(private analyticsApi: AnalyticsApiService) {}
  ngOnInit() {
    this.getLocationBasedData();
  }

  private getLocationBasedData() {
    this.analyticsApi
      .getCommunityAnalyticsOnGeolocation()
      .subscribe(
        (res: any) => (this.communityLocationBasedPoints = res.response)
      );
  }
}
