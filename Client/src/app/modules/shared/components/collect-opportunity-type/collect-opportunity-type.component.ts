import * as _ from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  GroupsApiService,
  OpportunityApiService,
  SharedApi
} from '../../../../services';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-collect-opportunity-type',
  templateUrl: './collect-opportunity-type.component.html',
  styleUrls: ['./collect-opportunity-type.component.scss'],
  providers: [GroupsApiService, OpportunityApiService]
})
export class CollectOpportunityTypeComponent implements OnInit {
  @Output() data: EventEmitter<any> = new EventEmitter();
  opportunityTypes: Array<any>;
  selectedType: any;
  communityId: string;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private opportunityApi: OpportunityApiService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.opportunityApi
      .getOpportunityType({ community: this.communityId, isEnabled: true })
      .subscribe((res: any) => {
        this.opportunityTypes = res.response;
        if (this.opportunityTypes.length == 1) {
          this.selectedType = res.response[0];
          this.data.emit(this.selectedType);
        }
      });
  }
  close() {
    this.modalService.dismissAll();
  }
  selectType(type) {
    this.selectedType = type;
    this.data.emit(this.selectedType);
  }
}
