import * as _ from 'lodash';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EVALUATION_TYPES_ABBREVIATION } from '../../../../utils';
import { AddQuestionComponent } from '../../../reviews/components/add-question/add-question.component';
import { AddRatingComponent } from '../../../reviews/components/add-rating/add-rating.component';

@Component({
  selector: 'app-scorecard-list',
  templateUrl: './scorecard-list.component.html',
  styleUrls: ['./scorecard-list.component.scss']
})
export class ScorecardListComponent implements OnInit, OnChanges {
  @Input() selectedCriteria = [];
  @Output() selected = new EventEmitter<any>();
  @Output() reload = new EventEmitter<any>();
  types = EVALUATION_TYPES_ABBREVIATION;
  selectionWeight = 0;
  selectedQuestions = [];
  constructor(private modalService: NgbModal) {}
  ngOnInit() {}
  ngOnChanges() {
    this.selectedQuestions = _.cloneDeep(this.selectedCriteria);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedQuestions,
      event.previousIndex,
      event.currentIndex
    );
    this.reOrder();
  }

  reOrder() {
    this.selectedQuestions = _.map(this.selectedQuestions, (value, key) => {
      value.order = key + 1;
      return value;
    });
    this.emitOutput();
  }

  getTooltip(data) {
    let tempVar = '';
    _.forEach(_.get(data, 'criteriaObject.data', []), (value) => {
      tempVar += `<div class="row">
          <div class="col-7">
            <p class="mb-0">
              ${value.label}
            </p>
          </div>
          <div class="col-5">
            <p class="mb-0">${value.value}</p>
          </div>
        </div>
        <hr class="my-1" />`;
    });
    return `<div class="enlargePopover">
        ${tempVar}
    </div>`;
  }

  getWeight(criteriaWeight) {
    this.selectionWeight = _.sumBy(this.selectedQuestions, 'criteriaWeight');
    return _.round((criteriaWeight / this.selectionWeight) * 100, 2);
  }

  edit(criteria, index) {
    if (
      criteria.evaluationType.abbreviation ===
      EVALUATION_TYPES_ABBREVIATION.QUESTION
    ) {
      this.editQuestion(criteria.id, index);
    } else if (
      criteria.evaluationType.abbreviation ===
      EVALUATION_TYPES_ABBREVIATION.NUMERICAL_RANGE
    ) {
      this.editRating(criteria.id, index);
    }
  }

  remove(criteria) {
    this.selectedQuestions = _.filter(this.selectedQuestions, (value) => {
      return value.id !== criteria.id;
    });
    this.reOrder();
    this.reload.emit(true);
  }

  emitOutput() {
    this.selected.emit(this.selectedQuestions);
  }

  private editQuestion(id, index) {
    const sumWeight = this.totalWightExcept(id);
    const modalRef = this.modalService.open(AddQuestionComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.selectionWeight = sumWeight;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.selectedQuestions[index] = result;
          this.reOrder();
        }
        modalRef.close('cancel');
      }
    });
  }

  private totalWightExcept(id) {
    const exceptCurrent = _.filter(this.selectedQuestions, (o) => {
      return o.id !== id;
    });
    return _.sumBy(exceptCurrent, 'criteriaWeight');
  }

  private editRating(id, index) {
    const sumWeight = this.totalWightExcept(id);
    const modalRef = this.modalService.open(AddRatingComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.selectionWeight = sumWeight;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.selectedQuestions[index] = result;
          this.reOrder();
        }
        modalRef.close('cancel');
      }
    });
  }
}
