import * as _ from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

import { ANALYTICS, PIE_CHART_DATA_POINTS } from '../../../../utils';
import { AppState } from '../../../../store';
import {
  AnalyticsApiService,
  CustomFieldApiService,
  DashboardService,
  EntityApiService
} from '../../../../services';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  @Input() data;
  @Output() removed = new EventEmitter<boolean>();
  template: any = {};
  searchText = null;
  backupData;
  entity;
  customFields;
  appliedFilters;
  pieChartDefaultPoints = PIE_CHART_DATA_POINTS;
  pieChartDefaultPointsArray = _.map(PIE_CHART_DATA_POINTS, (value, key) => {
    return { key, value };
  });

  public chartOptions;
  public chartLabels: Label[] = [];
  public chartType: ChartType;
  public chartData: number[] = [];

  public participationCounts;

  constructor(
    private entityApi: EntityApiService,
    private analytics: AnalyticsApiService,
    private dashboardApi: DashboardService,
    private customFieldApi: CustomFieldApiService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.chartType = ANALYTICS.ChartType.PieChart;
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20
        }
      },
      plugins: {
        datalabels: false
      }
    };
  }

  ngOnInit() {
    this.appliedFilters = {
      ..._.get(this.data.configData, 'actualFilters', {})
    };
    this.entity = _.find(this.entityApi.getAllEntities(), [
      'id',
      this.data.entityTypeId
    ]);
    this.backupData = _.cloneDeep(this.data);
    this.getCustomFields();
    this.fetchData();
  }

  private async getCustomFields() {
    this.customFields = _.get(
      await this.customFieldApi
        .getAllCustomFields({
          isDeleted: false,
          community: this.ngRedux.getState().userState.currentCommunityId
        })
        .toPromise(),
      'response'
    );
  }

  private async fetchData() {
    const data = _.get(
      await this.analytics
        .getPieChartData(this.data.entityTypeId, {
          opportunityFilter: {
            ...this.data.configData.opportunityFilter,
            isDeleted: false
          },
          graphDataPoint: this.data.configData.graphDataPoint,
          ...(_.get(this.data, 'configData.customField.id') && {
            customField: _.get(this.data, 'configData.customField.id')
          })
        })
        .toPromise(),
      'response'
    );
    this.chartLabels = _.map(data, 'title');
    this.chartData = _.map(data, 'count');
  }

  applyFilters(filters) {
    this.appliedFilters = { ...filters };
    this.data.configData.actualFilters = { ...this.appliedFilters };
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

    if (filters.stage === null || filters.stage === undefined) {
      delete filters.stage;
    }

    if (filters.workflow === null || filters.workflow === undefined) {
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
    this.template.editPie = false;
  }

  cancelChanges() {
    this.data = _.cloneDeep(this.backupData);
    this.template.editPie = false;
  }

  pieChartDefaultPointsSelect(key) {
    this.data.configData.graphDataPoint = key;
    this.data.configData.customField = {};
  }

  customFieldSelect(field) {
    this.data.configData.graphDataPoint = 'customField';
    this.data.configData.customField = field;
  }

  selectedOption() {
    const graphDataPoint = _.get(this.data, 'configData.graphDataPoint');
    if (graphDataPoint === 'customField') {
      return _.get(this.data, 'configData.customField.title', 'Custom Field');
    } else {
      return _.get(
        this.pieChartDefaultPoints,
        graphDataPoint,
        'Click here to see available options'
      );
    }
  }

  preserveOrder = () => 0;

  filterDefaultPoints() {
    return _.filter(this.pieChartDefaultPointsArray, (obj) => {
      const title = _.toLower(obj.value);
      const text = _.toLower(this.searchText);
      return title.indexOf(text) !== -1;
    });
  }

  filterCustomFields() {
    return _.filter(this.customFields, (s) => {
      const title = _.toLower(s.title);
      const text = _.toLower(this.searchText);
      return title.indexOf(text) !== -1;
    });
  }

  deleted(event) {
    this.removed.emit(event);
  }
}
