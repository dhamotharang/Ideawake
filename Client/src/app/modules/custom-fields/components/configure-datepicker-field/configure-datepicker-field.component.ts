import * as moment from 'moment';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { DatepickerFieldInput } from '../../../../utils';

@Component({
  selector: 'app-configure-datepicker-field',
  templateUrl: './configure-datepicker-field.component.html',
  styleUrls: ['./configure-datepicker-field.component.scss']
})
export class ConfigureDatepickerFieldComponent implements OnChanges {
  public model = {
    type: 'datepicker',
    data: {}
  };
  public dateFormat = moment(new Date()).format('DD/MM/YYYY');
  @Input() outerForm = {};
  @Input() type = 'datepicker';
  @Input() inputData: DatepickerFieldInput = this.model;
  @Output() output = new EventEmitter<any>();
  constructor() {}
  ngOnChanges() {
    this.inputData.type = this.type;
    this.emitValue();
  }

  emitValue() {
    this.output.emit(this.inputData);
  }
}
