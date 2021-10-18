import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PrizeApiService } from '../../../../services';
import {
  ENTITY_FOLDER,
  PRIZE_CATEGORY,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';

@Component({
  selector: 'app-prize-add-edit',
  templateUrl: './prize-add-edit.component.html',
  styleUrls: ['./prize-add-edit.component.scss']
})
export class PrizeAddEditComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() prizeValue: any = {};
  @Input() challengeId;
  @Output() dataSet = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();
  form;
  imagPosted = false;
  prizeCategoryIcon = PRIZE_CATEGORY;
  prizeCategories = [];
  dollarValue = false;
  redeemableDetails = false;
  numberAvailable = false;
  s3Folder = ENTITY_FOLDER;

  constructor(
    private modalService: NgbModal,
    private prizeApiService: PrizeApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForm(this.prizeValue);
    this.getPrizeCatagories();
    if (this.prizeValue.totalWinners > 1) {
      this.numberAvailable = true;
    }
    if (this.prizeValue.prizeValue) {
      this.dollarValue = true;
    }
    if (this.prizeValue.image) {
      this.imagPosted = true;
    }
  }

  ngOnChanges() {
    this.initializeForm(this.prizeValue);
    if (this.prizeValue.image) {
      this.imagPosted = true;
    }
  }

  getPrizeCatagories() {
    this.prizeApiService.getPrizeCategory().subscribe((res: any) => {
      this.prizeCategories = res.response;
      if (!this.prizeValue.title)
        this.form.controls.category.setValue(this.prizeCategories[0].id);
    });
  }

  initializeForm(dataSet) {
    this.form = this.fb.group({
      id: [dataSet.id],
      image: [dataSet.image],
      title: [dataSet.title, Validators.required],
      description: [dataSet.description],
      totalWinners: [dataSet.totalWinners || 1],
      prizeValue: [dataSet.prizeValue],
      category: [dataSet.categoryId],
      challenge: [dataSet.challenge || this.challengeId]
    });
  }

  setCategory(id) {
    this.form.controls.category.setValue(id);
  }

  removeImage() {
    this.imagPosted = false;
    this.form.controls.image.setValue(null);
  }

  addImage(event) {
    this.imagPosted = true;
    this.form.controls.image.setValue(event);
  }

  toggleDollarValue() {
    this.dollarValue = !this.dollarValue;
  }

  toggleNumber() {
    this.numberAvailable = !this.numberAvailable;
  }

  toggleRedeemable() {
    this.redeemableDetails = !this.redeemableDetails;
  }
  onSubmit(model) {
    model.totalWinners = Math.abs(parseInt(model.totalWinners));
    model.prizeValue = Math.abs(parseFloat(model.prizeValue));
    this.dataSet.emit(model);
  }
  closeModel() {
    this.close.emit(true);
  }
}
