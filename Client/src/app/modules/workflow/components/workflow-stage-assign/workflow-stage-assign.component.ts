import { find, forEach, get, isEmpty, map, merge } from 'lodash';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  ACTION_ITEM_INFO,
  StageEmailReminderEnum,
  TOOLS_COMPLETION_SETTINGS
} from '../../../../utils';

@Component({
  selector: 'app-workflow-stage-assign',
  templateUrl: './workflow-stage-assign.component.html',
  styleUrls: ['./workflow-stage-assign.component.scss']
})
export class WorkflowStageAssignComponent implements OnChanges {
  @Input() potentialCounts;
  @Input() modelChange;
  @Input() stageInfo;
  @Output() dataSet = new EventEmitter<any>();
  constructor(private activatedRoute: ActivatedRoute) {}

  defaultAssignee = {
    unassigned: true,
    allMembers: false,
    groups: [],
    individuals: [],
    communityAdmins: false,
    communityModerators: false,
    communityUsers: false,
    opportunityOwners: false,
    opportunityTeams: false,
    opportunitySubmitters: false
  };

  defaultVisibility = {
    unassigned: true,
    allMembers: false,
    groups: [],
    individuals: [],
    customFieldAssignee: [],
    communityAdmins: false,
    communityModerators: false,
    communityUsers: false,
    opportunityOwners: false,
    opportunityTeams: false,
    opportunitySubmitters: false
  };

  defaultAssignmentSetting = {
    title: null,
    instructions: null,
    completionTimeLimit: 30,
    emailNotification: false,
    emailReminder: StageEmailReminderEnum[0].key,
    stageComments: true,
    allAssigneesCompleted: true,
    minimumResponses: 0,
    stageTimeLimit: 7
  };

  assigneeSettings = this.defaultAssignee;
  stageActivityVisibilitySettings = this.defaultVisibility;
  stageAssignmentSettings = this.defaultAssignmentSetting;
  visibilityGroups = false;
  show = false;
  showInstructions = false;
  specificMembers = false;
  specificMembersStageVisibility = false;
  dueDate = true;
  timeLimit = true;
  remainderTypes = StageEmailReminderEnum;
  individualVisibilityUsers = [];
  tools = get(this.activatedRoute.snapshot.data.actionItems, 'response');
  editSettled = false;
  assignByCustomFields = false;
  completionSettings = TOOLS_COMPLETION_SETTINGS.else;
  ngOnChanges() {
    const selectedTool = find(this.tools, ['id', this.modelChange.actionItem]);
    if (selectedTool) {
      this.completionSettings = get(
        TOOLS_COMPLETION_SETTINGS,
        selectedTool.abbreviation,
        TOOLS_COMPLETION_SETTINGS.else
      );
      if (!this.stageAssignmentSettings.title) {
        this.stageAssignmentSettings.title =
          ACTION_ITEM_INFO[selectedTool.abbreviation].title;
      }
      if (!this.stageAssignmentSettings.instructions) {
        this.stageAssignmentSettings.instructions =
          ACTION_ITEM_INFO[selectedTool.abbreviation].instruction;
      }
    }

    if (!isEmpty(this.stageInfo) && !this.editSettled) {
      this.loadEditValues();
    }
    this.emitValues();
  }

  loadEditValues() {
    if (get(this.stageInfo, 'assigneeSettings')) {
      this.assigneeSettings = this.stageInfo.assigneeSettings;
    }
    if (get(this.stageInfo, 'stageAssignmentSettings')) {
      this.stageAssignmentSettings = this.stageInfo.stageAssignmentSettings;
    }
    if (get(this.stageInfo, 'stageActivityVisibilitySettings')) {
      this.stageActivityVisibilitySettings = this.stageInfo.stageActivityVisibilitySettings;
    }
    this.loadUsersAndGroups();
    if (
      !get(this.assigneeSettings, 'unassigned', false) &&
      !get(this.assigneeSettings, 'allMembers', false)
    ) {
      this.specificMembers = true;
    }
    if (
      !get(this.stageActivityVisibilitySettings, 'unassigned', false) &&
      !get(this.stageActivityVisibilitySettings, 'allMembers', false)
    ) {
      this.specificMembersStageVisibility = true;
    }

    this.timeLimit = this.stageAssignmentSettings.completionTimeLimit > 0;
    this.dueDate = this.stageAssignmentSettings.stageTimeLimit > 0;

    this.editSettled = true;
    if (
      get(this.stageActivityVisibilitySettings, 'customFieldAssignee.fieldId')
    ) {
      this.assignByCustomFields = true;
    }
  }

  assigneeSpecificMembersInfo(event) {
    this.assigneeSettings = merge(this.assigneeSettings, event);
    this.emitValues();
  }

  customFieldAssignee(event) {
    this.stageActivityVisibilitySettings = {
      ...this.stageActivityVisibilitySettings,
      ...event
    };
    this.emitValues();
  }

  toggleShowActionItem() {
    this.show = !this.show;
  }

  toggleShowStageInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleCompletionSettings(button) {
    if (button === 'minimum') {
      this.stageAssignmentSettings.allAssigneesCompleted = false;
      this.stageAssignmentSettings.minimumResponses = 0;
    } else if (button === 'all') {
      this.stageAssignmentSettings.allAssigneesCompleted = true;
      this.stageAssignmentSettings.minimumResponses = 0;
    }
    this.emitValues();
  }

  toggleSpecificMembers(button) {
    this.assigneeSettings.unassigned = false;
    this.assigneeSettings.allMembers = false;
    this.specificMembers = false;
    if (button !== 'specific') {
      this.assigneeSettings = this.defaultAssignee;
    }
    if (button === 'unassigned') {
      this.assigneeSettings.unassigned = true;
    } else if (button === 'allMembers') {
      this.assigneeSettings.allMembers = true;
    } else if (button === 'specific') {
      this.specificMembers = true;
    }
    this.emitValues();
  }

  toggleSpecificMembersStageActivity(button) {
    this.stageActivityVisibilitySettings.unassigned = false;
    this.stageActivityVisibilitySettings.allMembers = false;
    this.specificMembersStageVisibility = false;
    if (button !== 'specific') {
      this.stageActivityVisibilitySettings = this.defaultVisibility;
    }
    if (button === 'unassigned') {
      this.stageActivityVisibilitySettings.unassigned = true;
    } else if (button === 'allMembers') {
      this.stageActivityVisibilitySettings.allMembers = true;
    } else if (button === 'specific') {
      this.specificMembersStageVisibility = true;
    }
    this.emitValues();
  }

  toggleDueDate() {
    this.dueDate = !this.dueDate;
    this.stageAssignmentSettings.stageTimeLimit = null;
    this.emitValues();
  }

  toggleTimeLimit() {
    this.timeLimit = !this.timeLimit;
    this.stageAssignmentSettings.completionTimeLimit = null;
    this.emitValues();
  }

  getIndividuals(event) {
    const individuals = [];
    const groups = [];
    forEach(event, (value) => {
      if (value.type === 'User') {
        individuals.push(value.id);
      } else if (value.type === 'Group') {
        groups.push(value.id);
      }
    });
    this.stageActivityVisibilitySettings.individuals = individuals;
    this.stageActivityVisibilitySettings.groups = groups;
    this.emitValues();
  }

  positiveNumber(event) {
    return event.charCode === 8 || event.charCode === 0 || event.charCode === 13
      ? null
      : event.charCode >= 48 && event.charCode <= 57;
  }

  emitValues() {
    if (!this.assignByCustomFields) {
      this.stageActivityVisibilitySettings.customFieldAssignee = null;
    }
    this.dataSet.emit({
      assigneeSettings: this.assigneeSettings,
      stageActivityVisibilitySettings: this.stageActivityVisibilitySettings,
      stageAssignmentSettings: this.stageAssignmentSettings
    });
  }

  loadUsersAndGroups() {
    map(
      get(this.stageActivityVisibilitySettings, 'individuals', []),
      (value) => {
        this.individualVisibilityUsers.push({
          id: value,
          type: 'User'
        });
      }
    );
    map(get(this.stageActivityVisibilitySettings, 'groups', []), (value) => {
      this.individualVisibilityUsers.push({
        id: value,
        type: 'Group'
      });
    });
    if (this.individualVisibilityUsers.length) {
      this.visibilityGroups = true;
    }
  }
}
