import * as _ from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomFieldApiService } from '../../../../services';
import { AppState, UserState, STATE_TYPES } from '../../../../store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomFieldDetailComponent } from '../../../custom-fields/components/custom-field-detail/custom-field-detail.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-opportunity-property',
  templateUrl: './opportunity-property.component.html'
})
export class OpportunityPropertiesComponent implements OnInit, OnDestroy {
  public currentUser = this.ngRedux.getState().userState;
  public fieldsList = [];
  public counts: any;
  public isActive = true;
  public clearText = false;
  public userCommunityPermissions;
  private sub: Subscription;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private modalService: NgbModal,
    private customFieldApiService: CustomFieldApiService
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userCommunityPermissions = userState.userCommunityPermissions;
      });
  }

  ngOnInit() {
    this.getActive();
  }

  getCounts() {
    const params = { community: this.currentUser.currentCommunityId };
    this.customFieldApiService.listCount(params).subscribe((res: any) => {
      this.counts = res.response;
    });
  }

  searchFields(queryParams?) {
    const params = {
      ...queryParams,
      ...{ community: this.currentUser.currentCommunityId }
    };
    params.isDeleted = this.isActive === true ? false : true;
    this.customFieldApiService
      .getAllCustomFields(params)
      .subscribe((res: any) => {
        this.fieldsList = res.response;
      });
  }

  getArchive() {
    this.getCounts();
    this.isActive = false;
    this.clearSearch();
    this.searchFields();
  }

  getActive() {
    this.getCounts();
    this.isActive = true;
    this.clearSearch();
    this.searchFields();
  }

  clearSearch() {
    this.clearText = true;
    setTimeout(() => {
      this.clearText = false;
    }, 500);
  }

  searchText(searchText = '') {
    this.searchFields({ searchText });
  }

  editField(field) {
    const editModalRef = this.modalService.open(CustomFieldDetailComponent, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
    editModalRef.componentInstance.id = field.id;
    editModalRef.componentInstance.isEdit = true;
    editModalRef.componentInstance.modalRef = editModalRef;
    editModalRef.componentInstance.outPutResult.subscribe((result) => {
      if (result) {
        if (!result.close) {
          this.getActive();
        }
        editModalRef.close('closed');
      } else {
        editModalRef.close('cancel');
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
