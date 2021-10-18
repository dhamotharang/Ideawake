import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  NotificationService,
  ReviewCriteriaApiService
} from '../../../../services';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss']
})
export class AddQuestionComponent implements OnInit {
  @Input() id;
  @Input() selectionWeight;
  @Input() typeId;
  @Output() outputResult = new EventEmitter();
  public currentUser = this.ngRedux.getState().userState;
  questionDescription = false;
  weightPercentage = 0;
  addNewAgain = 'addNewAgain';
  form: FormGroup;
  defaultOptions = [
    { key: 'strongly_agree', value: 5, label: 'Strongly Agree', order: 1 },
    { key: 'agree', value: 4, label: 'Agree', order: 2 },
    { key: 'neutral', value: 3, label: 'Neutral', order: 3 },
    { key: 'disagree', value: 2, label: 'Disagree', order: 4 },
    { key: 'strongly_disagree', value: 1, label: 'Strongly Disagree', order: 5 }
  ];
  options = this.defaultOptions;
  toggleDescription() {
    this.questionDescription = !this.questionDescription;
    this.form.controls.description.setValue(null);
  }
  constructor(
    private ngRedux: NgRedux<AppState>,
    private fb: FormBuilder,
    private notification: NotificationService,
    private reviewCriteriaApiService: ReviewCriteriaApiService
  ) {}

  ngOnInit() {
    this.initializeForm({});
    if (this.id) {
      this.getDetails();
    }
  }

  getDetails() {
    this.reviewCriteriaApiService.getById(this.id).subscribe((res: any) => {
      this.questionDescription = true;
      this.initializeForm(res.response[0]);
      this.options = _.get(
        res.response[0],
        'criteriaObject.data',
        this.defaultOptions
      );
      this.getWeight();
    });
  }

  initializeForm(dataSet) {
    this.form = this.fb.group({
      title: [_.get(dataSet, 'title', null), Validators.required],
      description: [_.get(dataSet, 'description', null)],
      evaluationType: [
        _.get(dataSet, 'evaluationTypeId', this.typeId),
        Validators.required
      ],
      criteriaWeight: [
        _.get(dataSet, 'criteriaWeight', 1),
        Validators.required
      ],
      criteriaObject: [
        _.get(dataSet, 'criteriaObject.data', this.defaultOptions),
        Validators.required
      ],
      community: [this.currentUser.currentCommunityId, Validators.required]
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
    this.reOrder();
  }

  setUniqueId(i) {
    this.options[i].key = _.snakeCase(this.options[i].label);
  }

  remove(i) {
    if (this.options.length <= 1) {
      this.notification.showError("Last choice can't be remove.");
      return false;
    }
    this.options = _.filter(this.options, (value, key) => {
      return key !== i;
    });
    this.reOrder();
  }

  addNew() {
    const tempObject = {
      key: '',
      value: 0,
      label: '',
      order: this.options.length + 1
    };
    this.options.push(tempObject);
    this.reOrder();
  }

  reOrder() {
    this.options = _.map(this.options, (value, key) => {
      value.order = key + 1;
      return value;
    });
  }

  submit(action) {
    this.form.controls.criteriaObject.setValue({ data: this.options });
    const model = this.form.value;
    if (this.id) {
      this.reviewCriteriaApiService
        .updateById(this.id, model)
        .subscribe((res1: any) => {
          this.notification.showSuccess('Question updated successfully.', {
            positionClass: 'toast-bottom-left'
          });
          this.reviewCriteriaApiService
            .getById(this.id)
            .subscribe((res: any) => {
              this.outputResult.emit(res.response[0]);
            });
        });
    } else {
      this.reviewCriteriaApiService.createNew(model).subscribe((res: any) => {
        this.notification.showSuccess('Question adedd successfully.', {
          positionClass: 'toast-bottom-left'
        });
        if (action === this.addNewAgain) {
          this.outputResult.emit({
            openNew: true,
            update: true,
            value: res.response
          });
        } else {
          this.outputResult.emit({ update: true, value: res.response });
        }
      });
    }
  }
  getWeight() {
    const criteriaWeight = this.form.get('criteriaWeight').value;
    const total =
      this.selectionWeight + criteriaWeight > 0
        ? this.selectionWeight + criteriaWeight
        : 1;
    this.weightPercentage = _.round((criteriaWeight / total) * 100, 2);
  }
  close() {
    this.outputResult.emit({ close: true });
  }
}
