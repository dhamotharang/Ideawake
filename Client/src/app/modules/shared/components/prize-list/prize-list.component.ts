import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { compact, find, get, keyBy } from 'lodash';

import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrizeAddEditComponent } from '../prize-add-edit/prize-add-edit.component';
import { PrizeApiService } from '../../../../services';

@Component({
  selector: 'app-prize-list',
  templateUrl: './prize-list.component.html',
  styleUrls: ['./prize-list.component.scss']
})
export class PrizeListComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() prizes: any = [];
  @Output() outputPrizes = new EventEmitter<boolean>();
  prizeCategories;
  show = false;
  constructor(
    private modalService: NgbModal,
    private prizeApiService: PrizeApiService
  ) {}
  ngOnInit() {
    this.getPrizeCatagories();
  }

  open(prize, index) {
    const modalRef = this.modalService.open(PrizeAddEditComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.prizeValue = prize;
    modalRef.componentInstance.dataSet.subscribe((data) => {
      this.prizes[index] = data;
      this.outputPrizes.emit(this.prizes);
      modalRef.close();
    });
    modalRef.componentInstance.close.subscribe((closed) => {
      modalRef.close();
    });
  }

  getPrizeCatagories() {
    this.prizeApiService.getPrizeCategory().subscribe((res: any) => {
      this.prizeCategories = keyBy(res.response, 'id');
      this.show = true;
    });
  }

  getCategoryTitle(category, categoryId) {
    let categorySelected = {};
    if (categoryId) {
      categorySelected = find(this.prizeCategories, ['id', categoryId]);
    } else {
      categorySelected = find(this.prizeCategories, ['id', category]);
    }
    return get(categorySelected, 'title', 'Other');
  }

  remove(index) {
    if (get(this.prizes[index], 'id', null)) {
      const id = get(this.prizes[index], 'id', null);
      this.prizeApiService.deletePrize(id).subscribe();
    }
    delete this.prizes[index];
    this.prizes = compact(this.prizes);
    this.outputPrizes.emit(this.prizes);
  }

  newPrize(data) {}
}
