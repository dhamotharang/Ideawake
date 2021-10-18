import { get } from 'lodash';

import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { UtilService } from '../../../../services';
import { EVALUATION_TYPES_ABBREVIATION } from '../../../../utils';

@Component({
  selector: 'app-question-responses',
  templateUrl: './question-responses.component.html',
  styleUrls: ['./question-responses.component.scss']
})
export class QuestionResponsesComponent implements OnInit, OnChanges {
  @Input() private stageScore;
  @Input() stageAssignees;
  @Input() opportunityScore;

  public criteriaScores;
  public entityScore;
  public totalResponses;

  viewComments = false;
  evaluationTypes = EVALUATION_TYPES_ABBREVIATION;

  toggleComments() {
    this.viewComments = !this.viewComments;
  }

  constructor(public util: UtilService) {}

  ngOnChanges() {
    this.criteriaScores = get(this.stageScore, 'criteriaScores');
    this.entityScore = get(this.stageScore, 'entityScore');
    this.totalResponses = get(this.stageScore, 'totalResponses');
  }

  ngOnInit() {}
}
