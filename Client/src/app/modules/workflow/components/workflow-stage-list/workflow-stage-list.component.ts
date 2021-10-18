import { get, map, keyBy, forEach, trimEnd, sumBy, round, uniq } from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../../../store';
import {
  WorkflowApiService,
  GroupsApiService,
  CustomFieldApiService
} from '../../../../services';
import {
  ACTION_ITEM_ICONS,
  ACTION_ITEM_ABBREVIATIONS
} from '../../../../utils';

@Component({
  selector: 'app-workflow-stage-list',
  templateUrl: './workflow-stage-list.component.html',
  styleUrls: ['./workflow-stage-list.component.scss']
})
export class WorkflowStageListComponent implements OnInit {
  communityId;
  workflowId;
  closeResult: string;
  workflow: any = {};
  selectedStage;
  stages = [];
  stagesDetail = [];
  stagesAssignee = [];
  stagesCustomFieldAssignee = [];
  allCustomFields = [];
  tools = [];
  userList = [];
  groupList = [];
  actionItemsIcon = ACTION_ITEM_ICONS;
  actionItemAbbreviations = ACTION_ITEM_ABBREVIATIONS;

  constructor(
    private modalService: NgbModal,
    private ngRedux: NgRedux<AppState>,
    private groupApi: GroupsApiService,
    private activatedRoute: ActivatedRoute,
    private workflowApiService: WorkflowApiService,
    private customFieldsApi: CustomFieldApiService
  ) {}

  async ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.workflowId = this.activatedRoute.snapshot.params.id;
    this.getUsers();
    this.getGroups();
    this.getWorkflow();
    this.getFieldsList();
    await this.getStages();
    this.getStagesDetails();
    this.tools = get(
      this.activatedRoute.snapshot.data.actionItems,
      'response',
      []
    );
  }

  getUsers() {
    this.groupApi
      .getUsersByCommunityId(this.communityId)
      .subscribe((res: any) => {
        this.userList = keyBy(res.response, 'id');
      });
  }

  getGroups() {
    this.groupApi.getGroups().subscribe((res: any) => {
      this.groupList = keyBy(res.response.data, 'id');
    });
  }

  getFieldsList() {
    this.customFieldsApi
      .getAllCustomFields({
        isDeleted: false,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.allCustomFields = keyBy(res.response, 'id');
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.stages, event.previousIndex, event.currentIndex);
    const params = {
      workflow: this.workflowId,
      stages: map(this.stages, 'id')
    };
    this.workflowApiService.updateStagesOrder(params).subscribe();
  }

  getWorkflow() {
    this.workflowApiService.getById(this.workflowId).subscribe((res: any) => {
      this.workflow = res.response;
    });
  }

  getStagesDetails() {
    this.workflowApiService
      .getStagesDetails({
        workflow: this.workflowId,
        isDeleted: false
      })
      .subscribe((res: any) => {
        this.stagesDetail = keyBy(res.response, 'stage');
        forEach(this.stages, (stage) => {
          this.stagesAssignee[stage.id] = this.assigneeDetail(stage);
        });
      });
  }

  getStages() {
    this.workflowApiService
      .getAllStages({ workflow: this.workflowId, isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
      });
  }

  archiveStage(stage) {
    this.modalService.dismissAll();
    this.workflowApiService.deleteStageById(stage.id).subscribe((res: any) => {
      this.getStages();
      this.getStagesDetails();
    });
  }

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'custom-field-modal',
        ariaLabelledBy: 'modal-basic-title'
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${reason}`;
        }
      );
  }
  getStageLimit(stage) {
    const detail = get(this.stagesDetail, stage.id);
    const days = get(detail, 'assignmentSettings.stageTimeLimit');
    if (days === null || days === undefined) {
      return `Not Set`;
    }
    if (days > 0) {
      return `${days}`;
    } else if (days < 1) {
      return `0`;
    }
  }

  assigneeCustomField(stage) {
    const detail = get(this.stagesDetail, stage.id);
    const options = get(
      detail,
      'assigneeSettings.customFieldAssignee.options',
      []
    );
    const optionsList = [];
    forEach(options, (value) => {
      let userString = '';
      if (value.users.length) {
        forEach(value.users, (id) => {
          const user = get(this.userList, id);
          if (user) {
            userString += `${user.firstName} ${user.lastName}, `;
          }
        });
      }
      if (value.groups.length) {
        forEach(value.groups, (id) => {
          const group = get(this.groupList, id);
          if (group) {
            userString += `${group.name}, `;
          }
        });
      }
      optionsList.push({
        label: value.label,
        assignee: trimEnd(userString, ', ')
      });
    });
    return {
      fieldId: get(detail, 'assigneeSettings.customFieldAssignee.fieldId'),
      options: optionsList
    };
  }

  assigneeDetail(stage) {
    this.stagesCustomFieldAssignee[stage.id] = {};
    const detail = get(this.stagesDetail, stage.id);
    if (stage.actionItem.abbreviation === ACTION_ITEM_ABBREVIATIONS.NO_TOOL) {
      return `-`;
    } else if (detail) {
      if (get(detail, 'assigneeSettings.unassigned')) {
        return `Unassigned`;
      } else {
        let userString = '';
        const userArray = [];
        if (get(detail, 'assigneeSettings.allMembers')) {
          userArray.push(`All Community Members`);
        }
        this.stagesCustomFieldAssignee[stage.id] = this.assigneeCustomField(
          stage
        );
        forEach(get(detail, 'assigneeSettings.groups', []), (value) => {
          userArray.push(`${value.name}`);
        });
        forEach(get(detail, 'assigneeSettings.individuals', []), (value) => {
          userArray.push(`${value.firstName} ${value.lastName}`);
        });
        if (!get(detail, 'assigneeSettings.allMembers')) {
          if (get(detail, 'assigneeSettings.communityAdmins')) {
            userArray.push(`Administrators`);
          }
          if (get(detail, 'assigneeSettings.communityModerators')) {
            userArray.push(`Moderators`);
          }
          if (get(detail, 'assigneeSettings.communityUsers')) {
            userArray.push(`All community users`);
          }
        }

        if (get(detail, 'assigneeSettings.opportunityOwners')) {
          userArray.push(`Owners`);
        }
        if (get(detail, 'assigneeSettings.opportunityTeams')) {
          userArray.push(`Team members`);
        }
        if (get(detail, 'assigneeSettings.opportunitySubmitters')) {
          userArray.push(`Submitters and Co-submitters`);
        }
        forEach(uniq(userArray), (str) => {
          userString += `${str}, `;
        });
        return trimEnd(userString, ', ');
      }
    }
  }
  getCriteriaCount(stage) {
    const detail = get(this.stagesDetail, stage.id);
    return get(detail, 'criteria.length', 0);
  }
  getCustomFieldsCount(stage) {
    const detail = get(this.stagesDetail, stage.id);
    return get(detail, 'customFields.length', 0);
  }
  criteriaDescriptionHtml(stage) {
    const detail = get(this.stagesDetail, stage.id);
    const total = sumBy(detail.criteria, 'evaluationCriteria.criteriaWeight');
    let html = '';
    forEach(get(detail, 'criteria', []), (value) => {
      html += `<ul class="list-inline mb-0 small popoverUserMinWidth row">
            <li class="list-inline-item mr-0 col-7">
              <p class="mb-0">${value.evaluationCriteria.title}</p>
            </li>
            <li class="list-inline-item mr-0 col-5">
              <p class="text-center mb-0">${
                value.evaluationCriteria.criteriaWeight
              }
              <span class="font-italic text-muted"> (${round(
                (value.evaluationCriteria.criteriaWeight / total) * 100,
                2
              )}%)</span></p>
            </li>
          </ul><hr class="my-2">`;
    });
    html += `<ul class="list-inline mb-0 small popoverUserMinWidth row">
            <li class="list-inline-item mr-0 col-7">
              <p class="customFieldText bold font-italic mb-0">Stage Score</p>
            </li>
            <li class="list-inline-item col-5">
              <p class="customFieldText bold font-italic text-center mb-0">${total} (100%)</p>
            </li>
    </ul>`;
    return html;
  }

  fieldDescriptionHtml(stage) {
    const detail = get(this.stagesDetail, stage.id);
    let html = '';
    forEach(get(detail, 'customFields', []), (value, key) => {
      html += `<ul class="list-inline mb-0 popoverUserMinWidth small row">
                <li class="list-inline-item mr-0 col-7">
                  <p class="customFieldText mb-0">${value.field.title}</p>
                </li>
                <li class="list-inline-item mr-0 col-5">
                  <p class="customFieldText text-center mb-0">${value.field.customFieldType.title}</p>
                </li>
              </ul>`;
      if (detail.customFields.length !== key + 1) {
        html += `<hr class="my-2">`;
      }
    });
    return html;
  }

  selectStage(stage) {
    this.selectedStage = stage;
  }
}
