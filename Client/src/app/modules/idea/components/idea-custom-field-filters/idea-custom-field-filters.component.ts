import * as _ from 'lodash';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CUSTOM_FIELD_TYPES } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import { CUSTOM_FIELD_FILTER_OUTPUT } from '../../../../actions';
interface DataInterface {
  id: number;
  title: string;
  uniqueId: string;
  type: string;
  from?: object;
  to?: object;
  numValueSort?: string;
  searchText?: string;
  noEntry?: boolean;
  options?: Array<any>;
}
@Component({
  selector: 'app-idea-custom-field-filters',
  templateUrl: './idea-custom-field-filters.component.html',
  styleUrls: ['./idea-custom-field-filters.component.scss']
})
export class IdeaCustomFieldFiltersComponent implements OnInit, OnChanges {
  @Input() customField: any;
  @Input() appFilters: any;
  @Input() index: any = 0;
  @Input() counts: any;
  outputObject: any;
  public toggle = false;
  public fieldTypes = CUSTOM_FIELD_TYPES;
  public dataSet: DataInterface;
  constructor(private ngRedux: NgRedux<AppState>) {}

  ngOnInit() {
    this.fieldDetail();
    this.preAppliedFilters(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'appFilters':
            if (this.appFilters) {
              this.preAppliedFilters(true);
            }
            break;
          default:
            break;
        }
      }
    }
  }

  preAppliedFilters(changed) {
    const type = _.get(this.customField, 'fieldDataObject.type');
    const index = _.findIndex(this.appFilters, {
      customField: this.customField.id
    });
    if (index === -1) {
      this.fieldDetail();
      if (changed) {
        this.outputObject = null;
        this.ngRedux.dispatch({
          type: CUSTOM_FIELD_FILTER_OUTPUT,
          index: this.dataSet.id,
          emit: false
        });
      }
    } else {
      if (
        type === this.fieldTypes.MULTI_SELECT ||
        type === this.fieldTypes.SINGLE_SELECT
      ) {
        _.set(
          this.dataSet,
          'options',
          _.map(this.customField.fieldDataObject.data, (value) => {
            if (_.includes(this.appFilters[index].selectValue, value.value)) {
              value.selected = true;
            } else {
              value.selected = false;
            }
            return value;
          })
        );
      } else if (type === this.fieldTypes.DATEPICKER) {
        _.set(
          this.dataSet,
          'from',
          this.breakDate(_.get(this.appFilters[index], 'dateFrom', null))
        );
        _.set(
          this.dataSet,
          'to',
          this.breakDate(_.get(this.appFilters[index], 'dateTo', null))
        );
      } else if (type === this.fieldTypes.NUMBER) {
        _.set(
          this.dataSet,
          'numValueSort',
          _.get(this.appFilters[index], 'numValueSort')
        );
      } else {
        _.set(
          this.dataSet,
          'searchText',
          _.get(this.appFilters[index], 'searchText')
        );
        _.set(
          this.dataSet,
          'noEntry',
          _.get(this.appFilters[index], 'noEntry')
        );
      }
      /* if (!_.isEqual(this.outputObject, this.appFilters[index])) {
        this.changeInValue();
      } */
    }
  }

  breakDate(str) {
    if (_.isEmpty(str)) {
      return null;
    }
    const date = _.split(str, '-');
    return {
      year: parseInt(date[0], 10),
      month: parseInt(date[1], 10) - 1,
      day: parseInt(date[2], 10)
    };
  }

  fieldDetail() {
    const type = _.get(this.customField, 'fieldDataObject.type');
    this.dataSet = {
      id: _.get(this.customField, 'id'),
      title: _.get(this.customField, 'title'),
      uniqueId: _.get(this.customField, 'uniqueId'),
      type
    };
    if (
      type === this.fieldTypes.MULTI_SELECT ||
      type === this.fieldTypes.SINGLE_SELECT
    ) {
      this.dataSet.options = _.map(
        this.customField.fieldDataObject.data,
        (value) => {
          value.selected = false;
          return value;
        }
      );
    } else if (type === this.fieldTypes.DATEPICKER) {
      this.dataSet.from = null;
      this.dataSet.to = null;
    } else if (type === this.fieldTypes.NUMBER) {
      this.dataSet.numValueSort = null;
    } else {
      this.dataSet.searchText = null;
      this.dataSet.noEntry = undefined;
    }
  }

  changeInValue() {
    const type = _.get(this.customField, 'fieldDataObject.type');
    const dataCopy = _.cloneDeep(this.dataSet);
    const temp = {
      customField: dataCopy.id,
      title: dataCopy.title
    };
    if (
      type === this.fieldTypes.MULTI_SELECT ||
      type === this.fieldTypes.SINGLE_SELECT
    ) {
      const values = _.map(
        _.filter(dataCopy.options, ['selected', true]),
        'value'
      );
      _.set(temp, 'selectValue', values);
    } else if (type === this.fieldTypes.DATEPICKER) {
      _.set(temp, 'dateFrom', this.formatDate(dataCopy.from));
      _.set(temp, 'dateTo', this.formatDate(dataCopy.to));
    } else if (type === this.fieldTypes.NUMBER) {
      _.set(temp, 'numValueSort', dataCopy.numValueSort);
    } else {
      _.set(temp, 'noEntry', dataCopy.noEntry);
      _.set(temp, 'searchText', dataCopy.searchText);
    }
    this.outputObject = temp;
    this.emitValue(temp);
  }

  emitValue(temp) {
    if (
      _.get(temp, 'selectValue.length') ||
      (_.get(temp, 'dateFrom') && _.get(temp, 'dateTo')) ||
      _.get(temp, 'numValueSort') ||
      _.get(temp, 'noEntry') === false ||
      _.get(temp, 'noEntry') === true ||
      _.get(temp, 'searchText')
    ) {
      this.ngRedux.dispatch({
        type: CUSTOM_FIELD_FILTER_OUTPUT,
        data: temp,
        emit: true
      });
    } else {
      this.ngRedux.dispatch({
        type: CUSTOM_FIELD_FILTER_OUTPUT,
        index: this.dataSet.id,
        emit: true
      });
    }
  }

  formatDate(date) {
    if (date && date.year) {
      return `${date.year}-${date.month + 1}-${date.day}`;
    } else {
      return ``;
    }
  }

  dateFilter(event) {
    this.dataSet.from = event.startDate;
    this.dataSet.to = event.endDate;
    this.changeInValue();
  }

  searchText(event) {
    this.dataSet.searchText = event;
    this.changeInValue();
  }

  changeSort(event) {
    this.dataSet.numValueSort = event;
    this.changeInValue();
  }

  noEntry(event) {
    this.dataSet.noEntry = event;
    this.changeInValue();
  }

  getOptionCount(opt) {
    const optionCount = _.find(_.get(this.counts, 'responses', []), {
      option: opt.value
    });
    if (optionCount) {
      return optionCount.count;
    } else {
      return 0;
    }
  }
}
