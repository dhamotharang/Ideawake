import { find, first, get } from 'lodash';

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { WorkflowApiService } from '../../../../services';
import { ACTION_ITEM_ICONS } from '../../../../utils';

@Component({
  selector: 'app-add-edit-workflow-modal',
  templateUrl: './add-edit-workflow-modal.component.html',
  styleUrls: ['./add-edit-workflow-modal.component.scss']
})
export class AddEditWorkFlowModalComponent {
  @Input() opportunity;
  @Input() opportunityEntity;
  @Input() followerData;

  @Output() closePopup = new EventEmitter<any>();
  @Output() updatedOpportunity = new EventEmitter();

  public actionItems = ACTION_ITEM_ICONS;

  public stages;
  public stageSelected = false;
  public selectedStage;

  public workflowSelected;

  constructor(
    private workflowApiService: WorkflowApiService,
    public modal: NgbActiveModal
  ) {}

  getStages() {
    this.workflowApiService
      .getAllStages({ workflow: this.workflowSelected.id, isDeleted: false })
      .subscribe((res: any) => {
        this.stages = get(res, 'response', []);
        if ((this.opportunity.workflow || {}).id === this.workflowSelected.id) {
          this.chooseStage(
            find(this.stages, ['id', get(this.opportunity, 'stage.id', null)])
          );
        } else {
          this.chooseStage(first(res.response));
        }
      });
  }

  closeModel() {
    this.closePopup.emit(true);
  }

  selectWorkFlow(workflow) {
    this.workflowSelected = workflow;
    this.getStages();
  }

  chooseStage(stage) {
    this.selectedStage = stage;
  }
}
