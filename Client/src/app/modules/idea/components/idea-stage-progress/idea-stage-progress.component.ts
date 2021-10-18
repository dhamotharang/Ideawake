import {
  ACTION_ITEM_ABBREVIATIONS,
  ACTION_ITEM_ICONS,
  DEFAULT_PRELOADED_IMAGE,
  IDEA_TABS
} from '../../../../utils';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from '../../../workflow/components';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkflowApiService } from '../../../../services';

@Component({
  selector: 'app-idea-stage-progress',
  templateUrl: './idea-stage-progress.component.html',
  styleUrls: ['./idea-stage-progress.component.scss']
})
export class IdeaStageProgressComponent implements OnInit, OnChanges {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() public idea;
  @Input() private ideaEntity;
  @Input() private followerData;
  @Input() stageStats;
  @Input() stageAssignees;
  @Input() userOpportunityPermissions;

  @Output() updatedIdea = new EventEmitter();
  @Output() tab = new EventEmitter<string>();

  // private stageEntity;

  public currentStage;
  public actionItemsAbbr = ACTION_ITEM_ABBREVIATIONS;
  public actionItems = ACTION_ITEM_ICONS;
  public isLoading;
  public ceiling: (x: number) => number;
  public tabs = IDEA_TABS;
  stageName;

  constructor(
    private modalService: NgbModal,
    private workflowApi: WorkflowApiService
  ) {
    this.ceiling = Math.ceil;
  }

  ngOnInit() {
    this.isLoading = true;
    this.getStageEntity();
    this.isLoading = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'idea':
            if (this.idea && this.idea.stage) {
              this.workflowApi
                .getStageById(this.idea.stage.id)
                .subscribe((res: any) => {
                  this.currentStage = res.response;
                  this.stageName = this.currentStage.actionItem.title;
                });
            }
            break;
        }
      }
    }
  }

  open(content) {
    this.modalService.open(content, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  getStageEntity() {
    /*   this.EntityApiService
      .getEntities({ abbreviation: ENTITY_TYPE.STAGE })
      .subscribe((res: any) => {
        this.stageEntity = res.response[0];
      }); */
  }

  addWorkFlow() {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = this.idea;
    modalRef.componentInstance.updatedOpportunity.subscribe((opportunity) => {
      this.updatedIdea.emit(opportunity);
    });
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.followerData = this.followerData;
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  manageStage() {
    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    modalRef.componentInstance.opportunity = this.idea;
    modalRef.componentInstance.selectedStage = this.idea.stage;
    modalRef.componentInstance.workFlowSelected = this.idea.workflow;
    modalRef.componentInstance.followerData = this.followerData;
    modalRef.componentInstance.updatedOpportunity.subscribe((opportunity) => {
      this.updatedIdea.emit(opportunity);
    });

    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
    modalRef.componentInstance.changeWorkflow.subscribe(() => {
      modalRef.close();
      this.addWorkFlow();
    });
  }
}
