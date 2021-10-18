import { find, first, get } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { StatusApiService } from '../../../../services';
import { AppState } from '../../../../store';
import { ACTION_ITEM_ICONS, ACTION_ITEM_INFO } from '../../../../utils';

@Component({
  selector: 'app-workflow-stage-basic-information',
  templateUrl: './workflow-stage-basic-information.component.html',
  styleUrls: ['./workflow-stage-basic-information.component.scss']
})
export class WorkflowStageBasicInformationComponent
  implements OnInit, OnChanges {
  @Input() stageInfo;
  @Output() basicInfo = new EventEmitter<any>();
  stageId = this.activatedRoute.snapshot.params.stageId;
  workflowId = this.activatedRoute.snapshot.params.id;
  closeResult: string;
  tools = [];
  statuses = [];
  actionItemsIcon = ACTION_ITEM_ICONS;
  queryParams;
  selectedStatus;
  selectedTool;
  form;
  public currentUser = this.ngRedux.getState().userState;
  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private statusApiService: StatusApiService
  ) {}

  ngOnInit() {
    this.initializeForm({});
    if (!this.stageId) {
      this.defaultStatus();
    }
    this.getStatuses();
    this.queryParams = this.activatedRoute.snapshot.queryParams;
    this.tools = get(this.activatedRoute.snapshot.data.actionItems, 'response');
    if (this.queryParams.tool) {
      const toolId = parseInt(this.queryParams.tool, 10);
      this.form.controls.actionItem.setValue(toolId);
      this.selectedTool = find(this.tools, ['id', toolId]);
      this.selectTool(this.selectedTool);
    } else {
      this.selectedTool = first(this.tools);
    }
  }

  ngOnChanges() {
    if (this.stageInfo) {
      this.initializeForm(this.stageInfo);
      this.selectedStatus = this.stageInfo.status;
      this.selectedTool = this.stageInfo.actionItem;
    }
  }

  initializeForm(dataSet) {
    this.form = this.fb.group({
      actionItem: [get(dataSet, 'actionItem.id', null), Validators.required],
      title: [get(dataSet, 'title', null), Validators.required],
      description: [get(dataSet, 'description', null), Validators.required],
      status: [get(dataSet, 'status.id', null), Validators.required]
    });
    this.basicInfo.emit(this.form.value);
    this.form.valueChanges.subscribe((values) => {
      this.basicInfo.emit(values);
    });
  }

  defaultStatus() {
    this.statusApiService
      .getNextStatus(this.workflowId)
      .subscribe((res: any) => {
        this.selectedStatus = res.response;
        this.form.controls.status.setValue(this.selectedStatus.id);
      });
  }

  getStatuses() {
    const params = {
      community: this.currentUser.currentCommunityId,
      isDeleted: false
    };
    this.statusApiService.getAll(params).subscribe((res: any) => {
      this.statuses = res.response;
    });
  }

  selectStatus(status) {
    this.selectedStatus = status;
    this.form.controls.status.setValue(status.id);
  }

  selectTool(tool) {
    this.selectedTool = tool;
    this.form.controls.actionItem.setValue(tool.id);
    this.form.controls.title.setValue(
      ACTION_ITEM_INFO[tool.abbreviation].stageName
    );
    this.form.controls.description.setValue(
      ACTION_ITEM_INFO[tool.abbreviation].stageDescription
    );
  }

  open(content) {
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
