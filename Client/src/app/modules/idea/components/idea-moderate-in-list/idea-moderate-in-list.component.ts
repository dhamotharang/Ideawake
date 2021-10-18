import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from '../../../workflow/components';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  EntityApiService,
  SharedApi,
  WorkflowApiService
} from '../../../../services';

import { ENTITY_TYPE } from '../../../../utils';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-idea-moderate-in-list',
  templateUrl: './idea-moderate-in-list.component.html',
  styleUrls: ['./idea-moderate-in-list.component.scss']
})
export class IdeaModerateInListComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() idea;
  @Input() followerData;
  @Input() userOpportunityPermissions;

  @Output() archive = new EventEmitter<void>();
  @Output() updateRow = new EventEmitter();

  private sub: Subscription;

  closeResult: string;
  modalRefs = [];
  ideaOwner;
  user;
  ideaEntity;

  stages;
  selectedStage;
  stageToShowInModal;
  stageEntity;
  merge;

  editAssignees = false;
  editViewers = false;
  editNotifications = false;
  notifySpecificGroups = false;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private sharedApi: SharedApi,
    private workflowApi: WorkflowApiService,
    private entityApi: EntityApiService
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.user = userState.user;
      });
  }

  async ngOnInit() {
    this.ideaOwner = this.idea.user.id === this.user.id;
    this.stageEntity = this.entityApi.getEntity(ENTITY_TYPE.STAGE);
    this.ideaEntity = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  ngOnChanges() {
    if (this.idea && this.idea.workflow) {
      this.getWorkflowStages();
    }
  }

  open(content) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }

  editIdeaModal(tab) {
    const modalRef = this.modalService.open(EditIdeaComponent, {
      size: 'lg'
    });

    this.modalRefs.push({
      modal: 'editIdea',
      component: modalRef
    });

    modalRef.componentInstance.ideaId = this.idea.id;
    modalRef.componentInstance.tab = tab;
    modalRef.componentInstance.updatedIdea.subscribe((idea) => {
      this.updateRow.emit(idea);
    });
  }

  editWorkFlow() {
    const modalRef = this.modalService.open(AddEditWorkFlowModalComponent, {
      size: 'lg'
    });

    this.modalRefs.push({
      modal: 'editWorkFlow',
      component: modalRef
    });

    modalRef.componentInstance.opportunity = this.idea;
    modalRef.componentInstance.updatedOpportunity.subscribe((opportunity) => {
      this.updateRow.emit(opportunity);
    });
    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.followerData = this.followerData;
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  archiveIdea() {
    this.archive.emit();
    this.modalService.dismissAll();
  }

  getWorkflowStages() {
    this.workflowApi
      .getAllStages({ workflow: this.idea.workflow.id, isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
        this.selectedStage = this.stages.find(
          (stage) => stage.id === this.idea.stage.id
        );
      });
  }

  openChangeStage(stage) {
    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    this.modalRefs.push({
      modal: 'editWorkflowStage',
      component: modalRef
    });

    modalRef.componentInstance.opportunity = this.idea;
    modalRef.componentInstance.selectedStage = stage;
    modalRef.componentInstance.workFlowSelected = this.idea.workflow;
    modalRef.componentInstance.followerData = this.followerData;
    modalRef.componentInstance.updatedOpportunity.subscribe((opportunity) => {
      this.updateRow.emit(opportunity);
    });

    modalRef.componentInstance.opportunityEntity = this.ideaEntity;
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  setStageToShowInModal(stage) {
    this.stageToShowInModal = stage;
  }

  toggleAssignees() {
    this.editAssignees = !this.editAssignees;
  }

  toggleViewers() {
    this.editViewers = !this.editViewers;
  }

  toggleNotifications() {
    this.editNotifications = !this.editNotifications;
  }

  toggleSpecificGroups() {
    this.notifySpecificGroups = !this.notifySpecificGroups;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  addWorkFlow() {}
}
