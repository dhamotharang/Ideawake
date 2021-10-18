import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkflowApiService } from 'src/app/services';
import { AppState } from 'src/app/store';
import { forEach, cloneDeep, remove, orderBy } from 'lodash';

@Component({
  selector: 'app-update-audience',
  templateUrl: './update-audience.component.html',
  styleUrls: ['./update-audience.component.scss']
})
export class UpdateAudienceComponent implements OnInit {
  viewDetails = false;
  assignGroups = false;

  selectedGroupsAndUsers = [];
  stages = [];
  groupByFn;
  groupValueFn;
  communityId;

  @Input() targeting;
  @Input() level;
  @Output() updatedSettings = new EventEmitter();

  constructor(
    private ngRedux: NgRedux<AppState>,
    private workflowApiService: WorkflowApiService
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getStages();
  }

  ngOnChanges() {
    if (this.targeting) {
      this.selectedGroupsAndUsers = [
        ...this.targeting.groups,
        ...this.targeting.individuals
      ];

      if (
        this.targeting.groups.length > 0 ||
        this.targeting.individuals.length > 0
      ) {
        this.assignGroups = true;
      }
    }
  }

  toggleGroups() {
    this.assignGroups = !this.assignGroups;
    if (!this.assignGroups) {
      this.targeting.groups = [];
      this.targeting.individuals = [];
      this.emitSettings();
    }
  }

  emitSettings() {
    this.updatedSettings.emit(this.targeting);
  }

  setGroupsAndIndividuals(data) {
    this.targeting.groups = [];
    this.targeting.individuals = [];

    forEach(data, (d) => {
      if (d.type === 'Group') {
        this.targeting.groups.push(d);
      } else if (d.type === 'User') {
        this.targeting.individuals.push(d);
      }
    });

    this.emitSettings();
  }

  getStages() {
    this.workflowApiService
      .getAllStages({ isDeleted: false })
      .subscribe((res: any) => {
        this.stages = res.response;
        this.stages.push({
          id: 0,
          title: 'All Stages',
          workflowId: 0,
          orderNumber: 0
        });
        this.stages = orderBy(this.stages, ['orderNumber'], ['asc']);
        this.groupByFn = (item) => item.workflowId;
        this.groupValueFn = (_: string, children: any[]) => ({
          name: children[0].workflow ? children[0].workflow.title : null
        });
        this.emitOpenItemData();
        this.emitPastItemData();
      });
  }

  toggleOpenAction() {
    this.targeting.actionItemRelated.allOpenItemsStages = !this.targeting
      .actionItemRelated.allOpenItemsStages;
  }

  emitOpenItemData() {
    if (this.targeting.actionItemRelated.openItemsStages.length > 1) {
      remove(
        this.targeting.actionItemRelated.openItemsStages,
        (value) => value == 0
      );
      this.targeting.actionItemRelated.openItemsStages = cloneDeep(
        this.targeting.actionItemRelated.openItemsStages
      );
    } else if (this.targeting.actionItemRelated.openItemsStages.length == 0) {
      this.targeting.actionItemRelated.openItemsStages.push(0);
      this.targeting.actionItemRelated.openItemsStages = cloneDeep(
        this.targeting.actionItemRelated.openItemsStages
      );
    }
  }

  togglePastAction() {
    this.targeting.actionItemRelated.allPastDueStages = !this.targeting
      .actionItemRelated.allPastDueStages;
  }

  emitPastItemData() {
    if (this.targeting.actionItemRelated.openPastDueStages.length > 1) {
      remove(
        this.targeting.actionItemRelated.openPastDueStages,
        (value) => value == 0
      );
      this.targeting.actionItemRelated.openPastDueStages = cloneDeep(
        this.targeting.actionItemRelated.openPastDueStages
      );
    } else if (this.targeting.actionItemRelated.openPastDueStages.length == 0) {
      this.targeting.actionItemRelated.openPastDueStages.push(0);
      this.targeting.actionItemRelated.openPastDueStages = cloneDeep(
        this.targeting.actionItemRelated.openPastDueStages
      );
    }
  }
}
