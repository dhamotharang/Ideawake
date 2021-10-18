import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { OPPORTUNITY_LINKAGE_RELATIONSHIPS } from 'src/app/utils/constants';
import { OpportunityApiService } from 'src/app/services/opportunity/opportunity.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-linked-list',
  templateUrl: './linked-list.component.html',
  styleUrls: ['./linked-list.component.scss']
})
export class LinkedListComponent implements OnInit {
  viewDetails = false;
  opportunityLinkageRelationships = OPPORTUNITY_LINKAGE_RELATIONSHIPS;

  @Input() linkedOpportunities: any;
  @Output() updateLinkedOppoList = new EventEmitter();

  toggleDetails() {
    this.viewDetails = !this.viewDetails;
  }

  constructor(
    private opportunityApi: OpportunityApiService,
    private notifier: NotificationService
  ) {}

  ngOnInit() {
    _.forEach(this.linkedOpportunities, (opportunity) => {
      if (opportunity.linkedOpportunity.createdAt) {
        const date = moment(opportunity.linkedOpportunity.createdAt);
        opportunity.linkedOpportunity.createdAt = {
          year: date.year(),
          month: date.month() + 1,
          day: date.date()
        };
      }

      switch (opportunity.relation) {
        case 'related_to':
          opportunity.relationTitle = 'Relates To';
          return;
        case 'duplicates':
          opportunity.relationTitle = 'Duplicates';
          return;
        case 'is_duplicated_by':
          opportunity.relationTitle = 'Is Duplicated By';
          return;
        case 'alternative_to':
          opportunity.relationTitle = 'Alternative To';
          return;
        case 'blocks':
          opportunity.relationTitle = 'Blocks';
          return;
        case 'is_blocked_by':
          opportunity.relationTitle = 'Is Blocked By';
          return;
        case 'has_synergies_with':
          opportunity.relationTitle = 'Has Synergies With';
          return;
        default:
          return;
      }
    });
  }

  unlinkOpportunity(id) {
    this.opportunityApi.unLinkOpportunity(id).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.notifier.showInfo(
          `Selected opportunity has been successfully deleted`,
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

  updateLinkageRelationship(id, relationship) {
    const body = {
      relation: relationship
    };
    this.opportunityApi
      .updateLinkageRelationship(id, body)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showInfo(`Relationship updated successfully`, {
            positionClass: 'toast-bottom-center'
          });
          this.updateLinkedOppoList.emit(true);
        } else {
          this.notifier.showInfo('Something went wrong', {
            positionClass: 'toast-bottom-center'
          });
        }
      });
  }
}
