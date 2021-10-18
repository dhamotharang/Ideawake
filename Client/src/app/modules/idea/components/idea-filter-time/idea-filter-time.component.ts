import {
  Component,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import {
  NgbDateStruct,
  NgbDate,
  NgbDropdown
} from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from 'src/app/services';
@Component({
  selector: 'app-idea-filter-time',
  templateUrl: './idea-filter-time.component.html',
  styleUrls: ['./idea-filter-time.component.scss']
})
export class IdeaFilterTimeComponent implements OnChanges {
  @ViewChild('dpStart', { static: false }) dpStartElement;
  constructor(private util: UtilService) {}
  public navStart: NgbDateStruct = {
    year: 0,
    month: 0,
    day: 0
  };
  public navEnd: NgbDateStruct = {
    year: 0,
    month: 0,
    day: 0
  };
  public objectKeys = Object.keys;
  public filterValue = 'clearAll';
  public hoveredDate = null;
  public startTxt = null;
  public endTxt = null;
  public filters = {
    clearAll: 'All Time',
    custom: 'Custom',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastSevenDays: 'Last 7 Days',
    lastThirtyDays: 'Last 30 Days'
  };
  public startDate: NgbDateStruct = null;
  public endDate: NgbDateStruct = null;
  @Input() label = 'Time';
  @Input() fromDate: NgbDateStruct = null;
  @Input() toDate: NgbDateStruct = null;
  public dateRange = { startDate: this.startDate, endDate: this.endDate };
  @Output() selectedDate = new EventEmitter();
  ngOnChanges() {
    if (this.fromDate) {
      this.startDate = this.formatDate(this.fromDate);
    }
    if (this.toDate) {
      this.endDate = this.formatDate(this.toDate);
    }
    if (this.fromDate || this.toDate) {
      setTimeout(() => {
        this.filterValue = 'custom';
        this.navigateDate();
      }, 1000);
    }
  }
  navigateDate() {
    if (this.startDate) {
      this.navStart = _.cloneDeep(this.startDate);
      this.navStart.month++;
      this.dpStartElement.navigateTo(this.navStart);
    }
    if (this.endDate) {
      this.navEnd = _.cloneDeep(this.endDate);
      this.navEnd.month++;
      this.dpStartElement.navigateTo(this.navEnd);
    }
    this.startTxt = this.formatForText(this.startDate);
    this.endTxt = this.formatForText(this.endDate);
  }
  navigateToStart(date) {
    this.dpStartElement.navigateTo(date);
  }
  emitValue() {
    this.dateRange = { startDate: this.startDate, endDate: this.endDate };
    this.selectedDate.emit(this.dateRange);
  }
  formatDate(date) {
    return {
      year: moment(date).year(),
      month: moment(date).month(),
      day: moment(date).date()
    };
  }
  selectedStartDate(date) {
    this.navStart = _.cloneDeep(date);
    const input = _.cloneDeep(date);
    input.month = input.month - 1;
    this.startDate = input;
    this.filterValue = 'custom';
    this.startTxt = this.formatForText(this.startDate);
  }
  selectedEndDate(date) {
    this.navEnd = _.cloneDeep(date);
    const input = _.cloneDeep(date);
    input.month = input.month - 1;
    this.endDate = input;
    this.filterValue = 'custom';
    this.endTxt = this.formatForText(this.endDate);
  }
  formatForText(date) {
    if (date) {
      const input = _.cloneDeep(date);
      return moment(input).format('ll');
    }
  }
  rangeFilter(event) {
    const value = event.target.value;
    if (value == 'clearAll') {
      this.startDate = null;
      this.endDate = null;
    } else if (value == 'today') {
      this.startDate = this.formatDate(moment());
      this.endDate = this.formatDate(moment());
    } else if (value == 'yesterday') {
      this.startDate = this.formatDate(moment().subtract(1, 'day'));
      this.endDate = this.formatDate(moment().subtract(1, 'day'));
    } else if (value == 'thisWeek') {
      this.startDate = this.formatDate(moment().startOf('week'));
      this.endDate = this.formatDate(moment());
    } else if (value == 'lastWeek') {
      this.startDate = this.formatDate(
        moment().subtract(1, 'weeks').startOf('isoWeek')
      );
      this.endDate = this.formatDate(
        moment().subtract(1, 'weeks').endOf('isoWeek')
      );
    } else if (value == 'thisMonth') {
      this.startDate = this.formatDate(moment().startOf('month'));
      this.endDate = this.formatDate(moment());
    } else if (value == 'lastMonth') {
      this.startDate = this.formatDate(
        moment().subtract(1, 'month').startOf('month')
      );
      this.endDate = this.formatDate(
        moment().subtract(1, 'month').endOf('month')
      );
    } else if (value == 'thisYear') {
      this.startDate = this.formatDate(moment().startOf('year'));
      this.endDate = this.formatDate(moment());
    } else if (value == 'lastSevenDays') {
      this.startDate = this.formatDate(moment().subtract(7, 'd'));
      this.endDate = this.formatDate(moment().subtract(1, 'd'));
    } else if (value == 'lastThirtyDays') {
      this.startDate = this.formatDate(moment().subtract(30, 'd'));
      this.endDate = this.formatDate(moment().subtract(1, 'd'));
    }
    this.navigateDate();
  }
  startDateInput() {
    this.startDate = this.formatDate(moment(this.startTxt));
    this.filterValue = 'custom';
    this.navigateDate();
  }
  endDateInput() {
    this.endDate = this.formatDate(moment(this.endTxt));
    this.filterValue = 'custom';
    this.navigateDate();
  }
  cancel() {
    this.filterValue = 'clearAll';
    this.startDate = null;
    this.endDate = null;
    this.startTxt = null;
    this.endTxt = null;
    this.emitValue();
  }
  applyDate() {
    this.emitValue();
  }

  onDateSelection(date: NgbDate) {
    if (!this.navStart && !this.navEnd) {
      this.selectedStartDate(date);
    } else if (this.navStart && !this.navEnd && date.after(this.navStart)) {
      this.selectedEndDate(date);
    } else {
      this.navEnd = null;
      this.selectedStartDate(date);
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.navStart &&
      !this.navEnd &&
      this.hoveredDate &&
      date.after(this.navStart) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.navEnd && date.after(this.navStart) && date.before(this.navEnd);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.navStart) ||
      (this.navEnd && date.equals(this.navEnd)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
  onOpenCloseDropdown(flag: boolean, dropdown: NgbDropdown) {
    this.util.setIdeaFilterDateDropdownEmitter(flag);
  }
}
