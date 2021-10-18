import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  DEFAULT_PRELOADED_IMAGE,
  OPPORTUNITY_DEFAULT_BANNER,
  OPPORTUNITY_PERMISSIONS
} from '../../../../utils';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';
import { UtilService } from '../../../../services';
import { find } from 'lodash';

@Component({
  selector: 'app-idea-widget-feed',
  templateUrl: './idea-widget-feed.component.html',
  styleUrls: ['./idea-widget-feed.component.scss']
})
export class IdeaWidgetFeedComponent implements OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() idea;
  @Input() upvotes;
  @Input() upvotesData;
  @Input() tagsData;
  @Input() commentCounts;
  @Input() permissions = OPPORTUNITY_PERMISSIONS;
  @Input() opportunityScore;

  showManageOptions = false;

  @Output() action = new EventEmitter<any>();

  @Output() opportunityUpdated = new EventEmitter<any>();

  public displayImage = OPPORTUNITY_DEFAULT_BANNER;

  constructor(public util: UtilService, private ngRedux: NgRedux<AppState>) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'idea':
            if (this.idea && this.idea.opportunityAttachments.length) {
              const f = find(this.idea.opportunityAttachments, [
                'attachmentType',
                'image'
              ]);

              if (f) {
                this.displayImage = f.url;
              }
            }
        }
      }
    }
  }

  updateList(idea) {
    this.idea = idea;
    this.opportunityUpdated.emit({ updated: true });
  }

  removeUpvoter(data) {
    if (data.type === 'add') {
      this.upvotesData = this.upvotesData || [];
      this.upvotesData.push(data.data);
      this.upvotesData = [...this.upvotesData];
    } else {
      this.upvotesData = this.upvotesData.filter(
        (value) => value.user.id !== data.user.id
      );
    }
  }
}
