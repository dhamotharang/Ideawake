import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import { AppState } from 'src/app/store';
import { WorkflowChangeStageModalComponent } from 'src/app/modules/workflow/components';
import { WorkflowApiService } from 'src/app/services';
import { orderBy } from 'lodash';
import { AddUserComponent } from '../addUsers/addUsers.component';
import { IdeaBulkEditSettingsComponent } from '../idea-bulk-edit-settings/idea-bulk-edit-settings.component';
import {
  IDEA_USERS,
  DEFAULT_PRELOADED_IMAGE,
  OPPORTUNITY_SETTINGS_TYPES
} from '../../../../utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-idea-bulk-actions',
  templateUrl: './idea-bulk-actions.component.html',
  styleUrls: ['./idea-bulk-actions.component.scss']
})
export class IdeaBulkActionsComponent implements OnInit {
  @Input() count = 0;
  @Output() selectAllIdeas = new EventEmitter<any>();
  @Output() archiveIdeas = new EventEmitter<null>();
  @Output() updateOpportunites = new EventEmitter();
  modalRef: NgbModalRef;
  stages = [];
  groupByFn;
  groupValueFn;
  @Output() updateBulkOpportunitySettings = new EventEmitter<any>();
  @Output() addBulkUsers = new EventEmitter<any>();
  @Output() customFieldData = new EventEmitter<any>();
  OpportunitySettingType = OPPORTUNITY_SETTINGS_TYPES;
  ideaUserType = IDEA_USERS;
  userIds = {
    owner: [],
    submitter: [],
    contributor: []
  };

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private workflowApiService: WorkflowApiService
  ) {}

  ngOnInit() {
    this.getStages();
  }

  open(content) {
    this.modalRef = this.modalService.open(content, {
      size: 'lg'
    });
  }

  public openUserSettingsModal(type) {
    const modalRef = this.modalService.open(AddUserComponent, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'custom-field-modal'
    });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.exclude = this.userIds[type.key];
    modalRef.componentInstance.closePopup.subscribe(() => {
      modalRef.close('cancel');
    });
    modalRef.componentInstance.data.subscribe((result) => {
      result.type = type;
      this.addBulkUsers.emit(result);
      modalRef.close('save');
    });
  }

  onSelectAllIdeas(event) {
    this.selectAllIdeas.emit(event);
  }

  onArchiveIdeas() {
    this.modalRef.close();
    this.archiveIdeas.emit();
  }

  get selected(): number[] {
    const selected = this.ngRedux.getState().ideasState.list.selected;
    return selected;
  }

  onStageSelect(val) {
    if (!val) return;

    const modalRef = this.modalService.open(WorkflowChangeStageModalComponent, {
      size: 'lg'
    });

    const selectedStage = _.cloneDeep(val);

    modalRef.componentInstance.ids = this.selected;
    modalRef.componentInstance.isBulkUpdate = true;
    modalRef.componentInstance.selectedStage = selectedStage;
    modalRef.componentInstance.workFlowSelected = selectedStage.workflow;
    modalRef.componentInstance.updateOpportunities.subscribe((data) => {
      this.updateOpportunites.emit(data);
    });
    modalRef.componentInstance.closePopup.subscribe(() => modalRef.close());
  }

  getStages() {
    this.workflowApiService
      .getAllStages({ isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
        this.stages = orderBy(this.stages, ['orderNumber'], ['asc']);
        this.groupByFn = (item) => item.workflowId;
        this.groupValueFn = (_: string, children: any[]) => ({
          name: children[0].workflow ? children[0].workflow.title : null
        });
      });
  }
  public openIdeaSettingsModal(type) {
    const modalRef = this.modalService.open(IdeaBulkEditSettingsComponent, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'custom-field-modal'
    });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.closePopup.subscribe(() => {
      modalRef.close('cancel');
    });
    modalRef.componentInstance.data.subscribe((result) => {
      this.updateBulkOpportunitySettings.emit(result);
      modalRef.close('save');
    });
  }
  getCustomFieldsData(data) {
    this.customFieldData.emit(data);
  }
}
