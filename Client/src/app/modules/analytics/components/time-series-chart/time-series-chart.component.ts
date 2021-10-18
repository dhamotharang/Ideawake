import * as _ from 'lodash';

import {
  ANALYTICS,
  CHART_DATA_FREQUENCY,
  DATA_FREQUENCY_MONTHS
} from '../../../../utils';
import {
  AnalyticsApiService,
  CustomFieldApiService,
  DashboardService,
  EntityApiService,
  OpportunityApiService,
  StatusApiService,
  WorkflowApiService
} from '../../../../services';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import { ChartDataSets, ChartType } from 'chart.js';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-time-series-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss']
})
export class TimeSeriesChartComponent implements OnInit {
  public lineChartData: ChartDataSets[];
  public lineChartLabels: Label[];
  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    legend: {
      labels: {
        boxWidth: 20
      }
    },
    plugins: {
      datalabels: false // disable plugin 'datalabels' for this instance
    },
    tooltips: {
      position: 'nearest'
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          ticks: {
            autoSkip: true,
            maxRotation: 90,
            minRotation: 70,
            maxTicksLimit: 15
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 0,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        }
      ]
    }
  };

  public lineChartLegend = true;
  public loading = true;
  public lineChartType: ChartType = ANALYTICS.ChartType.LineChart;
  public lineChartPlugins = [];
  public lineChartColors: Color[] = [];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  @Input() data;
  @Output() removed = new EventEmitter<boolean>();
  opportunityStatuses;
  opportunityTypes;
  workflows;
  customFields;
  selectedStages = [];
  dataFrequency = CHART_DATA_FREQUENCY;
  selectedDataFrequency;

  template: any = {};
  backupData;
  entity;
  appliedFilters;

  constructor(
    private entityApi: EntityApiService,
    private statusApi: StatusApiService,
    private opportunityApi: OpportunityApiService,
    private workflowApi: WorkflowApiService,
    private dashboardApi: DashboardService,
    private analyticsApi: AnalyticsApiService,
    private customFieldApi: CustomFieldApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  async ngOnInit() {
    this.fetchData();
    this.backupData = _.cloneDeep(this.data);
    this.appliedFilters = _.get(this.data.configData, 'actualFilters', {});
    this.template = _.get(this.data.configData, 'selection', {});
    this.selectedDataFrequency = _.get(
      this.data.configData,
      'spanType',
      CHART_DATA_FREQUENCY.DAILY.type
    );
    this.selectedStages = _.get(
      this.data.configData,
      'graphDataPoints.stages',
      []
    );

    this.entity = _.find(this.entityApi.getAllEntities(), [
      'id',
      this.data.entityTypeId
    ]);

    this.getOpportunityStatuses();
    this.getOpportunityTypes();
    this.getNumberCustomFields();
    await this.getWorkflows();

    _.forEach(this.workflows, (w) => {
      this.getStages(w);
    });
  }

  selectStage(e: Event, stage) {
    e.stopPropagation();
    const key = `${stage.id}|stages`;
    this.template[key] = !this.template[key];
    if (_.find(this.selectedStages, (st) => st === stage.id)) {
      _.remove(this.selectedStages, (st) => st === stage.id);
    } else {
      this.selectedStages = this.selectedStages || [];
      this.selectedStages.push(stage.id);
    }
  }

  allWorkflowsCheckUnCheck() {
    this.template.workflow = !this.template.workflow;
    for (const workflow of this.workflows) {
      const key = `${workflow.id}|workflow`;
      this.template[key] = false;
      if (!this.template[key]) {
        this.selectedStages = [];
        _.forEach(workflow.stages, (s) => {
          this.template[`${s.id}|stages`] = false;
        });
      }
    }
  }

  addSelectedWorkflowStages(workflow) {
    const key = `${workflow.id}|workflow`;
    this.template[key] = !this.template[key];

    if (!this.template[key]) {
      this.selectedStages = _.difference(
        this.selectedStages,
        _.map(workflow.stages, 'id')
      );
      _.forEach(workflow.stages, (s) => {
        this.template[`${s.id}|stages`] = false;
      });
    } else {
      _.forEach(workflow.stages, (s) => {
        this.template[`${s.id}|stages`] = true;
        this.selectedStages.push(s.id);
      });
    }
  }

  selectStatuses() {
    this.template.status = !this.template.status;
    _.forEach(this.opportunityStatuses, (status) => {
      this.template[`${status.id}|status`] = this.template.status;
    });
  }

  selectOpportunityTypes() {
    this.template.opportunityTypes = !this.template.opportunityTypes;
    _.forEach(this.opportunityTypes, (type) => {
      this.template[
        `${type.id}|opportunityTypes`
      ] = this.template.opportunityTypes;
    });
  }

  private async getOpportunityStatuses() {
    this.opportunityStatuses = _.get(
      await this.statusApi
        .getAll({
          community: this.ngRedux.getState().userState.currentCommunityId,
          isDeleted: false
        })
        .toPromise(),
      'response'
    );
  }

  private async getOpportunityTypes() {
    this.opportunityTypes = _.get(
      await this.opportunityApi
        .getOpportunityType({
          community: this.ngRedux.getState().userState.currentCommunityId
        })
        .toPromise(),
      'response'
    );
  }

  private async getWorkflows() {
    this.workflows = _.get(
      await this.workflowApi
        .getAllCommunityWorkflows({
          community: this.ngRedux.getState().userState.currentCommunityId,
          isDeleted: false
        })
        .toPromise(),
      'response'
    );
  }

  private async getStages(workflow) {
    workflow.stages = _.get(
      await this.workflowApi
        .getAllStages({
          workflow: workflow.id,
          isDeleted: false
        })
        .toPromise(),
      'response'
    );
  }

  private async getNumberCustomFields() {
    this.customFields = _.filter(
      _.get(await this.customFieldApi.getTypes().toPromise(), 'response'),
      ['abbreviation', 'number']
    );
  }

  private async fetchData() {
    this.loading = true;
    const params = _.cloneDeep(this.data.configData);
    params.opportunityFilter = {
      ...this.data.configData.opportunityFilter,
      isDeleted: false
    };
    delete params.actualFilters;
    delete params.selection;
    this.analyticsApi.getTimeSeriesData(params).subscribe(
      (res) => {
        this.mapChartData(_.get(res, 'response'));
        this.loading = false;
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  private sliceFrom() {
    const d = new Date();
    return (
      (d.getTime() -
        new Date(
          d.getFullYear(),
          d.getMonth() - DATA_FREQUENCY_MONTHS < 0
            ? d.getMonth()
            : d.getMonth() - DATA_FREQUENCY_MONTHS,
          d.getDate()
        ).getTime()) /
      (1000 * 60 * 60 * 24)
    );
  }

  private mapChartData(response) {
    const skipPeriod: number = this.getSkipPeriod();
    const range: [] = response.dateRange.slice(-this.sliceFrom());
    this.lineChartLabels = range;
    this.lineChartData = [];

    for (const key1 in response.graphData) {
      if (response.graphData.hasOwnProperty(key1)) {
        const data = response.graphData[key1];

        this.lineChartOptions.scales.xAxes[0].ticks.maxRotation =
          skipPeriod === 7 || skipPeriod === 1 ? 90 : 100;

        const groupedData = _.groupBy(
          data[this.selectedDataFrequency],
          'title'
        );

        for (const key in groupedData) {
          if (groupedData.hasOwnProperty(key)) {
            groupedData[key] = groupedData[key].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            this.lineChartData.push({
              data: range.map((date) => {
                const dataFound = _.find(groupedData[key], { date });
                return parseInt(_.get(dataFound, 'count', 0), 10);
              }),
              label: key
            });
          }
        }
      }
    }
  }

  private getSkipPeriod() {
    let s;
    switch (this.selectedDataFrequency) {
      case CHART_DATA_FREQUENCY.DAILY.type:
        s = 1;
        break;

      case CHART_DATA_FREQUENCY.WEEKLY.type:
        s = 7;
        break;

      case CHART_DATA_FREQUENCY.MONTHLY.type:
        s = 30;
        break;

      default:
        s = 1;
    }
    return s;
  }

  applyFilters(filters) {
    this.appliedFilters = { ...filters };
    this.data.configData.actualFilters = { ...filters };
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

  private buildDataPoints() {
    const obj1 = {},
      obj2 = {};
    for (const key in this.template) {
      if (this.template.hasOwnProperty(key) && this.template[key] === true) {
        const arr = _.split(key, '|');

        if (arr.length > 1) {
          obj1[arr[1]] = obj1[arr[1]] || [];
          obj1[arr[1]].push(parseInt(arr[0], 10));
        } else {
          obj2[arr[0]] = this.template[arr[0]];
        }
      }
    }

    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (obj2[key] === false || obj1.hasOwnProperty(key)) {
          delete obj2[key];

          if (obj1[key] === true) {
            delete obj1[key];
          }
        }
      }
    }
    this.data.configData.graphDataPoints = { ...obj1, ...obj2 };
  }

  private cleanTemplate() {
    for (const key in this.template) {
      if (!this.template[key]) {
        for (const key1 in this.template) {
          if (this.template.hasOwnProperty(key1)) {
            const arr = _.split(key1, '|');
            if (arr[1] && arr[1] === key) {
              delete this.template[key1];
            }
          }
        }
      }
    }
  }

  async editWidget() {
    this.cleanTemplate();
    this.buildDataPoints();
    this.data.configData.spanType = this.selectedDataFrequency;
    this.data.configData.graphDataPoints.stages = this.selectedStages;
    if (!this.data.configData.graphDataPoints.stages.length) {
      delete this.data.configData.graphDataPoints.stages;
    }
    this.data.configData.selection = this.template;

    delete this.template.editTimeSeries;
    delete this.data.configData.graphDataPoints.editTimeSeries;
    await this.dashboardApi.updateGadget(this.data.id, this.data).toPromise();
    this.fetchData();
  }

  cancelChanges() {
    this.data = _.cloneDeep(this.backupData);
    this.template.editTimeSeries = false;
  }

  preserveOrder = () => 0;

  deleted(event) {
    this.removed.emit(event);
  }
}
