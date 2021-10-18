import * as _ from 'lodash';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { SelectFieldDataInput } from '../../../../utils';

@Component({
  selector: 'app-configure-select-field',
  templateUrl: './configure-select-field.component.html',
  styleUrls: ['./configure-select-field.component.scss']
})
export class ConfigureSelectFieldComponent implements OnChanges {
  @Input() type = '';
  @Input() inputData: SelectFieldDataInput;
  @Output() output = new EventEmitter<any>();
  public model = {
    type: '',
    data: [{ value: '', label: '', order: 1 }]
  };
  constructor() {}

  ngOnChanges() {
    this.inputData.type = this.type;
    if (_.isEmpty(this.inputData.data)) {
      this.inputData.data = this.model.data;
      this.emitValue();
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.inputData.data,
      event.previousIndex,
      event.currentIndex
    );
    this.emitValue();
  }

  setUniqueId(i) {
    this.inputData.data[i].value = _.snakeCase(this.inputData.data[i].label);
    this.emitValue();
  }

  remove(i) {
    this.inputData.data = _.filter(this.inputData.data, (value, key) => {
      return key != i;
    });
    this.emitValue();
  }

  addOption() {
    this.inputData.data.push({
      value: '',
      label: '',
      order: this.inputData.data.length + 1
    });
    this.emitValue();
  }

  emitValue() {
    this.inputData.data = _.map(this.inputData.data, (value, key) => {
      value.order = key + 1;
      return value;
    });
    this.output.emit(this.inputData);
  }
}
