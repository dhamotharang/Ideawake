import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

import { get } from 'lodash';
import { Utility } from 'src/app/utils';

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent implements OnChanges {
  @Input() criteria;
  @Output() data = new EventEmitter();

  selectedValue;

  minValue;
  maxValue;
  unit;

  constructor() {}

  ngOnChanges() {
    const criteriaObj = 'evaluationCriteria.criteriaObject';
    this.maxValue = get(this.criteria, `${criteriaObj}.maxValue`);
    this.minValue = get(this.criteria, `${criteriaObj}.minValue`);
    this.unit = get(this.criteria, `${criteriaObj}.unit`);
    this.selectedValue = get(
      this.criteria,
      'evaluationCriteria.oppEvaluationResponse[0].criteriaRespData.selected',
      this.minValue
    );

    let num = 0;
    this.selectedValue = this.selectedValue
      ? this.selectedValue.toString()
      : num.toString();
    this.selectedValue = Utility.replaceWithComma(this.selectedValue);

    this.emitData();
  }

  emitData() {
    if (this.selectedValue > this.maxValue) {
      this.selectedValue = this.maxValue;
    }
    const d: any = {
      id: get(
        this.criteria,
        'evaluationCriteria.oppEvaluationResponse[0].id',
        null
      ),
      evaluationCriteria: get(this.criteria, 'evaluationCriteria.id'),
      criteriaRespData: {
        selected: parseInt(this.selectedValue.replace(/,/g, ''))
      }
    };

    this.data.emit(d);
  }

  emitRange(event) {
    this.selectedValue = Utility.replaceWithComma(
      parseInt(event.target.value).toString()
    );
  }

  addComas(event) {
    // skip for arrow keys
    if (event.which >= 37 && event.which <= 40) return;
    this.selectedValue = Utility.replaceWithComma(this.selectedValue);
  }

  removeComma(value) {
    return value.replace(/,/g, '');
  }
}
