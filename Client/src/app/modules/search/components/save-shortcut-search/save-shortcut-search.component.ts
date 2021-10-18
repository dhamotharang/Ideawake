import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { AddEditShortcutSearchComponent } from '../add-edit-shortcut-search/add-edit-shortcut-search.component';
import { AppState } from '../../../../store';
import { FORM_SUBMISSION } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-save-shortcut-search',
  templateUrl: './save-shortcut-search.component.html',
  styleUrls: ['./save-shortcut-search.component.scss']
})
export class SaveShortcutSearchComponent implements OnInit {
  @Input() pageType = 'table';
  @Output() outputRes = new EventEmitter();
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {}

  public saveNew() {
    const modalRef = this.modalService.open(AddEditShortcutSearchComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
    modalRef.componentInstance.pageType = this.pageType;
    modalRef.componentInstance.outputResult.subscribe((result) => {
      modalRef.close('cancel');
      if (result.created) {
        this.ngRedux.dispatch({
          type: FORM_SUBMISSION,
          latestSubmission: { view: true }
        });
      }
    });
  }
}
