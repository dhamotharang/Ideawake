import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { FIELD_DATA_TYPE } from '../../../../utils';

@Component({
  selector: 'app-field-datepicker',
  templateUrl: './field-datepicker.component.html',
  styleUrls: ['./field-datepicker.component.scss']
})
export class FieldDatepickerComponent implements OnChanges {
  @Input() customField;
  @Input() view = false;
  @Input() roles;

  @Output() data = new EventEmitter<NgbDate>();

  fieldDataType = FIELD_DATA_TYPE;
  date;
  preloaded = false;

  backupDate;
  dataAvailable = false;
  editMode = false;

  constructor(private calendar: NgbCalendar) {}

  ngOnChanges() {
    if (
      this.customField &&
      this.customField.opportunityFieldData &&
      this.customField.opportunityFieldData.length
    ) {
      this.date = this.customField.opportunityFieldData[0].fieldData.date;
      this.backupDate = this.date;
      this.dataAvailable = true;
      if (!this.view) {
        this.data.emit(this.date);
      }
      this.preloaded = true;
    } else {
      this.date = this.calendar.getToday();
    }
  }

  selectDate(date) {
    if (!this.view) {
      this.data.emit(date);
    }
  }

  setDateInput(open, d) {
    if (!open) {
      d.value = `${this.date.month}/${this.date.day}/${this.date.year}`;
    }
  }

  saveChanges() {
    if (this.date) {
      this.dataAvailable = true;
      this.backupDate = this.data;
    }
    this.editMode = false;
    this.data.emit(this.date);
  }
}
