import * as _ from 'lodash';

import { ChartDataSets, ChartType } from 'chart.js';
import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { ANALYTICS } from '../../../../utils';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-activity-summary',
  templateUrl: './activity-summary.component.html',
  styleUrls: ['./activity-summary.component.scss']
})
export class ActivitySummaryComponent implements OnInit, OnChanges {
  @Input() analytics;

  public chartOptions;
  public chartLabels: Label[];
  public chartType: ChartType;
  public chartData: ChartDataSets[];

  public participationCounts;

  constructor() {}

  ngOnInit() {
    this.initializeActivitySummaryChart();
  }

  private initializeActivitySummaryChart() {
    this.chartType = ANALYTICS.ChartType.BarChart;
    this.chartData = [
      {
        data: [],
        label: _.upperFirst(ANALYTICS.collections.submissions.term),
        backgroundColor: ANALYTICS.collections.submissions.color
      },
      {
        data: [],
        label: _.upperFirst(ANALYTICS.collections.comments.term),
        backgroundColor: ANALYTICS.collections.comments.color
      },
      {
        data: [],
        label: _.upperFirst(ANALYTICS.collections.votes.term),
        backgroundColor: ANALYTICS.collections.votes.color
      },
      {
        data: [],
        label: _.upperFirst(ANALYTICS.collections.shares.term),
        backgroundColor: ANALYTICS.collections.shares.color
      }
    ];

    this.chartOptions = {
      responsive: true,
      plugins: {
        datalabels: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    };
  }

  ngOnChanges() {
    if (this.analytics) {
      this.participationCounts = this.analytics.counts;
      this.populateChartData(this.analytics.chartData);
    }
  }

  private populateChartData(chartData) {
    this.populateChartLabels(chartData);
    for (const label of this.chartLabels) {
      let r1 = 0,
        r2 = 0,
        r3 = 0,
        r4 = 0;

      if (chartData.hasOwnProperty(label as string)) {
        const counts = chartData[label as string];
        r1 = this.findByType(counts, ANALYTICS.collections.submissions.term);
        r2 = this.findByType(counts, ANALYTICS.collections.comments.term);
        r3 = this.findByType(counts, ANALYTICS.collections.votes.term);
        r4 = this.findByType(counts, ANALYTICS.collections.shares.term);
      }

      _.first(this.chartData).data.push(r1);
      _.nth(this.chartData, 1).data.push(r2);
      _.nth(this.chartData, 2).data.push(r3);
      _.nth(this.chartData, 3).data.push(r4);
    }
  }

  private populateChartLabels(chartData) {
    this.chartLabels = [];
    this.chartLabels = chartData.dateRanges;
  }

  private findByType(arr: Array<any>, type) {
    const typeData = _.find(arr, ['type', type]);
    return typeData ? typeData.count : 0;
  }
}
