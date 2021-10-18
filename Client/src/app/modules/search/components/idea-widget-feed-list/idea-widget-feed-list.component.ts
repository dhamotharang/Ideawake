import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  ENTITY_TYPE,
  OPPORTUNITY_DEFAULT_BANNER,
  OPPORTUNITY_PERMISSIONS,
  MANAGE_ACTIONS,
  ACTION_ITEM_ICONS
} from '../../../../utils';
import {
  EntityApiService,
  UtilService,
  WorkflowApiService
} from '../../../../services';

import { find } from 'lodash';

@Component({
  selector: 'app-idea-widget-feed-list',
  templateUrl: './idea-widget-feed-list.component.html',
  styleUrls: ['./idea-widget-feed-list.component.scss']
})
export class IdeaWidgetFeedListComponent implements OnChanges, OnInit {
  @Input() idea;
  @Input() upvotes;
  @Input() upvotesData;
  @Input() tagsData;
  @Input() commentCounts;
  @Input() permissions = OPPORTUNITY_PERMISSIONS;
  @Input() inlineText = false;

  upvoteData;
  showManageOptions = false;
  ideaEntity = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  stages;
  selectedStage;
  manageActions = MANAGE_ACTIONS;
  public actionItems = ACTION_ITEM_ICONS;

  @Output() action = new EventEmitter<any>();
  @Output() opportunityUpdated = new EventEmitter<any>();

  public displayImage = OPPORTUNITY_DEFAULT_BANNER;

  constructor(
    public util: UtilService,
    private entityApi: EntityApiService,
    private workflowApi: WorkflowApiService
  ) {}

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

  ngOnInit() {
    if (this.upvotesData) {
      this.upvoteData = this.upvotesData[this.idea.id];
    }
  }

  updateList(idea) {
    this.idea = idea;
    this.opportunityUpdated.emit({ updated: true });
  }

  removeUpvoter(data) {
    if (data.type === 'add') {
      this.upvoteData = this.upvoteData || [];
      this.upvoteData.push(data.data);
      this.upvoteData = [...this.upvoteData];
    } else {
      this.upvoteData = this.upvoteData.filter(
        (value) => value.user.id !== data.user.id
      );
    }
  }

  selectAction(e, action, data?) {
    e.stopPropagation();

    this.action.emit({ action, data });
  }

  stopProp(e) {
    e.stopPropagation();
  }

  loadStages(event) {
    // event.stopPropagation();
    if (this.idea && this.idea.workflow && this.idea.workflow.id) {
      if (event) {
        this.getWorkflowStages();
      }
    }
  }

  getWorkflowStages() {
    this.workflowApi
      .getAllStages({ workflow: this.idea.workflow.id, isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
        if (this.idea.stage) {
          this.selectedStage = this.stages.find(
            (stage) => stage.id === this.idea.stage.id
          );
        }
      });
  }
}
