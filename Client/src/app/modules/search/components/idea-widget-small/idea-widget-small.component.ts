import { Component, EventEmitter, Input, Output } from '@angular/core';

import { UtilService } from '../../../../services';
import { OPPORTUNITY_DEFAULT_BANNER, OPPORTUNITY_PERMISSIONS } from '../../../../utils';

@Component({
  selector: 'app-idea-widget-small',
  templateUrl: './idea-widget-small.component.html',
  styleUrls: ['./idea-widget-small.component.scss']
})
export class IdeaWidgetSmallComponent {
  @Input() idea;
  @Input() upvotes;
  @Input() permissions = OPPORTUNITY_PERMISSIONS;
  @Output() opportunityUpdated = new EventEmitter<any>();

  public defaultOpportunityImage = OPPORTUNITY_DEFAULT_BANNER;

  constructor(public util: UtilService) { }

  updateList(idea) {
    this.idea = idea;
    this.opportunityUpdated.emit({ updated: true });
  }

  upVoted() {
    this.opportunityUpdated.emit({ updated: true });
  }

}
