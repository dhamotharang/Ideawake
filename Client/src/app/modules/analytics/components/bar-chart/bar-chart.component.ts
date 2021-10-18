import * as _ from 'lodash';

import { ANALYTICS, PIE_CHART_DATA_POINTS } from '../../../../utils';
import {
  AnalyticsApiService,
  DashboardService,
  EntityApiService
} from '../../../../services';
import { ChartOptions, ChartType } from 'chart.js';
import { Component, Input, OnInit } from '@angular/core';

import { Label } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
  @Input() data;

  backupData;
  editPie = false;
  entity;
  appliedFilters;
  pieChartDefaultPoints = PIE_CHART_DATA_POINTS;

  public chartOptions: ChartOptions;
  public chartLabels: Label[] = [];
  public chartType: ChartType;
  public chartData: number[] = [];

  public participationCounts;

  constructor(
    private entityApi: EntityApiService,
    private analytics: AnalyticsApiService,
    private dashboardApi: DashboardService
  ) {
    this.chartType = ANALYTICS.ChartType.BarChart;

    this.chartOptions = {
      responsive: true,
      legend: {
        position: 'top'
      }
    };
  }

  ngOnInit() {
    this.appliedFilters = this.data.configData.opportunityFilter;
    this.entity = _.find(this.entityApi.getAllEntities(), [
      'id',
      this.data.entityTypeId
    ]);
    this.backupData = _.cloneDeep(this.data);
    this.fetchData();
  }

  async fetchData() {
    const data = _.get(
      await this.analytics
        .getPieChartData(this.data.entityTypeId, {
          opportunityFilter: this.data.configData.opportunityFilter,
          graphDataPoint: this.data.configData.graphDataPoint
        })
        .toPromise(),
      'response'
    );
    this.chartLabels = _.map(data, 'title');
    this.chartData = _.map(data, 'count');
  }

  applyFilters(filters) {
    this.appliedFilters = { ...filters };
    this.mapFilters();
  }

  private mapFilters() {
    const filters = _.cloneDeep(this.appliedFilters);

    filters.opportunityTypes = _.map(filters.opportunityTypes, 'id');
    filters.statuses = _.map(filters.statuses, 'id');
    filters.tags = _.map(filters.tags, 'id');
    filters.workflow = _.get(filters.workflow, 'id');
    filters.stage = _.get(filters.stage, 'id');

    if (_.isEmpty(filters.tags)) {
      delete filters.tags;
    }
    if (_.isEmpty(filters.opportunityTypes)) {
      delete filters.opportunityTypes;
    }
    if (_.isEmpty(filters.customFields)) {
      delete filters.customFields;
    }
    if (_.isEmpty(filters.stage)) {
      delete filters.stage;
    }
    if (_.isEmpty(filters.workflow)) {
      delete filters.workflow;
    }

    if (_.isEmpty(filters.statuses)) {
      delete filters.statuses;
    }

    this.data.configData.opportunityFilter = { ...filters };
  }

  async editWidget() {
    await this.dashboardApi.updateGadget(this.data.id, this.data).toPromise();
    await this.fetchData();
    this.editPie = false;
  }

  cancelChanges() {
    this.data = _.cloneDeep(this.backupData);
    this.editPie = false;
  }

  preserveOrder = () => 0;
}
