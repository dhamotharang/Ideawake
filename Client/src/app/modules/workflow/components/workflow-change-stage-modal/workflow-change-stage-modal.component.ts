import {
  camelCase,
  cloneDeep,
  forEach,
  get,
  groupBy,
  head,
  isEmpty,
  isEqual,
  map,
  startCase,
  trimEnd,
  uniq,
  keyBy
} from 'lodash';
import * as moment from 'moment/moment';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  DoCheck,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  NgbActiveModal,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';

import {
  EntityApiService,
  GroupsApiService,
  NotificationService,
  OpportunityApiService,
  WorkflowApiService,
  CustomFieldApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  ACTION_ITEM_ABBREVIATIONS,
  ACTION_ITEM_ICONS,
  ENTITY_TYPE,
  INITIAL_STAGE_ACTIVITY_VISIBILITY_SETTINGS,
  INITIAL_STAGE_ASSIGNEE_SETTINGS,
  INITIAL_STAGE_ASSIGNMENT_SETTINGS,
  INITIAL_STAGE_NOTIFICATION_SETTINGS
} from '../../../../utils';

@Component({
  selector: 'app-workflow-change-stage',
  templateUrl: './workflow-change-stage-modal.component.html',
  styleUrls: ['./workflow-change-stage-modal.component.scss']
})
export class WorkflowChangeStageModalComponent implements OnInit, DoCheck {
  @Input() opportunity;
  @Input() opportunityEntity = this.entityApiService.getEntity(
    ENTITY_TYPE.IDEA
  );
  @Input() followerData;
  @Input() workFlowSelected;
  @Input() selectedStage;
  @Input() isBulkUpdate = false;
  @Input() ids = [];

  @Output() closePopup = new EventEmitter<any>();
  @Output() updatedOpportunity = new EventEmitter();
  @Output() updatedOpportunities = new EventEmitter();
  @Output() updateOpportunities = new EventEmitter();
  @Output() changeWorkflow = new EventEmitter<void>();

  @ViewChild('dpStart', { static: false }) dpStartElement;

  public customMessage = false;
  public actionItems = ACTION_ITEM_ICONS;
  public stages = [];
  public selectedStageAssigneeSettings: any = {};
  public selectedStageActivityVisibilitySettings: any = {};
  public selectedStageAssignmentSettings: any = {};
  public selectedStageNotificationSettings: any = {};
  public selectedStageNotificationSettingsArrays = [];
  public allCustomFields = [];
  public assigneeCount = 0;
  public notifiableUsersCount = 0;
  public notificationUniqueUserCount = 0;
  public stakeHolderCounts;
  public selectedStageDetails;
  public totalExpiryDays;
  public stagesCustomFieldAssignee;
  public stagesAssignee;
  public dueDate = new NgbDate(
    new Date().getUTCFullYear(),
    new Date().getMonth() + 1,
    new Date().getUTCDate()
  );
  public navStart: NgbDateStruct = {
    year: 0,
    month: 0,
    day: 0
  };
  public navEnd: NgbDateStruct = {
    year: 0,
    month: 0,
    day: 0
  };
  public minimumNgbDate: NgbDateStruct = {
    year: new Date().getUTCFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  private stageEntity;

  editAssignees = false;
  editViewers = false;
  editNotifications = false;
  notifySpecificGroups = false;

  private communityId;
  private allGroups = {};
  private allUsers = {};

  private checked = false;
  public noToolAbbreviation = ACTION_ITEM_ABBREVIATIONS.NO_TOOL;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private workflowApiService: WorkflowApiService,
    private opportunityApi: OpportunityApiService,
    private notifier: NotificationService,
    private entityApiService: EntityApiService,
    private groupApi: GroupsApiService,
    public modal: NgbActiveModal,
    private customFieldsApi: CustomFieldApiService
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getFieldsList();
    this.getStageEntity();
    this.getCommunityGroups();
    this.getCommunityUsers();
  }

  getCommunityGroups() {
    this.groupApi.getGroups().subscribe((res) => {
      const groupsRes = get(res, 'response.data');
      this.allGroups = groupBy(groupsRes, 'id');
    });
  }

  getCommunityUsers() {
    this.groupApi.getUsersByCommunityId(this.communityId).subscribe((res) => {
      const userRes = get(res, 'response');
      this.allUsers = groupBy(userRes, 'id');
    });
  }

  ngDoCheck() {
    if (
      !this.checked &&
      ((!this.isBulkUpdate && this.opportunity) || this.isBulkUpdate) &&
      this.selectedStage &&
      this.stageEntity &&
      this.opportunityEntity
    ) {
      this.checked = true;
      this.getPotentialOpportunityMembers();
      this.getStages();
      this.chooseStage(this.selectedStage);
    }
  }

  formatDate(date) {
    return {
      year: moment(date).year(),
      month: moment(date).month(),
      day: moment(date).date()
    };
  }

  getStageEntity() {
    this.stageEntity = this.entityApiService.getEntity(ENTITY_TYPE.STAGE);
  }

  getPotentialOpportunityMembers() {
    this.workflowApiService
      .getPotentialAssigneesCount({
        community: this.ngRedux.getState().userState.currentCommunityId,
        entityType: this.opportunityEntity.id,
        entityObjectId: !this.isBulkUpdate ? this.opportunity.id : null
      })
      .subscribe((res: any) => {
        this.stakeHolderCounts = res.response;
      });
  }

  getStages() {
    this.workflowApiService
      .getAllStages({ workflow: this.workFlowSelected.id, isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
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

  closeModel() {
    this.closePopup.emit(true);
  }

  chooseStage(stage) {
    this.selectedStage = stage;
    this.workflowApiService
      .getWorkflowStageSettings({
        entityType:
          !this.isBulkUpdate &&
          this.opportunity.stage &&
          this.opportunity.stage.id === this.selectedStage.id
            ? this.opportunityEntity.id
            : this.stageEntity.id,
        entityObjectId:
          !this.isBulkUpdate &&
          this.opportunity.stage &&
          this.opportunity.stage.id === this.selectedStage.id
            ? this.opportunity.id
            : this.selectedStage.id
      })
      .subscribe((res: any) => {
        this.formatStageSettingsData(res);
      });
    this.getStageDetails();
  }

  private formatStageSettingsData(res) {
    const data = res.response;
    let alias;

    alias = this.selectedStageAssigneeSettings =
      data.assigneeSettings || INITIAL_STAGE_ASSIGNEE_SETTINGS;

    if (alias.allMembers) {
      alias.communityAdmins = true;
      alias.communityModerators = true;
      alias.communityUsers = true;
    }

    if (alias.groups || alias.individuals) {
      this.convertGroupAndUserArrays(alias);
    }

    alias = this.selectedStageActivityVisibilitySettings =
      data.stageActivityVisibilitySettings ||
      INITIAL_STAGE_ACTIVITY_VISIBILITY_SETTINGS;
    if (alias.groups || alias.individuals) {
      this.convertGroupAndUserArrays(alias);
    }

    alias = this.selectedStageAssignmentSettings =
      data.stageAssignmentSettings || INITIAL_STAGE_ASSIGNMENT_SETTINGS;

    this.totalExpiryDays = alias.stageTimeLimit || 0;
    this.setExpiryDate(this.totalExpiryDays);
    if (alias.groups || alias.individuals) {
      this.convertGroupAndUserArrays(alias);
    }

    alias = this.selectedStageNotificationSettings =
      data.stageNotificationSettings || INITIAL_STAGE_NOTIFICATION_SETTINGS;
    if (alias.groups || alias.individuals) {
      this.convertGroupAndUserArrays(alias);

      this.selectedStageNotificationSettingsArrays = [
        ...alias.groups,
        ...alias.individuals
      ];

      this.notifySpecificGroups =
        this.selectedStageNotificationSettingsArrays.length > 0;
    }

    if (!this.isBulkUpdate) {
      this.updateAssigneeCount();
      this.updateNotifiableUsersCount();
    }
  }

  setExpiryDate(daysToAdd) {
    if (get(this.opportunity, 'stage.id') === get(this.selectedStage, 'id')) {
      this.navEnd = cloneDeep(
        this.formatDate(
          moment(this.opportunity.stageAttachmentDate)
            .add(daysToAdd, 'days')
            .format()
        )
      );
    } else {
      this.navEnd = cloneDeep(
        this.formatDate(moment().add(daysToAdd, 'days').format())
      );
    }
    this.navEnd.month++;
    setTimeout(() => {
      this.dpStartElement.navigateTo(this.navEnd);
    }, 1000);
  }

  private convertGroupAndUserArrays(setting) {
    setting.groups = map(setting.groups, (g) => ({
      type: 'Group',
      id: g.toString()
    }));

    setting.individuals = map(setting.individuals, (u) => ({
      type: 'User',
      id: u.toString()
    }));
  }

  submitStageSettings() {
    let alias;

    alias = this.selectedStageAssigneeSettings;
    this.convertGroupAndUserArraysToFlat(alias);

    alias = this.selectedStageActivityVisibilitySettings;
    this.convertGroupAndUserArraysToFlat(alias);

    this.selectedStageAssignmentSettings.stageTimeLimit = this.totalExpiryDays;
    alias = this.selectedStageAssignmentSettings;
    this.convertGroupAndUserArraysToFlat(alias);

    alias = this.selectedStageNotificationSettings;
    this.convertGroupAndUserArraysToFlat(alias);

    if (!this.isBulkUpdate) {
      this.selectedWorkflow();
    } else {
      this.bulkUpdateStage();
    }
  }

  private convertGroupAndUserArraysToFlat(setting) {
    setting.groups = map(setting.groups, (g) => parseInt(g.id, 10));
    setting.individuals = map(setting.individuals, (u) => parseInt(u.id, 10));
  }

  setGroupsAndIndividualsForNotifications(data) {
    this.selectedStageNotificationSettingsArrays = [];
    this.selectedStageNotificationSettings.groups = [];
    this.selectedStageNotificationSettings.individuals = [];

    forEach(data, (d) => {
      if (d.type === 'Group') {
        this.selectedStageNotificationSettings.groups.push(d);
      } else if (d.type === 'User') {
        this.selectedStageNotificationSettings.individuals.push(d);
      }
      this.selectedStageNotificationSettingsArrays.push(d);
    });

    this.groupApi
      .getUniqueUsersCount({
        users: this.selectedStageNotificationSettings.individuals.map(
          (user) => user.id
        ),
        groups: this.selectedStageNotificationSettings.groups.map(
          (group) => group.id
        ),
        community: this.communityId
      })
      .subscribe((res) => {
        this.notificationUniqueUserCount = get(res, 'response.count');
      });
  }

  bulkUpdateStage() {
    const data: any = {
      ids: this.ids,
      workflow: this.workFlowSelected.id,
      stage: this.selectedStage.id,
      stageNotificationSettings: this.selectedStageNotificationSettings
    };

    if (
      this.selectedStage.actionItem &&
      this.selectedStage.actionItem.abbreviation !== this.noToolAbbreviation
    ) {
      data.assigneeSettings = this.selectedStageAssigneeSettings;
      data.stageActivityVisibilitySettings = this.selectedStageActivityVisibilitySettings;
      data.stageAssignmentSettings = this.selectedStageAssignmentSettings;
    }

    this.updateOpportunities.emit({
      ...data,
      stopNotifications: true
    });
  }

  selectedWorkflow() {
    const opportunity: any = {
      workflow: this.workFlowSelected.id,
      stage: this.selectedStage.id,
      stageNotificationSettings: this.selectedStageNotificationSettings
    };

    if (
      this.selectedStage.actionItem &&
      this.selectedStage.actionItem.abbreviation !== this.noToolAbbreviation
    ) {
      opportunity.assigneeSettings = this.selectedStageAssigneeSettings;
      opportunity.stageActivityVisibilitySettings = this.selectedStageActivityVisibilitySettings;
      opportunity.stageAssignmentSettings = this.selectedStageAssignmentSettings;
    }

    this.opportunityApi
      .updateOpportunity(this.opportunity.id, {
        title: this.opportunity.title,
        stopNotifications: true,
        ...opportunity
      })
      .subscribe(
        () => {
          this.notifier.showInfo('Alerts.StageUpdated', {
            positionClass: 'toast-bottom-right'
          });
          this.updatedOpportunity.emit({ ...this.opportunity, ...opportunity });
          this.modal.close();
        },
        () => this.notifier.showError('Something Went Wrong')
      );
  }

  convertString(str) {
    return startCase(camelCase(str));
  }

  date(date: NgbDate) {
    this.totalExpiryDays =
      moment(this.opportunity.stageAttachmentDate).diff(
        moment().format(`${date.year} ${date.month} ${date.day}`),
        'days'
      ) * -1;
    this.dueDate = date;
    this.selectedStageAssignmentSettings.stageTimeLimit = this.totalExpiryDays;
  }

  onChangeWorkflow() {
    this.changeWorkflow.emit();
  }

  getStageDetails() {
    this.workflowApiService
      .getStagesDetails({
        workflow: this.workFlowSelected.id,
        stage: this.selectedStage.id,
        isDeleted: false
      })
      .subscribe((res: any) => {
        const stageTool = get(
          this.selectedStage,
          'actionItem.abbreviation',
          null
        );
        if (isEqual(stageTool, ACTION_ITEM_ABBREVIATIONS.SCORECARD)) {
          this.selectedStageDetails = get(res, 'response[0].criteria', []);
        } else if (isEqual(stageTool, ACTION_ITEM_ABBREVIATIONS.REFINEMENT)) {
          this.selectedStageDetails = get(res, 'response[0].customFields', []);
        }
      });
  }

  private updateAssigneeCount() {
    if (!isEmpty(this.selectedStageAssigneeSettings)) {
      this.opportunityApi
        .getOppAssigneeCount({
          opportunity: this.opportunity.id,
          assigneeSettings: {
            ...this.selectedStageAssigneeSettings,
            groups: this.selectedStageAssigneeSettings.groups.map((group) =>
              parseInt(group.id, 10)
            ),
            individuals: this.selectedStageAssigneeSettings.individuals.map(
              (user) => parseInt(user.id, 10)
            )
          }
        })
        .subscribe((res) => {
          this.assigneeCount = get(res, 'response.count', 0);
        });
    } else {
      this.assigneeCount = 0;
    }
  }

  private updateNotifiableUsersCount() {
    if (!isEmpty(this.selectedStageAssigneeSettings)) {
      this.opportunityApi
        .getOppStageNotifiableUsersCount({
          opportunity: this.opportunity.id,
          notificationSettings: {
            ...this.selectedStageNotificationSettings,
            groups: this.selectedStageNotificationSettings.groups.map((group) =>
              parseInt(group.id, 10)
            ),
            individuals: this.selectedStageNotificationSettings.individuals.map(
              (user) => parseInt(user.id, 10)
            )
          }
        })
        .subscribe((res) => {
          this.notifiableUsersCount = get(res, 'response.count', 0);
        });
    } else {
      this.notifiableUsersCount = 0;
    }
  }

  updateAssigneeSettings(event) {
    this.selectedStageAssigneeSettings = event;
    if (!this.isBulkUpdate) {
      this.updateAssigneeCount();
    }
  }

  closeEditNotifications() {
    this.editNotifications = !this.editNotifications;
    this.updateNotifiableUsersCount();
  }

  assigneeCustomField() {
    const options = get(
      this.selectedStageAssigneeSettings,
      'customFieldAssignee.options',
      []
    );
    const optionsList = [];
    forEach(options, (value) => {
      let userString = '';
      if (value.users.length) {
        forEach(value.users, (id) => {
          const user = head(this.allUsers[id]);
          if (user) {
            userString += `${user.firstName} ${user.lastName}, `;
          }
        });
      }
      if (value.groups.length) {
        forEach(value.groups, (id) => {
          const group = head(this.allGroups[id]);
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
      fieldId: get(
        this.selectedStageAssigneeSettings,
        'customFieldAssignee.fieldId'
      ),
      options: optionsList
    };
  }

  assigneeDetail() {
    if (
      get(this.selectedStageAssigneeSettings, 'communityAdmins') &&
      get(this.selectedStageAssigneeSettings, 'communityModerators') &&
      get(this.selectedStageAssigneeSettings, 'communityUsers')
    ) {
      this.selectedStageAssigneeSettings.allMembers = true;
    } else {
      this.selectedStageAssigneeSettings.allMembers = false;
    }
    if (isEmpty(this.selectedStageAssigneeSettings)) {
      return `Unassigned`;
    } else {
      if (get(this.selectedStageAssigneeSettings, 'unassigned')) {
        return `Unassigned`;
      } else {
        this.stagesCustomFieldAssignee = this.assigneeCustomField();
        let userString = '';
        const userArray = [];
        if (get(this.selectedStageAssigneeSettings, 'allMembers')) {
          userArray.push(`All Community Members`);
        }
        forEach(
          get(this.selectedStageAssigneeSettings, 'groups', []),
          (value) => {
            const group = head(this.allGroups[value.id]);
            if (group) {
              userArray.push(`${group.name}`);
            }
          }
        );
        forEach(
          get(this.selectedStageAssigneeSettings, 'individuals', []),
          (value) => {
            const user = head(this.allUsers[value.id]);
            if (user) {
              userArray.push(`${user.firstName} ${user.lastName}`);
            }
          }
        );
        if (!get(this.selectedStageAssigneeSettings, 'allMembers')) {
          if (get(this.selectedStageAssigneeSettings, 'communityAdmins')) {
            userArray.push(`Administrators`);
          }
          if (get(this.selectedStageAssigneeSettings, 'communityModerators')) {
            userArray.push(`Moderators`);
          }
          if (get(this.selectedStageAssigneeSettings, 'communityUsers')) {
            userArray.push(`All community users`);
          }
        }

        if (get(this.selectedStageAssigneeSettings, 'opportunityOwners')) {
          userArray.push(`Owners`);
        }
        if (get(this.selectedStageAssigneeSettings, 'opportunityTeams')) {
          userArray.push(`Team members`);
        }
        if (get(this.selectedStageAssigneeSettings, 'opportunitySubmitters')) {
          userArray.push(`Submitters and Co-submitters`);
        }
        forEach(uniq(userArray), (str) => {
          userString += `${str}, `;
        });
        userString = trimEnd(userString, ', ');
        let defaultStr = '';
        if (!this.stagesCustomFieldAssignee.fieldId) {
          defaultStr = 'Unassigned';
        }
        return userString ? `Assigned to ${userString}` : defaultStr;
      }
    }
  }

  notifiableUsersDetail() {
    if (
      isEmpty(this.selectedStageNotificationSettings) ||
      !this.notifiableUsersCount
    ) {
      return `no one.`;
    } else {
      let userString = '';
      forEach(
        get(this.selectedStageNotificationSettings, 'groups', []),
        (value) => {
          const group = head(this.allGroups[value.id]);
          if (group) {
            userString += `${group.name}, `;
          }
        }
      );
      forEach(
        get(this.selectedStageNotificationSettings, 'individuals', []),
        (value) => {
          const user = head(this.allUsers[value.id]);
          if (user) {
            userString += `${user.firstName} ${user.lastName}, `;
          }
        }
      );
      if (get(this.selectedStageNotificationSettings, 'opportunityOwners')) {
        userString += `Owners, `;
      }
      if (get(this.selectedStageNotificationSettings, 'opportunityTeams')) {
        userString += `Team members, `;
      }
      if (
        get(this.selectedStageNotificationSettings, 'opportunitySubmitters')
      ) {
        userString += `Submitters and Co-submitters, `;
      }
      if (get(this.selectedStageNotificationSettings, 'followers')) {
        userString += `Followers, `;
      }
      if (get(this.selectedStageNotificationSettings, 'voters')) {
        userString += `Voters, `;
      }
      userString = trimEnd(userString, ', ');

      return userString || 'no one';
    }
  }
}
