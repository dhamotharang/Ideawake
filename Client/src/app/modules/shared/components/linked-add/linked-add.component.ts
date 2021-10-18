import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faLeaf } from '@fortawesome/pro-solid-svg-icons';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { OpportunityApiService } from 'src/app/services/opportunity/opportunity.service';
import { AppState } from 'src/app/store';
import { OPPORTUNITY_LINKAGE_RELATIONSHIPS } from 'src/app/utils/constants';

@Component({
  selector: 'app-linked-add',
  templateUrl: './linked-add.component.html',
  styleUrls: ['./linked-add.component.scss']
})
export class LinkedAddComponent implements OnInit {
  opportunities: any[] = [];
  OppTypes: any[] = [];
  @Input() selected = [];
  @Input() oppoId: any;
  @Input() oppoTypeId: any;
  @Output() updateLinkedOppoList = new EventEmitter();
  @Output() hideLinkOption = new EventEmitter();
  opportunityLinkageRelationships = OPPORTUNITY_LINKAGE_RELATIONSHIPS;
  activeListItem: Number;

  opportunityRelationsip;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private opportunityApi: OpportunityApiService,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    this.activeListItem = this.opportunityLinkageRelationships.findIndex(
      (val) => val.key === 'related_to'
    );
    this.opportunityRelationsip = 'related_to';
    this.getOpportunities();
  }

  private async getOpportunities() {
    const queryParams = {
      community: this.ngRedux.getState().userState.currentCommunityId,
      isDeleted: false,
      oppoTypeId: this.oppoTypeId,
      isFilterOnOppoType: true,
      exludedId: this.oppoId
    };

    const res: any = await this.opportunityApi
      .getOpportunity(queryParams)
      .toPromise();
    this.opportunities = _.get(res, 'response.data', []);
    _.forEach(this.opportunities, (opportunity) => {
      const date = moment(opportunity.createdAt);
      opportunity.createdAt = {
        year: date.year(),
        month: date.month() + 1,
        day: date.date()
      };
    });
  }

  setRelationship(relationship, index) {
    this.activeListItem = index;
    this.opportunityRelationsip = relationship.key;
  }

  linkOpportunity() {
    let linkedOpportunities = _.cloneDeep(this.selected);
    const queryParams = {
      relation: this.opportunityRelationsip,
      opportunityId: this.oppoId,
      linkedOpportunityIds: linkedOpportunities
    };

    this.opportunityApi.linkOpportunities(queryParams).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.selected = [];
        this.notifier.showInfo(
          `Selected opportunities have been successfully linked`,
          {
            positionClass: 'toast-bottom-center'
          }
        );
        this.updateLinkedOppoList.emit(true);
      } else {
        this.notifier.showInfo('Something went wrong', {
          positionClass: 'toast-bottom-center'
        });
      }
    });
  }

  close() {
    this.hideLinkOption.emit(true);
  }
}
