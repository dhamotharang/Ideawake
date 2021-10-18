import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  NotificationService,
  ReviewCriteriaApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { Utility } from 'src/app/utils/utility';

@Component({
  selector: 'app-add-rating',
  templateUrl: './add-rating.component.html',
  styleUrls: ['./add-rating.component.scss']
})
export class AddRatingComponent implements OnInit {
  @Input() id;
  @Input() typeId;
  @Input() selectionWeight;
  @Output() outputResult = new EventEmitter();
  public currentUser = this.ngRedux.getState().userState;
  questionDescription = false;
  weightPercentage = 0;
  addNewAgain = 'addNewAgain';
  form: FormGroup;
  defaultOptions = {
    unit: '',
    minValue: 0,
    maxValue: 0,
    higherBest: true,
    lowerBest: false
  };
  criteriaObject = this.defaultOptions;

  toggleDescription() {
    this.questionDescription = !this.questionDescription;
  }
  constructor(
    private ngRedux: NgRedux<AppState>,
    private reviewCriteriaApiService: ReviewCriteriaApiService,
    private notification: NotificationService,
    private fb: FormBuilder
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
      this.criteriaObject = _.get(
        res.response[0],
        'criteriaObject',
        this.defaultOptions
      );
      this.criteriaObject.minValue = Utility.replaceWithComma(
        this.criteriaObject.minValue.toString()
      );

      this.criteriaObject.maxValue = Utility.replaceWithComma(
        this.criteriaObject.maxValue.toString()
      );
      this.getWeight();
    });
  }

  higherBest() {
    this.criteriaObject.higherBest = true;
    this.criteriaObject.lowerBest = false;
  }

  lowerBest() {
    this.criteriaObject.lowerBest = true;
    this.criteriaObject.higherBest = false;
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
        _.get(dataSet, 'criteriaObject', this.defaultOptions),
        Validators.required
      ],
      community: [this.currentUser.currentCommunityId, Validators.required]
    });
  }

  submit(action) {
    this.criteriaObject.minValue = parseInt(
      this.criteriaObject.minValue.toString().replace(/,/g, '')
    );
    this.criteriaObject.maxValue = parseInt(
      this.criteriaObject.maxValue.toString().replace(/,/g, '')
    );
    this.form.controls.criteriaObject.setValue(this.criteriaObject);
    const model = this.form.value;
    if (this.id) {
      this.reviewCriteriaApiService
        .updateById(this.id, model)
        .subscribe((res1: any) => {
          this.notification.showSuccess(
            'Rating criteria updated successfully.',
            {
              positionClass: 'toast-bottom-left'
            }
          );
          this.reviewCriteriaApiService
            .getById(this.id)
            .subscribe((res: any) => {
              this.outputResult.emit(res.response[0]);
            });
        });
    } else {
      this.reviewCriteriaApiService.createNew(model).subscribe((res: any) => {
        this.notification.showSuccess('Rating criteria adedd successfully.', {
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

  addComas(event, choice) {
    // skip for arrow keys
    if (event.which >= 37 && event.which <= 40) return;

    if (choice == 'min') {
      this.criteriaObject.minValue = Utility.replaceWithComma(
        this.criteriaObject.minValue
      );
    } else if (choice == 'max') {
      this.criteriaObject.maxValue = Utility.replaceWithComma(
        this.criteriaObject.maxValue
      );
    }
  }
}
