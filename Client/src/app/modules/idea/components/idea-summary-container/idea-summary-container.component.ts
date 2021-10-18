import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  CustomFieldApiService,
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  SocialActivitiesApiService,
  UtilService
} from '../../../../services';
import { find, first, map, remove } from 'lodash';

import { ENTITY_TYPE } from '../../../../utils';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-idea-summary-container',
  templateUrl: './idea-summary-container.component.html',
  styleUrls: ['./idea-summary-container.component.scss']
})
export class IdeaSummaryContainerComponent implements OnChanges, OnDestroy {
  @Input() idea: any;
  @Input() ideaDetail: any;
  @Input() userOpportunityPermissions;
  @Input() stageStats;
  @Input() stageAssignees;

  @Output() updatedIdea = new EventEmitter();
  @Output() updateUpvoters = new EventEmitter();

  entity = ENTITY_TYPE.IDEA;
  upvotes;
  files = [];
  closeResult: string;
  upvoteDetail;
  ideaUpvoters;
  entityType;
  tagsData;
  followersData;
  ideaFollowersStatus;
  commentCount;
  topScore;
  commentsCount = 0;
  fileChangeCount = 0;
  permissionsData;

  customFields;
  opportunityTypeFieldsData;

  hide = true;
  showLinkedList = false;
  addLinkedOpportunity = false;
  showMergedList = false;
  isLoading = false;

  private sub: Subscription;
  notVisited = true;

  constructor(
    private modalService: NgbModal,
    private entityApiService: EntityApiService,
    private socialActivitiesApiService: SocialActivitiesApiService,
    private opportunityApiService: OpportunityApiService,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private router: Router,
    private opportunityApi: OpportunityApiService,
    private customFieldApi: CustomFieldApiService,
    public util: UtilService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'ideaDetail':
            if (this.ideaDetail) {
              this.initializeData();
              this.subscribeFiles();
              this.getIdeaEntity();
              this.processDescription();
              this.getExperienceSettings();
              this.getCustomFieldsWithData();
            }
            break;
        }
      }
    }
  }

  private initializeData() {
    this.idea = this.ideaDetail.data[0];
    this.tagsData = this.ideaDetail.tagsData;
    this.upvotes = this.ideaDetail.upvotes;
    this.upvoteDetail = this.ideaDetail.upvoteData;
    this.ideaUpvoters = this.upvoteDetail[this.idea.id];
    this.followersData = this.ideaDetail.followersData[this.idea.id];

    if (
      this.ideaUpvoters &&
      this.ideaUpvoters.length &&
      this.ideaUpvoters.length > 3
    ) {
      this.ideaUpvoters = this.ideaUpvoters.splice(0, 3);
    }
  }

  private subscribeFiles() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((files: Files) => {
        this.fileChangeCount++;
        this.files = files.ideaFiles.selected;
      });
  }

  private getIdeaEntity() {
    this.entityType = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
  }

  private getExperienceSettings() {
    const permissionParams = {
      entityType: this.entityType.id,
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
      .getOpportunityCustomField({
        opportunity: this.idea.id,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe(async (res: any) => {
        if (res.response.length) {
          const userCustomFieldPermissions = await this.getCustomFieldPermissions(
            map(res.response, 'field.id')
          );
          this.customFields = map(res.response, (field) => ({
            ...field.field,
            opportunityDataId:
              field.field.opportunityFieldData &&
              field.field.opportunityFieldData.length
                ? field.field.opportunityFieldData[0].id
                : null,
            permissions: find(userCustomFieldPermissions, [
              'customFieldId',
              field.field.id
            ]).permissions
          }));
        } else {
          this.customFields = [];
        }
      });
  }

  private getCustomFieldPermissions(customFieldIds: Array<any>) {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCustomFields(this.idea.id, customFieldIds)
      .toPromise()
      .then((res: any) => res.response);
  }

  async processDescription() {
    this.idea.descriptionHtml = '';
    this.idea.descriptionHtml = await this.util.processMentions(
      this.idea.description,
      this.idea.mentions,
      this.idea.tags
    );
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  bookmarkIdea() {
    if (this.idea.bookmark) {
      this.socialActivitiesApiService
        .removeFromBookmarks(this.idea.bookmarkId)
        .subscribe((result: any) => {
          if (result.statusCode === 200) {
            this.idea.bookmarkId = '';
            this.idea.bookmark = false;
            this.notifier.showInfo('Alerts.BookmarkRemove', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    } else {
      this.socialActivitiesApiService
        .addToBookmarks({
          community: this.ngRedux.getState().userState.currentCommunityId,
          entityType: this.entityType.id,
          entityObjectId: this.idea.id,
          displayName: this.idea.title,
          url: `/idea/view/${this.idea.id}`,
          email: 'idea@idea.com',
          entity: 'idea'
        })
        .subscribe((res: any) => {
          this.idea.bookmarkId = res.response.id;
          if (res.statusCode === 200) {
            this.idea.bookmark = true;
            this.notifier.showSuccess('Alerts.BookmarkSuccess', {
              positionClass: 'toast-bottom-right'
            });
          } else {
            this.notifier.showError('Something Went Wrong');
          }
        });
    }
  }

  gotoSearch() {
    this.router.navigateByUrl('/search');
  }

  updateIdea(idea) {
    this.updatedIdea.emit(idea);
  }

  removeUpvoter(data) {
    if (data.type === 'add') {
      this.ideaUpvoters = this.ideaUpvoters || [];
      this.ideaUpvoters.push(data.data);
      this.ideaUpvoters = [...this.ideaUpvoters];
    } else {
      this.ideaUpvoters = this.ideaUpvoters.filter(
        (value) => value.user.id !== data.user.id
      );
    }

    this.updateUpvoters.emit(this.ideaUpvoters);
  }

  commentsLength(count) {
    this.commentsCount = count;
  }

  updateSummaryCustomFieldData(fieldData) {
    this.opportunityTypeFieldsData = fieldData;
    remove(this.opportunityTypeFieldsData, (d) => !d.field);
    this.opportunityApi
      .updateOpportunity(this.idea.id, {
        title: this.idea.title,
        opportunityTypeFieldsData: this.opportunityTypeFieldsData
      })
      .subscribe();
  }

  toggleShowLinks() {}

  toggleAddLink() {}

  toggleShowMerged() {}

  editIdeaImages() {
    this.opportunityApi
      .updateOpportunity(this.idea.id, {
        stopNotifications: true,
        title: this.idea.title,
        attachments: this.files
      })
      .subscribe();
  }

  async ngOnDestroy() {
    /* if (this.fileChangeCount > 1) {
      await this.opportunityApiService
        .updateOpportunity(this.idea.id, {
          stopNotifications: true,
          title: this.idea.title,
          description: this.idea.description,
          community: this.idea.community.id,
          draft: this.idea.draft,
          anonymous: this.idea.anonymous,
          tags: this.idea.tags,
          mentions: this.idea.mentions,
          attachments: this.files
        })
        .toPromise()
        .then((res) => res);
    } */
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
