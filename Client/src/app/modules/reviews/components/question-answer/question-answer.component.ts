import { findIndex } from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';

import { EVALUATION_TYPES_ABBREVIATION } from '../../../../utils';

@Component({
  selector: 'app-question-answer',
  templateUrl: './question-answer.component.html',
  styleUrls: ['./question-answer.component.scss']
})
export class QuestionAnswerComponent {
  @Input() criteriaQuestions;
  @Output() data = new EventEmitter();

  evaluationTypes = EVALUATION_TYPES_ABBREVIATION;
  criteriaQuestionResponses = [];

  constructor() {}

  userResponse(answersObject) {
    const index = findIndex(this.criteriaQuestionResponses, [
      'evaluationCriteria',
      answersObject.evaluationCriteria
    ]);

    if (index !== -1) {
      this.criteriaQuestionResponses[index] = answersObject;
    } else {
      this.criteriaQuestionResponses.push(answersObject);
    }

    this.data.emit(this.criteriaQuestionResponses);
  }
}
