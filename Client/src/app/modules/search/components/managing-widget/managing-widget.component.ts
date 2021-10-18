import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { WorkflowApiService } from 'src/app/services';

import { ACTION_ITEM_ICONS, MANAGE_ACTIONS } from '../../../../utils';

@Component({
  selector: 'app-managing-widget',
  styleUrls: ['./managing-widget.component.scss'],
  templateUrl: './managing-widget.component.html'
})
export class ManagingWidgetComponent implements OnInit {
  @Input() userAccessPermissions;
  @Input() idea;
  @Input() inlineText = false;
  @Input() isPipelineView = false;
  @Output() action = new EventEmitter<any>();
  @Input() showManageButton = false;

  showDropdownOptions = false;
  stages;
  selectedStage;

  manageActions = MANAGE_ACTIONS;
  public actionItems = ACTION_ITEM_ICONS;

  constructor(private workflowApi: WorkflowApiService) {}

  ngOnInit() {}

  emitAction(e, action, data?) {
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
    console.log('this.idea.workflowId', this.idea.workflowId);
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
