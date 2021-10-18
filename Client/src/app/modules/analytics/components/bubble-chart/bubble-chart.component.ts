import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppState } from '../../../../store';
import { IdeaSummaryComponent } from '../../../idea/components';
import {
  AnalyticsApiService,
  EntityApiService,
  DashboardService,
  ReviewCriteriaApiService,
  CustomFieldApiService,
  NotificationService
} from '../../../../services';
import { ANALYTICS } from '../../../../utils';
@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit {
  @Input() data;
  @Output() removed = new EventEmitter<boolean>();
  public chartOptions;
  public chartType: ChartType;
  public chartData = [];
  public plugins = [ChartDataLabels];
  editBubbleChart = false;
  searchText = null;
  entity;
  appliedFilters;
  customFields = [];
  questionsList = [];
  numberCustomField = [];
  numberAndSingleSelect = [];
  bubbleSearch = '';
  colorSearch = '';
  xSearch = '';
  ySearch = '';
  colorsTypes = [
    { key: 'opportunity_type', title: 'Post Type' },
    { key: 'status', title: 'Status' },
    { key: 'stage', title: 'Workflow Stage' }
  ];
  bubbleSize = [
    { key: 'current_stage_score', title: 'Current Stage Score' },
    { key: 'total_score', title: 'Total Score' },
    { key: 'votes', title: 'Votes' },
    { key: 'comments', title: 'Comments' },
    { key: 'views', title: 'Views' }
  ];
  axisConstant = [
    { key: 'current_stage_score', title: 'Current Stage Score' },
    { key: 'total_score', title: 'Total Score' }
  ];
  constructor(
    private reviewCriteriaApiService: ReviewCriteriaApiService,
    private notificationService: NotificationService,
    private customFieldApi: CustomFieldApiService,
    private analytics: AnalyticsApiService,
    private dashboardApi: DashboardService,
    private entityApi: EntityApiService,
    private ngRedux: NgRedux<AppState>,
    private modalService: NgbModal
  ) {
    this.chartType = ANALYTICS.ChartType.Bubble;
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          anchor: (context) => {
            const dataValue = context.dataset.data[context.dataIndex];
            return dataValue.r < 20 ? 'end' : 'center';
          },
          align: (context) => {
            const dataValue = context.dataset.data[context.dataIndex];
            return dataValue.r < 20 ? 'end' : 'center';
          },
          color: (context) => {
            const dataValue = context.dataset.data[context.dataIndex];
            return dataValue.r < 20 ? context.dataset.backgroundColor : 'white';
          },
          formatter: (value) => {
            return _.get(value, 'opportunity.id');
          },
          font: {
            weight: 'bold'
          },
          offset: 2,
          padding: 0
        }
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) => {
            const dataSet = data.datasets[tooltipItem[0].datasetIndex];
            const opportunity = dataSet.data[tooltipItem[0].index].opportunity;
            let title = opportunity.title.substring(0, 29);
            if (opportunity.title.length > 29) {
              title = title + `...`;
            }
            return `${title} (${opportunity.id})`;
          },
          label: (tooltipItem, data) => {
            const dataSet = data.datasets[tooltipItem.datasetIndex];
            // const opportunity = dataSet.data[tooltipItem.index].opportunity;
            return `${this.selectedOption('bubbleColor')} - ${dataSet.label}`;
          },
          afterLabel: (tooltipItem, data) => {
            const dataSet = data.datasets[tooltipItem.datasetIndex];
            return `Bubble Size - ${
              dataSet.data[tooltipItem.index].rawRadiusData
            } (${this.selectedOption('radiusDataPoint')}) \n X-Axis - ${
              dataSet.data[tooltipItem.index].x
            } (${this.selectedOption('xAxisDataPoint')}) \n Y-Axis - ${
              dataSet.data[tooltipItem.index].y
            } (${this.selectedOption('yAxisDataPoint')})`;
          }
        },
        backgroundColor: '#FFF',
        titleFontSize: 16,
        titleFontColor: '#0066ff',
        bodyFontColor: '#000',
        bodyFontSize: 14,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
        displayColors: false
      },
      scales: {
        xAxes: [
          {
            ticks: {
              callback: (label, index, labels) => {
                return this.numFormatter(label);
              },
              min: 1,
              max: 100
            },
            scaleLabel: {
              display: true,
              labelString: 'X-Axis'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              callback: (label, index, labels) => {
                return this.numFormatter(label);
              },
              min: 1,
              max: 100
            },
            scaleLabel: {
              display: true,
              labelString: 'Y-Axis'
            }
          }
        ]
      }
    };
  }

  ngOnInit() {
    this.fetchData();
    this.getQuestions();
    this.getCustomFields();
    this.appliedFilters = { ...this.data.configData.actualFilters };
    this.entity = _.find(this.entityApi.getAllEntities(), [
      'id',
      this.data.entityTypeId
    ]);
  }

  chartClicked(e) {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const value =
          chart.data.datasets[activePoints[0]._datasetIndex].data[
            clickedElementIndex
          ];
        if (_.get(value, 'opportunity.id')) {
          this.openSummaryModal(_.get(value, 'opportunity.id'));
        }
      }
    }
  }

  openSummaryModal(ideaId) {
    const modalRef = this.modalService.open(IdeaSummaryComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.switchStageTab = false;
    modalRef.componentInstance.ideaId = ideaId;
  }

  getQuestions() {
    this.reviewCriteriaApiService
      .getAll({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.questionsList = res.response;
      });
  }

  async getCustomFields() {
    this.customFields = _.get(
      await this.customFieldApi
        .getAllCustomFields({
          isDeleted: false,
          community: this.ngRedux.getState().userState.currentCommunityId
        })
        .toPromise(),
      'response'
    );
    this.numberCustomField = _.filter(this.customFields, (o) => {
      return o.fieldDataObject.type === 'number';
    });
    // TODO: Add in 'single_select' 'datepicker' after implementation.
    this.numberAndSingleSelect = _.filter(this.customFields, (o) => {
      return _.includes(['number'], o.fieldDataObject.type);
    });
  }

  filterLoop(searchText, array) {
    return _.filter(array, (obj) => {
      const title = _.toLower(obj.title);
      const text = _.toLower(searchText);
      return title.indexOf(text) !== -1;
    });
  }

  selectedOption(key) {
    const defaultValue = 'Click here to select.';
    const value = _.get(this.data.configData, key);
    if (!value) {
      return defaultValue;
    }
    if (key === 'bubbleColor') {
      const color = _.find(this.colorsTypes, ['key', value.type]);
      if (color) {
        return color.title;
      } else {
        return defaultValue;
      }
    } else if (key === 'radiusDataPoint') {
      let size = null;
      if (value.type === 'evaluation_criteria') {
        size = _.find(this.questionsList, ['id', value.id]);
      } else if (value.type === 'custom_field') {
        size = _.find(this.customFields, ['id', value.id]);
      } else {
        size = _.find(this.bubbleSize, ['key', value.type]);
      }
      if (size) {
        return size.title;
      } else {
        return defaultValue;
      }
    } else if (key === 'xAxisDataPoint') {
      let size = null;
      if (value.type === 'evaluation_criteria') {
        size = _.find(this.questionsList, ['id', value.id]);
      } else if (value.type === 'custom_field') {
        size = _.find(this.customFields, ['id', value.id]);
      } else {
        size = _.find(this.axisConstant, ['key', value.type]);
      }
      if (size) {
        return size.title;
      } else {
        return defaultValue;
      }
    } else if (key === 'yAxisDataPoint') {
      let size = null;
      if (value.type === 'evaluation_criteria') {
        size = _.find(this.questionsList, ['id', value.id]);
      } else if (value.type === 'custom_field') {
        size = _.find(this.customFields, ['id', value.id]);
      } else {
        size = _.find(this.axisConstant, ['key', value.type]);
      }
      if (size) {
        return size.title;
      } else {
        return defaultValue;
      }
    }
  }

  selectOption(key, value) {
    _.set(this.data.configData, key + '.type', value);
    _.set(this.data.configData, key + '.id', null);
  }

  selectQuestionSize(id) {
    _.set(this.data.configData, 'radiusDataPoint.type', 'evaluation_criteria');
    _.set(this.data.configData, 'radiusDataPoint.id', id);
  }

  selectFieldSize(id) {
    _.set(this.data.configData, 'radiusDataPoint.type', 'custom_field');
    _.set(this.data.configData, 'radiusDataPoint.id', id);
  }

  selectFieldX(id) {
    _.set(this.data.configData, 'xAxisDataPoint.type', 'custom_field');
    _.set(this.data.configData, 'xAxisDataPoint.id', id);
  }

  selectFieldY(id) {
    _.set(this.data.configData, 'yAxisDataPoint.type', 'custom_field');
    _.set(this.data.configData, 'yAxisDataPoint.id', id);
  }

  selectAxisX(id) {
    _.set(this.data.configData, 'xAxisDataPoint.type', 'evaluation_criteria');
    _.set(this.data.configData, 'xAxisDataPoint.id', id);
  }

  selectAxisY(id) {
    _.set(this.data.configData, 'yAxisDataPoint.type', 'evaluation_criteria');
    _.set(this.data.configData, 'yAxisDataPoint.id', id);
  }

  private async fetchData() {
    const params = _.cloneDeep(this.data.configData);
    params.opportunityFilter = {
      ...this.data.configData.opportunityFilter,
      isDeleted: false
    };
    delete params.actualFilters;
    const data = _.get(
      await this.analytics.getBubbleChartData(params).toPromise(),
      'response'
    );
    this.chartData = _.get(data, 'data', []);
    this.findMinMax();
    this.setAxisLabels();
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
    if (this.isInValid()) {
      this.notificationService.showError(
        'Please select all options before submit.'
      );
      return false;
    }
    await this.dashboardApi.updateGadget(this.data.id, this.data).toPromise();
    this.notificationService.showSuccess(
      'Bubble Chart widget updated successfully.'
    );
    await this.fetchData();
    this.editBubbleChart = false;
  }

  isInValid() {
    let invalid = false;
    if (_.isEmpty(_.get(this.data, 'title'))) {
      invalid = true;
    }
    if (_.isEmpty(_.get(this.data, 'configData.bubbleColor.type'))) {
      invalid = true;
    }
    if (_.isEmpty(_.get(this.data, 'configData.bubbleColor.type'))) {
      invalid = true;
    }
    if (_.isEmpty(_.get(this.data, 'configData.radiusDataPoint.type'))) {
      invalid = true;
    }
    if (_.isEmpty(_.get(this.data, 'configData.xAxisDataPoint.type'))) {
      invalid = true;
    }
    if (_.isEmpty(_.get(this.data, 'configData.yAxisDataPoint.type'))) {
      invalid = true;
    }
    return invalid;
  }

  findMinMax() {
    const tempArray = [];
    _.map(this.chartData, (obj) => {
      _.map(obj.data, (array) => {
        tempArray.push(array);
      });
    });

    const XMin = _.chain(tempArray).minBy('x').get('x', 0).value();
    const XMax = _.chain(tempArray).maxBy('x').get('x', 0).value();
    const YMin = _.chain(tempArray).minBy('y').get('y', 0).value();
    const YMax = _.chain(tempArray).maxBy('y').get('y', 0).value();

    const xAxes = _.get(this.data.configData, 'xAxisDataPoint');
    if (xAxes.type === 'total_score' || xAxes.type === 'current_stage_score') {
      this.chartOptions.scales.xAxes[0].ticks.min = 0;
      this.chartOptions.scales.xAxes[0].ticks.max = 100;
    } else if (xAxes.type === 'custom_field') {
      this.chartOptions.scales.xAxes[0].ticks.min = XMin;
      this.chartOptions.scales.xAxes[0].ticks.max = XMax;
    } else if (xAxes.type === 'evaluation_criteria') {
      const question = _.find(this.questionsList, ['id', xAxes.id]);
      if (question.evaluationType.abbreviation === 'numerical_range') {
        this.chartOptions.scales.xAxes[0].ticks.min =
          question.criteriaObject.minValue;
        this.chartOptions.scales.xAxes[0].ticks.max =
          question.criteriaObject.maxValue;
      } else {
        this.chartOptions.scales.xAxes[0].ticks.min = 0;
        this.chartOptions.scales.xAxes[0].ticks.max = 10;
      }
    }
    const yAxes = _.get(this.data.configData, 'yAxisDataPoint');
    if (yAxes.type === 'total_score' || yAxes.type === 'current_stage_score') {
      this.chartOptions.scales.yAxes[0].ticks.min = 0;
      this.chartOptions.scales.yAxes[0].ticks.max = 100;
    } else if (yAxes.type === 'custom_field') {
      this.chartOptions.scales.yAxes[0].ticks.min = YMin;
      this.chartOptions.scales.yAxes[0].ticks.max = YMax;
    } else if (yAxes.type === 'evaluation_criteria') {
      const question = _.find(this.questionsList, ['id', yAxes.id]);
      if (question.evaluationType.abbreviation === 'numerical_range') {
        this.chartOptions.scales.yAxes[0].ticks.min =
          question.criteriaObject.minValue;
        this.chartOptions.scales.yAxes[0].ticks.max =
          question.criteriaObject.maxValue;
      } else {
        this.chartOptions.scales.yAxes[0].ticks.min = 0;
        this.chartOptions.scales.yAxes[0].ticks.max = 10;
      }
    }
    // Calculation stepSize
    this.chartOptions.scales.xAxes[0].ticks.stepSize =
      (this.chartOptions.scales.xAxes[0].ticks.max -
        this.chartOptions.scales.xAxes[0].ticks.min) /
      8;
    this.chartOptions.scales.yAxes[0].ticks.stepSize =
      (this.chartOptions.scales.yAxes[0].ticks.max -
        this.chartOptions.scales.yAxes[0].ticks.min) /
      8;
  }

  setAxisLabels() {
    this.chartOptions.scales.xAxes[0].scaleLabel.labelString = this.selectedOption(
      'xAxisDataPoint'
    );
    this.chartOptions.scales.yAxes[0].scaleLabel.labelString = this.selectedOption(
      'yAxisDataPoint'
    );
  }

  numFormatter(num) {
    if (num > 999 && num < 1000000) {
      return _.round(num / 1000, 2) + 'K'; // convert to K for number from > 1000 < 1 million
    } else if (num > 1000000) {
      return _.round(num / 1000000, 2) + 'M'; // convert to M for number from > 1 million
    } else if (num < 999) {
      return _.round(num, 2); // if value < 1000, nothing to do
    }
  }

  deleted(event) {
    this.removed.emit(event);
  }
}
