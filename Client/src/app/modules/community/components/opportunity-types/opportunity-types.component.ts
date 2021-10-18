import { concat } from 'lodash';

import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CommunityApi, NotificationService } from '../../../../services';
import { CommunityAddNewOpportunityComponent } from '../community-add-new-opportunity/community-add-new-opportunity.component';

@Component({
  selector: 'app-opportunity-types',
  templateUrl: './opportunity-types.component.html',
  styleUrls: ['./opportunity-types.component.scss']
})
export class OpportunityTypesComponent implements OnInit {
  opportunityTypes;
  constructor(
    private communityApi: CommunityApi,
    private modalService: NgbModal,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    this.getAllOpportunities();
  }

  getAllOpportunities() {
    this.communityApi.getAllOpportunities().subscribe((res: any) => {
      this.opportunityTypes = res.response;
    });
  }

  addNewOpportunityModal() {
    const modalRef = this.modalService.open(
      CommunityAddNewOpportunityComponent,
      {
        windowClass: 'custom-field-modal',
        ariaLabelledBy: 'modal-basic-title'
      }
    );
    modalRef.componentInstance.linkableTypes = this.opportunityTypes;
    modalRef.componentInstance.newAddition.subscribe((opportunityType) => {
      const arr = [opportunityType];
      this.opportunityTypes = concat(arr, this.opportunityTypes);
    });
  }

  archiveOpportunity(opportunity, modalRef) {
    this.communityApi
      .editOpportunityType({ ...opportunity, ...{ isDeleted: true } })
      .subscribe((res: any) => {
        this.notifier.showSuccess('Archived successfully');
        opportunity.isDeleted = true;
        modalRef.close();
      });
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }
}
