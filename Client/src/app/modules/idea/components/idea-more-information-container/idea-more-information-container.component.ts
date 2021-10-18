import { Component, Input, OnInit } from '@angular/core';
import {
  CustomFieldApiService,
  EntityApiService,
  OpportunityApiService,
  RoleAndPermissionsApi
} from '../../../../services';
import { ENTITY_TYPE, FIELD_INTEGRATION } from '../../../../utils';
import { find, first, map, remove } from 'lodash';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'app-idea-more-information-container',
  templateUrl: './idea-more-information-container.component.html',
  styleUrls: ['./idea-more-information-container.component.scss']
})
export class IdeaMoreInformationContainerComponent implements OnInit {
  @Input() idea;
  @Input() stageAssignees;
  @Input() stageStats;
  @Input() userOpportunityPermissions;
  @Input() stageAssignmentSettings;
  seeInstructions = false;
  isLoading = true;
  entityType;
  entityTypeIdea;
  followersData;
  customFields;
  stageEntity;
  stageFieldsData;
  permissionsData;

  constructor(
    private customFieldApi: CustomFieldApiService,
    private entityApi: EntityApiService,
    private ngRedux: NgRedux<AppState>,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private opportunityApi: OpportunityApiService
  ) {}

  showTextEdit = false;

  toggleEditText() {
    this.showTextEdit = !this.showTextEdit;
  }

  ngOnInit() {
    this.getOpportunityEntity();
    this.getExperienceSettings();
    if (this.idea.stage) {
      this.isLoading = false;
      this.stageEntity = this.getStageEntity();
      this.getCustomFieldsWithData();
      this.getStageCompletionData();
    }
  }

  getOpportunityEntity() {
    this.entityType = this.entityApi.getEntity(ENTITY_TYPE.OPPORTUNITY_TYPE);
    this.entityTypeIdea = this.entityApi.getEntity(ENTITY_TYPE.IDEA);
  }

  getStageEntity() {
    return this.entityApi.getEntity(ENTITY_TYPE.STAGE);
  }

  private getExperienceSettings() {
    const permissionParams = {
      entityType: this.entityTypeIdea.id,
      entityObjectId: this.idea.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.roleAndPermissionsApi
      .getPermissionsByEntityTypeAndObjectId(permissionParams)
      .subscribe((res: any) => {
        this.permissionsData = first(res.response);
      });
  }

  private getCustomFieldsWithData() {
    this.customFieldApi
      .getAttachedFieldsWithData({
        entityObjectId: this.idea.stage.id,
        entityType: this.stageEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.REFINEMENT_TAB,
        opportunity: this.idea.id
      })
      .subscribe(async (res: any) => {
        if (res.response.length) {
          const customFieldIds = map(res.response, (field) => field.field.id);
          /* Needs to be fixed from backend */
          /* Code needs to be uncommented once permissions are fixed from backend */
          // const userCustomFieldPermissions = await this.getCustomFieldPermissions(
          //   customFieldIds
          // );
          this.customFields = map(res.response, (field) => ({
            ...field.field,
            opportunityDataId:
              field.field.opportunityFieldData &&
              field.field.opportunityFieldData.length
                ? field.field.opportunityFieldData[0].id
                : null,
            /* Code needs to be uncommented once permissions are fixed from backend */
            // permissions: find(
            //   userCustomFieldPermissions,
            //   (p) => p.customFieldId === field.field.id
            // ).permissions
            /* Temporary hot fix until permissions are fixed from backend */
            permissions: {
              editCustomFieldData: true,
              viewCustomFieldData: true
            }
          }));
        } else {
          this.customFields = [];
        }
        this.isLoading = false;
      });
  }

  private getCustomFieldPermissions(customFieldIds: Array<any>) {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCustomFields(this.idea.id, customFieldIds)
      .toPromise()
      .then((res: any) => res.response);
  }

  updateSummaryCustomFieldData(fieldData: object) {
    this.stageFieldsData = fieldData;
    remove(this.stageFieldsData, (d) => !d.field);

    const params = {
      opportunity: this.idea.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    const data = {
      data: this.stageFieldsData
    };

    this.customFieldApi.updateCustomFieldsData(params, data).subscribe(
      () => {
        this.getStageAssignees();
        this.getStageCompletionData();
        this.getCustomFieldsWithData();
      },
      (err) => console.log(err)
    );
  }

  getStageAssignees() {
    this.opportunityApi
      .getCurrentStageAssignees(this.idea.id)
      .subscribe((res: any) => {
        this.stageAssignees = res.response;
      });
  }

  private getStageCompletionData() {
    this.opportunityApi
      .getStageCompletionStats(this.idea.id)
      .subscribe((res: any) => {
        this.stageStats = res.response;
      });
  }
}
