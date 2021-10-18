import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  Inject
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntityApiService, WorkflowApiService } from '../../../../services';
import { AppState, STATE_TYPES, UserState } from '../../../../store';
import { ACTION_ITEM_ICONS, ENTITY_TYPE } from '../../../../utils';
import {
  AddEditWorkFlowModalComponent,
  WorkflowChangeStageModalComponent
} from '../../../workflow/components';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { LinkedAddComponent } from 'src/app/modules/shared/components/linked-add/linked-add.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-idea-moderate-widget',
  templateUrl: './idea-moderate-widget.component.html',
  styleUrls: ['./idea-moderate-widget.component.scss']
})
export class IdeaModerateWidgetComponent implements OnInit, OnDestroy {
  @Input() index = 0;
  @Input() idea;
  @Input() followerData;
  @Input() userOpportunityPermissions;
  @Input() inlineText = false;

  @Output() archive = new EventEmitter<void>();
  @Output() updateRow = new EventEmitter();

  private sub: Subscription;
  private pageDocument;

  closeResult: string;
  modalRefs = [];
  user;
  ideaEntity;

  stages;
  selectedStage;
  stageToShowInModal;
  stageEntity;

  editAssignees = false;
  editViewers = false;
  editNotifications = false;
  notifySpecificGroups = false;

  visited = false;
  public actionItems = ACTION_ITEM_ICONS;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private workflowApi: WorkflowApiService,
    private entityApiService: EntityApiService,
    @Inject(DOCUMENT) document
  ) {
    this.pageDocument = document;
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.user = userState.user;
      });
  }

  ngOnInit() {
    this.idea = cloneDeep(this.idea);
    this.stageEntity = this.entityApiService.getEntity(ENTITY_TYPE.STAGE);
    this.ideaEntity = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
    setTimeout(() => {
      const id = `action-col-${this.index}`;
      if (this.pageDocument.getElementById(id)) {
        this.pageDocument.getElementById(id).style.zIndex = 80 - this.index;
      }
    }, 2000);
  }

  loadStages(event) {
    if (this.idea && this.idea.workflowId) {
      if (event) {
        this.getWorkflowStages();
      }
    }
  }

  setCSS(event) {
    const id = `action-col-${this.index}`;
    if (this.pageDocument.getElementById(id)) {
      this.pageDocument.getElementById(id).style.zIndex = 80 - this.index;
    }
  }
  open(content) {
    this.modalService.open(content, {
      size: ''
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

  archiveIdea(idea) {
    this.archive.emit(idea);
    this.modalService.dismissAll();
  }

  getWorkflowStages() {
    this.workflowApi
      .getAllStages({ workflow: this.idea.workflowId, isDeleted: false })
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
    modalRef.componentInstance.changeWorkflow.subscribe(() => {
      modalRef.close();
      this.editWorkFlow();
    });
  }

  openLinkOpportunitiesModal() {
    const modalRef = this.modalService.open(LinkedAddComponent, {
      size: 'lg',
      windowClass: 'customModalClass'
    });

    this.modalRefs.push({
      modal: 'linkOpportunities',
      component: modalRef
    });

    modalRef.componentInstance.oppoId = this.idea.id;
    modalRef.componentInstance.oppoTypeId = this.idea.opportunityTypeId;
    modalRef.componentInstance.updateLinkedOppoList.subscribe((value) => {
      this.updateRow.emit(value);
      modalRef.close();
    });
    modalRef.componentInstance.hideLinkOption.subscribe(() => modalRef.close());
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
}
