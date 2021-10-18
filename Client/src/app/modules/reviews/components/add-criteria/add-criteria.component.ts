import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddQuestionComponent } from '../add-question/add-question.component';
import { AddRatingComponent } from '../add-rating/add-rating.component';
import { ReviewCriteriaApiService } from '../../../../services';
import {
  EVALUATION_TYPES,
  EVALUATION_TYPES_ABBREVIATION
} from '../../../../utils';
import { sumBy } from 'lodash';
@Component({
  selector: 'app-add-criteria',
  templateUrl: './add-criteria.component.html'
})
export class AddCriteriaComponent implements OnInit {
  @Input() selected = [];
  @Output() closePopup = new EventEmitter<boolean>();
  @Output() data = new EventEmitter();
  typeConstant = EVALUATION_TYPES;
  typesList = [];
  selectionWeight = 0;
  constructor(
    private reviewCriteriaApiService: ReviewCriteriaApiService,
    private modalService: NgbModal
  ) {}
  ngOnInit() {
    this.getTypes();
    this.selectionWeight = sumBy(this.selected, 'criteriaWeight') || 0;
  }

  getTypes() {
    this.reviewCriteriaApiService.getAllTypes().subscribe((res: any) => {
      this.typesList = res.response;
    });
  }

  close() {
    this.closePopup.emit(true);
  }

  addNew(type) {
    this.close();
    if (type.abbreviation === EVALUATION_TYPES_ABBREVIATION.QUESTION) {
      this.addNewQuestion(type.id);
    } else if (
      type.abbreviation === EVALUATION_TYPES_ABBREVIATION.NUMERICAL_RANGE
    ) {
      this.addRating(type.id);
    }
  }

  private addNewQuestion(typeId) {
    const modalRef = this.modalService.open(AddQuestionComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.typeId = typeId;
    modalRef.componentInstance.selectionWeight = this.selectionWeight;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
        this.data.emit(result);
        if (result.openNew) {
          this.addNewQuestion(typeId);
        }
      }
    });
  }

  private addRating(typeId) {
    const modalRef = this.modalService.open(AddRatingComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.typeId = typeId;
    modalRef.componentInstance.selectionWeight = this.selectionWeight;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
        this.data.emit(result);
        if (result.openNew) {
          this.addRating(typeId);
        }
      }
    });
  }
}
