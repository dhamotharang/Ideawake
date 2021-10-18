import { forEach, get, isEmpty, map } from 'lodash';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { WorkflowApiService } from '../../../../services';
import { STAGE_NOTIFICATION_SETTINGS } from '../../../../utils';

@Component({
  selector: 'app-workflow-stage-settings',
  templateUrl: './workflow-stage-settings.component.html',
  styleUrls: ['./workflow-stage-settings.component.scss']
})
export class WorkflowStageSettingsComponent implements OnInit, OnChanges {
  @Input() settingsData;
  @Output() settings = new EventEmitter<any>();
  beforeDismiss: () => boolean | Promise<boolean>;
  closeResult: string;
  individualUsers = [];
  notificationSetting;
  notifySpecificGroups = false;
  sendEmailNotifications = false;
  selectedNotificationSettings = {
    groups: [],
    individuals: [],
    opportunityOwners: false,
    opportunityTeams: false,
    opportunitySubmitters: true,
    followers: false,
    voters: false,
    message: 'Thanks for taking the time to share or support this idea, its stage has been updated.',
    sendEmail: true
  };

  toggleEmailNotifications() {
    this.sendEmailNotifications = !this.sendEmailNotifications;
  }

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  ngOnChanges() {
    if (!isEmpty(this.settingsData)) {
      this.selectedNotificationSettings = this.settingsData;
      this.checkIndividualsAllow();
      this.loadUsersAndGroups();
    }
    this.emitValue();
  }

  loadUsersAndGroups() {
    map(get(this.settingsData, 'individuals', []), (value) => {
      this.individualUsers.push({
        id: value,
        type: 'User'
      });
    });
    map(get(this.settingsData, 'groups', []), (value) => {
      this.individualUsers.push({
        id: value,
        type: 'Group'
      });
    });
  }

  checkIndividualsAllow() {
    const groups = get(this.settingsData, 'groups', []);
    const individuals = get(this.settingsData, 'individuals', []);
    if (individuals.length || groups.length) {
      this.notifySpecificGroups = true;
    }
  }

  emitValue() {
    this.settings.emit(this.selectedNotificationSettings);
  }

  getIndividuals(event) {
    let notifiableIndividuals = [];
    let notifiableGroups = [];
    forEach(event, (value) => {
      if (value.type == 'User') {
        notifiableIndividuals.push(value.id);
      } else if (value.type == 'Group') {
        notifiableGroups.push(value.id);
      }
    });
    this.selectedNotificationSettings.individuals = notifiableIndividuals;
    this.selectedNotificationSettings.groups = notifiableGroups;
    this.emitValue();
  }

  open(content) {
    this.modalService
      .open(content, {
        windowClass: 'custom-field-modal',
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

  getDismissReason(reason: any) {
    throw new Error('Method not implemented.');
  }
}
