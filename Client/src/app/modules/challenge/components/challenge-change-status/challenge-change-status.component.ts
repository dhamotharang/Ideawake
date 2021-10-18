import { cloneDeep, first, get } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ChallengesApiService,
  EntityApiService,
  NotificationService,
  RoleAndPermissionsApi
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  CHALLENGE_STATUSES,
  ChallengeSettings,
  CLOSED_CHALLENGE_DEFAULTS,
  ENTITY_TYPE,
  EVALUATION_CHALLENGE_DEFAULTS,
  OPEN_CHALLENGE_DEFAULTS
} from '../../../../utils';

@Component({
  selector: 'app-challenge-change-status',
  templateUrl: './challenge-change-status.component.html',
  styleUrls: ['./challenge-change-status.component.scss']
})
export class ChallengeChangeStatusComponent implements OnInit {
  @Input() challenge;
  @Output() update = new EventEmitter<void>();

  public challengeStatuses = CHALLENGE_STATUSES;
  public entityExperienceSetting: ChallengeSettings;
  private backupEntityExperienceSetting: ChallengeSettings;
  public submissionVisibilitySetting;
  public submissionsObj;
  public alertMessage = '';
  public defaultSortFilter = {
    newest: 'Newest',
    random: 'Random',
    most_votes: 'Most Votes',
    most_comments: 'Most Comments'
  };

  public selectedStatus;
  private backupSelectedStatus;

  private entityType;

  disabledSaveButton = false;

  constructor(
    private permissionsApi: RoleAndPermissionsApi,
    private entityApi: EntityApiService,
    private ngRedux: NgRedux<AppState>,
    public modal: NgbActiveModal,
    private challengeApi: ChallengesApiService,
    private notifier: NotificationService
  ) {
    this.entityExperienceSetting = OPEN_CHALLENGE_DEFAULTS;
  }

  async ngOnInit() {
    this.selectedStatus = get(
      this.challenge,
      'status',
      first(Object.keys(CHALLENGE_STATUSES))
    );
    this.alertMessage = this.challenge.alertMessage;
    this.changeStatus(this.selectedStatus);
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.CHALLENGE);
    this.getChallengeSettings();
    this.getVisibilitySettings();
  }

  getChallengeSettings() {
    this.permissionsApi
      .getPermissionsByEntityTypeAndObjectId({
        entityType: this.entityType.id,
        entityObjectId: this.challenge.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.entityExperienceSetting = get(
          res,
          'response[0]',
          OPEN_CHALLENGE_DEFAULTS
        );
        this.backupEntityExperienceSetting = cloneDeep(
          this.entityExperienceSetting
        );
        this.entityExperienceSetting.defaultSort =
          this.entityExperienceSetting.defaultSort || 'newest';
        this.backupSelectedStatus = this.selectedStatus;
      });
  }

  saveSettings() {
    this.disabledSaveButton = true;
    this.challengeApi
      .updateStatusSettings(this.challenge.id, {
        status: this.selectedStatus,
        entityExperienceSetting: {
          ...this.entityExperienceSetting,
          visibility: {}
        },
        alertMessage: this.alertMessage,
        submissionVisibilitySetting: this.submissionsObj
      })
      .subscribe(
        () => {
          this.notifier.showInfo('Challenge status settings updated', {
            positionClass: 'toast-bottom-right'
          });
          this.update.emit();
          this.modal.close();
        },
        () => {
          this.notifier.showError('Something Occurred');
          this.disabledSaveButton = false;
        }
      );
  }

  changeDefaults() {
    if (this.selectedStatus === this.backupSelectedStatus) {
      return cloneDeep(this.backupEntityExperienceSetting);
    }
    switch (this.selectedStatus) {
      case 'open':
        return OPEN_CHALLENGE_DEFAULTS;
      case 'evaluation':
        return EVALUATION_CHALLENGE_DEFAULTS;
      case 'closed':
        return CLOSED_CHALLENGE_DEFAULTS;
    }
  }

  getVisibilitySettings() {
    this.entityApi
      .getEntityVisibilitySetting({
        entityType: this.entityType.id,
        entityObjectId: this.challenge.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.submissionVisibilitySetting = first(res.response);
      });
  }

  close() {
    this.modal.close();
  }

  changeStatus(value) {
    this.alertMessage = CHALLENGE_STATUSES[value].defaultMessage;
  }
}
