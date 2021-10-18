import { get } from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnChanges {
  @Input() criteria;
  @Output() data = new EventEmitter();
  selectedValue;
  allQuestions;

  constructor() {}

  ngOnChanges() {
    this.selectedValue = get(
      this.criteria,
      'evaluationCriteria.oppEvaluationResponse[0].criteriaRespData.selected'
    );
    this.allQuestions = get(
      this.criteria,
      'evaluationCriteria.criteriaObject.data'
    );
    this.emitData(this.selectedValue);
  }

  emitData(value) {
    this.selectedValue = value;
    const d: any = {
      id: get(this.criteria, 'evaluationCriteria.oppEvaluationResponse[0].id'),
      evaluationCriteria: get(this.criteria, 'evaluationCriteria.id'),
      criteriaRespData: {
        selected: this.selectedValue
      }
    };

    this.data.emit(d);
  }
}
