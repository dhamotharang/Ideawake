import { find, get, isEmpty } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NotificationService, WorkflowApiService } from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTION_ITEM_INFO,
  ACTION_ITEM_ABBREVIATIONS
} from '../../../../utils/constants';

@Component({
  selector: 'app-workflow-stage-add',
  templateUrl: './workflow-stage-add.component.html',
  styleUrls: ['./workflow-stage-add.component.scss']
})
export class WorkflowStageAddComponent implements OnInit {
  closeResult: string;
  public currentUser = this.ngRedux.getState().userState;
  workflowId = this.activatedRoute.snapshot.params.id;
  stageId = this.activatedRoute.snapshot.params.stageId;
  actionItemInfo = ACTION_ITEM_INFO;
  tools = get(this.activatedRoute.snapshot.data.actionItems, 'response');
  potentialCounts;
  formType: any = {
    create: 'create',
    update: 'update'
  };
  workflow: any = {};
  model: any = {};
  settings: any = null;
  stage: any = {};
  currentTool: any = {};
  show = false;
  invalidToolData = false;
  showInstructions = false;
  specificMembers = false;
  dueDate = false;
  noTool = false;
  toggleShowActionItem() {
    this.show = !this.show;
  }

  toggleShowStageInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleSpecificMembers() {
    this.specificMembers = !this.specificMembers;
  }

  toggleDueDate() {
    this.dueDate = !this.dueDate;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private notification: NotificationService,
    private workflowApiService: WorkflowApiService
  ) {}

  ngOnInit() {
    this.getWorkflow();
    this.getPotentialAssigneesCount();
    if (this.stageId) {
      this.getStageById();
    }
  }

  open(content) {
    this.checkFields();
    if (this.invalidToolData) {
      return false;
    }
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        beforeDismiss: this.beforeDismiss
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private beforeDismiss() {
    // if return false or failed promise, no dismiss modal
    return true;
  }

  getStageById() {
    this.workflowApiService.getStageById(this.stageId).subscribe((res: any) => {
      this.stage = res.response;
      this.settings = this.stage.stageNotificationSettings;
      if (get(this.stage, 'actionItem.abbreviation') === 'no_tool') {
        this.noTool = true;
      }
    });
  }

  getWorkflow() {
    this.workflowApiService.getById(this.workflowId).subscribe((res: any) => {
      this.workflow = res.response;
    });
  }

  getPotentialAssigneesCount() {
    const params = {
      community: this.currentUser.currentCommunityId
    };
    this.workflowApiService
      .getPotentialAssigneesCount(params)
      .subscribe((res: any) => {
        this.potentialCounts = res.response;
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  basicInfo(event) {
    this.model = {
      ...this.model,
      ...event
    };
    this.noTool = false;
    this.currentTool = find(this.tools, ['id', this.model.actionItem]);
    if (
      get(this.currentTool, 'abbreviation', null) ===
      ACTION_ITEM_ABBREVIATIONS.NO_TOOL
    ) {
      this.noTool = true;
      this.model.assigneeSettings = null;
      this.model.stageAssignmentSettings = null;
      this.model.stageActivityVisibilitySettings = null;
    }
    if (
      get(this.currentTool, 'abbreviation') !==
        ACTION_ITEM_ABBREVIATIONS.SCORECARD &&
      get(this.currentTool, 'abbreviation') !==
        ACTION_ITEM_ABBREVIATIONS.DECISION
    ) {
      this.model.attachedEvaluationCriteria = [];
    }
    if (
      get(this.currentTool, 'abbreviation') !==
      ACTION_ITEM_ABBREVIATIONS.REFINEMENT
    ) {
      this.model.attachedCustomFields = [];
    }
  }

  stageAssignee(event) {
    this.model = {
      ...this.model,
      ...event
    };
  }

  attachedCriteria(event) {
    this.model = {
      ...this.model,
      ...{ attachedEvaluationCriteria: event }
    };
  }

  attachedCustomFields(event) {
    this.model = {
      ...this.model,
      ...{ attachedCustomFields: event }
    };
  }

  getSettings(event) {
    this.model.stageNotificationSettings = event;
  }

  submit(type) {
    this.checkFields();
    if (this.invalidToolData) {
      this.modalService.dismissAll();
      return false;
    }
    const params = {
      workflow: this.workflowId,
      community: this.currentUser.currentCommunityId,
      ...this.model
    };
    if (type === this.formType.create) {
      this.createStage(params);
    } else if (type === this.formType.update) {
      this.updateStage(params);
    }
  }
  createStage(params) {
    this.workflowApiService.createStage(params).subscribe((res: any) => {
      this.notification.showInfo('Stage added successfully.', {
        positionClass: 'toast-top-center'
      });
      this.router.navigate(['/workflow/stage-list/', this.workflowId]);
    });
  }

  updateStage(params) {
    this.modalService.dismissAll();
    this.workflowApiService
      .updateStageById(this.stageId, params)
      .subscribe((res: any) => {
        this.notification.showInfo('Alerts.StageUpdatedSuccess', {
          positionClass: 'toast-top-center'
        });
        this.router.navigate(['/workflow/stage-list/', this.workflowId]);
      });
  }

  checkFields() {
    this.invalidToolData = false;
    if (
      get(this.currentTool, 'abbreviation') ===
        ACTION_ITEM_ABBREVIATIONS.SCORECARD &&
      isEmpty(this.model.attachedEvaluationCriteria)
    ) {
      this.invalidToolData = true;
      this.notification.showWarning(
        "Select Criteria You'd Like to Collect In Stage Specific Settings."
      );
      this.scroll('stage-specific');
    }
    if (
      get(this.currentTool, 'abbreviation') ===
        ACTION_ITEM_ABBREVIATIONS.REFINEMENT &&
      isEmpty(this.model.attachedCustomFields)
    ) {
      this.invalidToolData = true;
      this.notification.showWarning(
        "Select Fields You'd Like to Collect In Stage Specific Settings."
      );
      this.scroll('stage-specific');
    }
  }

  scroll(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      });
    }
  }
}
