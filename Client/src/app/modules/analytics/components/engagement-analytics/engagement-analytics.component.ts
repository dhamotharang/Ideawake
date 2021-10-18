import { ChartType } from 'chart.js';
import { Label, MultiDataSet } from 'ng2-charts';

import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { ANALYTICS } from '../../../../utils';

@Component({
  selector: 'app-engagement-analytics',
  templateUrl: './engagement-analytics.component.html',
  styleUrls: ['./engagement-analytics.component.scss']
})
export class EngagementAnalyticsComponent implements OnInit, OnChanges {
  @Input() analytics;
  public chartOptions;
  public chartLabels: Label[];
  public chartType: ChartType;
  public chartData: MultiDataSet;

  public show = true;

  constructor() {
    this.chartOptions = {
      responsive: true,
      plugins: {
        datalabels: false
      }
    };

    this.chartData = [];
    this.chartLabels = ['', ''];
    this.chartType = ANALYTICS.ChartType.DoughNut;
  }

  ngOnInit() {}

  ngOnChanges() {
    if (this.analytics) {
      this.populateChartData(this.analytics);
    }
  }

  private populateChartData(chartData) {
    const total =
      chartData.targeted + chartData.viewed + chartData.participated;
    this.chartData = [
      chartData.targeted !== 0
        ? [chartData.targeted, total - chartData.targeted]
        : [],
      chartData.viewed !== 0
        ? [chartData.viewed, total - chartData.viewed]
        : [],
      chartData.participated !== 0
        ? [chartData.participated, total - chartData.participated]
        : []
    ];

    this.show = total !== 0;
  }
}
