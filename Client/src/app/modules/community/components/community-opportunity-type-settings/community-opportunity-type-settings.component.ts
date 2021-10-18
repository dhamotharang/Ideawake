import { capitalize, first, map, get, filter, find } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import {
  CommunityApi,
  CustomFieldApiService,
  EntityApiService,
  NotificationService,
  OpportunityApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { ENTITY_TYPE, FIELD_INTEGRATION } from '../../../../utils';

@Component({
  selector: 'app-community-opportunity-type-settings',
  templateUrl: './community-opportunity-type-settings.component.html',
  styleUrls: ['./community-opportunity-type-settings.component.scss']
})
export class CommunityOpportunityTypeSettingsComponent implements OnInit {
  @Output() newAddition = new EventEmitter();

  opportunity;
  existingOppTypes = [];
  descriptionVisibility;
  selectedIcon;
  hideError;
  isDisabled = false;
  toCapital;
  postingExperiences;
  postingExperience;
  opportunityTypeFields;
  selectedCustomFields;
  opportunityTypeEntity;
  updateList = false;
  workflowSelected;
  visibilityAndPermissionSettings;

  constructor(
    private opportunityApi: OpportunityApiService,
    private communityApi: CommunityApi,
    private customFieldApi: CustomFieldApiService,
    private notifier: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private entityApi: EntityApiService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.opportunity = {
      name: '',
      description: '',
      titlePlaceholder: '',
      descPlaceholder: '',
      color: '#1AB394',
      icon: 'lightbulb'
    };
    this.descriptionVisibility = false;
    this.selectedIcon = this.opportunity.icon;
    this.hideError = true;
    this.toCapital = capitalize;
  }

  ngOnInit() {
    this.opportunityTypeEntity = this.entityApi.getEntity(
      ENTITY_TYPE.OPPORTUNITY_TYPE
    );
    this.route.params.subscribe((params: Params) => {
      this.opportunity.id = params.id;
      this.getOpportunity();
      this.getCustomFields();
    });
    this.getPostingExperiences();
  }

  getOpportunityTypesAll() {
    this.opportunityApi
      .getOpportunityType({
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.existingOppTypes = filter(
          res.response,
          (o) => o.id !== this.opportunity.id
        );
      });
  }

  editOpportunity() {
    if (this.opportunity.name === '') {
      this.hideError = false;
      return;
    }

    this.opportunity.workflow = get(this.workflowSelected, 'id', null);
    this.isDisabled = true;

    this.communityApi.editOpportunityType(this.opportunity).subscribe(
      (res: any) => {
        this.newAddition.emit(res.response);
        this.isDisabled = false;
        this.notifier.showSuccess('Alerts.OpportunityTypeEditedSuccess', {
          positionClass: 'toast-bottom-center'
        });
        this.router.navigateByUrl('/community/container');
      },
      (err) => {
        this.isDisabled = false;
        if (err.error.statusCode == 409) {
          this.notifier.showError('Alerts.OpportunityTypeNameExists');
          return;
        }
        this.notifier.showError('Alerts.SomethingWrong');
      }
    );
    this.saveVisibilityAndPermissions();
  }

  getOpportunity() {
    this.communityApi.getOpportunityById(this.opportunity.id).subscribe(
      (res: any) => {
        this.opportunity = first(res.response);
        this.getOpportunityTypesAll();
      },
      () => this.router.navigateByUrl('/error/404')
    );
  }

  selectOppType(event, oppType) {
    if (event.target.checked) {
      if (get(this.opportunity, 'duplicatableTypes')) {
        this.opportunity.duplicatableTypes.push(oppType.id);
      } else {
        this.opportunity.duplicatableTypes = [oppType.id];
      }
    } else {
      this.opportunity.duplicatableTypes = filter(
        this.opportunity.duplicatableTypes,
        (value) => value !== oppType.id
      );
    }
  }

  selectLinkageOppType(event, oppType) {
    if (event.target.checked) {
      if (get(this.opportunity, 'linkableTypes')) {
        this.opportunity.linkableTypes.push(oppType.id);
      } else {
        this.opportunity.linkableTypes = [oppType.id];
      }
    } else {
      this.opportunity.linkableTypes = filter(
        this.opportunity.linkableTypes,
        (value) => value !== oppType.id
      );
    }
  }

  isSelectedOppType(oppType) {
    const found = find(
      this.opportunity.duplicatableTypes,
      (value) => value === oppType.id
    );
    return found ? true : false;
  }

  isSelectedLinkageOppType(oppType) {
    const found = find(
      this.opportunity.linkableTypes,
      (value) => value === oppType.id
    );
    return found ? true : false;
  }

  getPostingExperiences() {
    this.communityApi
      .getOpportunityTypePostingExperience()
      .subscribe((res: any) => {
        this.postingExperiences = res.response;
        this.postingExperience = this.postingExperiences[0].id;
      });
  }

  mapOpportunityTypeFields(fields) {
    this.opportunityTypeFields = map(fields, (field) => ({
      opportunityType: parseInt(this.opportunity.id, 10),
      field: field.id,
      order: field.order,
      visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM,
      community: this.ngRedux.getState().userState.currentCommunityId
    }));

    this.opportunity = {
      ...this.opportunity,
      opportunityTypeFields: this.opportunityTypeFields
    };
  }

  getCustomFields() {
    this.customFieldApi
      .getAttachedFields({
        entityObjectId: this.opportunity.id,
        entityType: this.opportunityTypeEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
      })
      .subscribe((res: any) => {
        this.selectedCustomFields = map(res.response, (field) => ({
          ...field.field,
          order: field.order
        }));
      });
  }

  toggleSpecificMembersStageActivity() {}

  newFieldCreated() {
    this.updateList = true;
    setTimeout(() => {
      this.updateList = false;
    }, 1000);
  }

  saveVisibilityAndPermissions() {
    this.communityApi
      .editOpportunityVisibilityAndPermissionSettings(
        this.opportunity.id,
        this.visibilityAndPermissionSettings
      )
      .subscribe(
        () => {},
        (err) => console.log(err)
      );
  }
}
