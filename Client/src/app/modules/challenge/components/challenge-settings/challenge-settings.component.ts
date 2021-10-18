import { first, get, map, upperFirst, cloneDeep, set } from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  ChallengesApiService,
  CommunityApi,
  CustomFieldApiService,
  EntityApiService,
  NotificationService,
  PrizeApiService,
  RoleAndPermissionsApi
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  ChallengeSettings,
  ENTITY_TYPE,
  FIELD_INTEGRATION
} from '../../../../utils';

@Component({
  selector: 'app-challenge-settings',
  templateUrl: './challenge-settings.component.html',
  styleUrls: ['./challenge-settings.component.scss']
})
export class ChallengeSettingsComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() challenge;
  @Input() modal = false;

  @Output() switchTab = new EventEmitter<any>();
  @Output() data = new EventEmitter<any>();

  private sub: Subscription;
  public challengeId = this.activatedRoute.snapshot.params.id;
  public challengeSettings: ChallengeSettings;
  public submissionVisibilitySetting;
  public submissionsObj;

  public outputData;
  public participants = [];
  public prizes = [];
  public userChallengePermissions;
  public toggleCollaboration = true;
  public toggleSubmissionForm = true;
  public toggleIntegrations = false;
  public customizePlaceholders = false;
  public togglePrizes = true;
  public selectGroups = false;
  public challengeTypeEntity;
  public updateList = false;
  public opportunityTypeFields;
  public selectedCustomFields;
  public opportunityTypeEntity;
  public opportunityType;
  public customizePlaceholderText = false;

  anonymousSettingsKeys = [
    'allowAnonymousIdea',
    'allowAnonymousComment',
    'defaultAnonymousSubmissions',
    'defaultAnonymousComments',
    'defaultAnonymousVotes'
  ];

  public currentUser = this.ngRedux.getState().userState;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private challengeApi: ChallengesApiService,
    private notifier: NotificationService,
    private modalService: NgbModal,
    private prizeApiService: PrizeApiService,
    private permissionsApi: RoleAndPermissionsApi,
    private entityApiService: EntityApiService,
    private customFieldApi: CustomFieldApiService,
    private communityApi: CommunityApi
  ) {
    this.challengeSettings = {
      visibility: {},
      allowVoting: true,
      allowCommenting: true,
      allowSharing: true,
      challengeLeaderboard: true,
      allowAnonymousIdea: true,
      allowAnonymousComment: true,
      defaultAnonymousSubmissions: false,
      defaultAnonymousComments: false
    } as ChallengeSettings;
  }

  async ngOnInit() {
    if (this.challengeId) {
      this.getChallengePrizes({
        challenge: this.challengeId,
        isDeleted: false
      });
      this.challengeTypeEntity = this.entityApiService.getEntity(
        ENTITY_TYPE.CHALLENGE
      );
      this.getChallengeAccessPermissions();
      this.getChallengeExperienceSettings();
      this.getVisibilitySettings();
      this.opportunityTypeEntity = this.entityApiService.getEntity(
        ENTITY_TYPE.OPPORTUNITY_TYPE
      );
      this.opportunityType = this.challenge.opportunityType.id;
      this.getCustomFields();
    } else {
      this.userChallengePermissions = this.ngRedux.getState().userState.userCommunityPermissions;
      set(this.challenge, 'enableDupDetection', true);
    }
    if (
      this.challenge &&
      this.challenge.opportunityType &&
      !isNaN(this.challenge.opportunityType) &&
      !get(this.challenge, 'id')
    ) {
      this.communityApi
        .getOpportunityById(this.challenge.opportunityType)
        .subscribe((res: any) => {
          const opportunityTypeData = first(res.response);
          this.setPlaceHolderValues(opportunityTypeData);
        });
    }
  }

  getChallengeExperienceSettings() {
    this.permissionsApi
      .getPermissionsByEntityTypeAndObjectId({
        entityType: this.challengeTypeEntity.id,
        entityObjectId: this.challengeId,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res1: any) => {
        this.challengeSettings = first(res1.response);
      });
  }
  setPlaceHolderValues(postType) {
    if (!this.challenge.postTitlePlaceholder) {
      this.challenge.postTitlePlaceholder = postType.titlePlaceholder || '';
    }
    if (!this.challenge.postDescPlaceholder) {
      this.challenge.postDescPlaceholder = postType.descPlaceholder || '';
    }
  }
  getVisibilitySettings() {
    this.entityApiService
      .getEntityVisibilitySetting({
        entityType: this.challengeTypeEntity.id,
        entityObjectId: this.challengeId,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.submissionVisibilitySetting = first(res.response);
      });
  }

  ngOnChanges() {
    this.participants = map(
      get(this.challenge, 'challengeParticipant', []),
      (value) => ({
        id: value.participantId,
        type: value.type
      })
    );
    this.outputData = {
      challengeParticipant: get(this.challenge, 'challengeParticipant', []),
      moderators: get(this.challenge, 'moderators', []),
      sponsors: get(this.challenge, 'sponsors', [])
    };
    this.opportunityTypeEntity = this.entityApiService.getEntity(
      ENTITY_TYPE.OPPORTUNITY_TYPE
    );
    this.opportunityType = this.activatedRoute.snapshot.queryParams.opportunityType;
    this.getCustomFields();
  }

  getChallengeAccessPermissions() {
    this.permissionsApi
      .getUserPermissionsInChallenge(this.challengeId)
      .subscribe((res: any) => {
        this.userChallengePermissions = res.response;
      });
  }

  changeTab(tabId) {
    this.switchTab.emit({ tab: tabId });
  }

  getChallengePrizes(params?) {
    this.prizeApiService.getPrizes(params).subscribe((res: any) => {
      this.prizes = res.response;
    });
  }

  setSettings() {
    this.data.emit({
      settings: this.challengeSettings,
      prizes: this.prizes,
      submissionVisibilitySetting: this.submissionsObj,
      subFormFields: this.opportunityTypeFields
    });
  }

  capitalizeFirstLetter(word) {
    return upperFirst(word);
  }

  updateSettings() {
    const tempData = cloneDeep(this.challenge);
    tempData.opportunityType = tempData.opportunityType.id;
    tempData.entityExperienceSetting = this.challengeSettings;
    tempData.submissionVisibilitySetting = this.submissionsObj;
    tempData.prizes = map(this.prizes, (value) => {
      delete value.challengeId;
      delete value.communityId;
      delete value.categoryId;
      delete value.createdAt;
      delete value.updatedAt;
      return value;
    });
    if (this.opportunityTypeFields) {
      tempData.subFormFields = this.opportunityTypeFields;
    }

    tempData.workflow = this.challenge.workflowId || undefined;
    this.challengeApi
      .updateChallenge(this.challengeId, tempData)
      .subscribe(() => {
        this.notifier.showInfo('Updated Successfully!');
        this.data.emit(this.challengeSettings);
        this.close();
      });
  }

  close() {
    this.modalService.dismissAll();
  }

  newPrize(data) {
    this.prizes.push(data);
  }

  updatePrize(prizeList) {
    this.prizes = prizeList;
  }

  getCustomFields() {
    this.customFieldApi
      .getAttachedFields({
        entityObjectId: this.challengeId
          ? this.challengeId
          : this.opportunityType,
        entityType: this.challengeId
          ? this.challengeTypeEntity.id
          : this.opportunityTypeEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
      })
      .subscribe((res: any) => {
        this.selectedCustomFields = map(res.response, (field) => ({
          ...field.field,
          order: field.order
        }));

        if (!this.challengeId) {
          this.opportunityTypeFields = map(res.response, (fieldData) => ({
            field: fieldData.field.id,
            order: fieldData.order,
            visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
          }));
        }
      });
  }

  mapOpportunityTypeFields(fields) {
    this.opportunityTypeFields = map(fields, (fieldData) => ({
      field: fieldData.id,
      order: fieldData.order,
      visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
    }));
  }

  newFieldCreated() {
    this.updateList = true;
    setTimeout(() => {
      this.updateList = false;
    }, 1000);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
