import { AppState, STATE_TYPES } from '../../../../store';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { CollectOpportunityTypeComponent } from '../../../shared/components';
import { DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-omni-box',
  templateUrl: './omni-box.component.html',
  styleUrls: ['./omni-box.component.scss']
})
export class OmniBoxComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  closeResult: string;
  communityId;
  similarIdeas = [];
  title;
  user;
  saveDraftCheck = false;
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private router: Router
  ) {}
  closePostIdeaModalRef: any;
  ref;
  private sub: Subscription;

  ngOnInit() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.user = state.user;
      });
  }

  open(content) {
    this.ref = this.modalService.open(content, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
  }

  searchTerm(term) {
    this.title = term;
  }

  openPostChallenge() {
    const modalRef = this.modalService.open(CollectOpportunityTypeComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.data.subscribe((result) => {
      modalRef.close('success');
      this.router.navigate(['/challenges/post'], {
        queryParams: { opportunityType: result.id }
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
