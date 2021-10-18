import * as _ from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { NumberFieldInput } from '../../../../utils';

@Component({
  selector: 'app-configure-number-field',
  templateUrl: './configure-number-field.component.html',
  styleUrls: ['./configure-number-field.component.scss']
})
export class ConfigureNumberFieldComponent implements OnChanges {
  public model: NumberFieldInput = {
    type: 'number',
    data: { format: 'formatted_number', prefix: '', suffix: '' }
  };

  @Input() outerForm;
  @Input() type = 'number';
  @Input() inputData: NumberFieldInput = this.model;
  @Output() output = new EventEmitter<any>();
  public numberFieldFormatEnum = [
    {
      title: 'Formatted Number',
      value: 'formatted_number',
      format: '2,550.25'
    },
    {
      title: 'Unformatted Number',
      value: 'unformatted_number',
      format: '2550.25'
    }
  ];

  constructor() {}

  ngOnChanges() {
    if (_.isEmpty(this.inputData.data.format)) {
      this.inputData.data.format = 'formatted_number';
    }
    this.inputData.type = this.type;
  }

  preview() {
    return _.get(
      _.find(this.numberFieldFormatEnum, ['value', this.inputData.data.format]),
      'format',
      '0000'
    );
  }

  emitValue() {
    this.output.emit(this.inputData);
  }
}
