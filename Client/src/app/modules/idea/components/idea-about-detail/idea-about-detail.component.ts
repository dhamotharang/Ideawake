import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  CustomFieldApiService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  UtilService
} from '../../../../services';
import { find, map, remove } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-idea-about-detail',
  templateUrl: './idea-about-detail.component.html'
})
export class IdeaAboutComponent implements OnChanges, OnDestroy {
  @Input() idea;
  @Input() tagsData;
  @Input() userOpportunityPermissions;
  private sub: Subscription;
  public hide = false;
  public customFields;
  public descriptionHtml = '';
  public evaluationCriteria;
  public stageScore;
  public opportunityScore;
  public files;
  constructor(
    private ngRedux: NgRedux<AppState>,
    private opportunityApi: OpportunityApiService,
    private customFieldApi: CustomFieldApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    public util: UtilService
  ) {}
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'idea': {
            if (this.idea) {
              this.getCustomFieldsWithData();
              this.subscribeFiles();
              this.processDescription();
            }
            break;
          }
        }
      }
    }
  }
  editIdeaImages() {
    this.opportunityApi
      .updateOpportunity(this.idea.id, {
        stopNotifications: true,
        title: this.idea.title,
        attachments: this.files
      })
      .subscribe();
  }
  private subscribeFiles() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.files = files.ideaFiles.selected;
      });
  }
  async processDescription() {
    this.descriptionHtml = await this.util.processMentions(
      this.idea.description,
      this.idea.mentions,
      this.idea.tags
    );
  }
  private getCustomFieldPermissions(customFieldIds: Array<any>) {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCustomFields(this.idea.id, customFieldIds)
      .toPromise()
      .then((res: any) => res.response);
  }
  private getCustomFieldsWithData() {
    this.customFieldApi
      .getOpportunityCustomField({
        opportunity: this.idea.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe(async (res: any) => {
        if (res.response.length) {
          const customFieldIds = map(res.response, (field) => field.field.id);
          const userCustomFieldPermissions = await this.getCustomFieldPermissions(
            customFieldIds
          );
          this.customFields = map(res.response, (field) => ({
            ...field.field,
            opportunityDataId:
              field.field.opportunityFieldData &&
              field.field.opportunityFieldData.length
                ? field.field.opportunityFieldData[0].id
                : null,
            permissions: find(
              userCustomFieldPermissions,
              (p) => p.customFieldId === field.field.id
            ).permissions
          }));
        } else {
          this.customFields = [];
        }
      });
  }

  async updateSummaryCustomFieldData(fieldData) {
    const opportunityTypeFieldsData = fieldData;
    remove(opportunityTypeFieldsData, (d) => !d.field);
    const params = {
      opportunity: this.idea.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    const data = {
      data: opportunityTypeFieldsData
    };

    try {
      await this.customFieldApi
        .updateCustomFieldsData(params, data)
        .toPromise();
      this.getCustomFieldsWithData();
    } catch (e) {
      console.log(e);
    }
  }
}
