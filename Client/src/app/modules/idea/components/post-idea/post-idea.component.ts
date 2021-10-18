import * as _ from 'lodash';

import { AppState, Files, STATE_TYPES } from '../../../../store';
import {
  CommunityApi,
  CustomFieldApiService,
  EntityApiService,
  NotificationService,
  OpportunityApiService,
  RoleAndPermissionsApi,
  SharedApi,
  UtilService,
  StorageService
} from '../../../../services';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_TYPE,
  FIELD_INTEGRATION
} from '../../../../utils';
import {
  FORM_SUBMISSION,
  LOAD_ALL_FILES,
  LOAD_SELECTED_IDEA_FILES
} from '../../../../actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConfirmBoxComponent } from '../../../shared/components/confirmBox/confirmBox.component';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-post-idea',
  templateUrl: './post-idea.component.html',
  styleUrls: ['./post-idea.component.scss'],
  providers: [SharedApi, CommunityApi]
})
export class PostIdeaComponent implements OnInit, OnChanges, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @ViewChild('confirmDismiss', { static: false }) confirmDismiss: TemplateRef<
    HTMLTemplateElement
  >;
  @ViewChild('ngMentionId', { static: false }) mentionId: any;
  @ViewChild('ngTitleId', { static: false }) titleId: any;

  @Input() idea = null;
  @Input() challengeRedirect = true;
  @Input() challenge = null;

  @Output() titleValue = new EventEmitter<any>();
  @Output() closePostIdeaPopup = new EventEmitter<boolean>();
  @Output() postedIdeaId = new EventEmitter<number>();
  modelChanged: Subject<string> = new Subject<string>();
  selectedFiles: Array<any>;
  allFiles: Array<any>;
  opportunityTypes: Array<any>;
  postIdeaForm: FormGroup;
  error: boolean;
  anonymous: boolean;
  selectedType: any;
  communityId: string;
  tagsSelected: any;
  mentionGroups: any;
  mentionTags: Array<any>;
  mentionUsers: Array<any>;
  mentions;
  tags;
  closeResult: string;
  similarIdeas: Array<any>;
  isPopupClosed: boolean;
  isEdit;
  tagInput: any;
  challengeEntity: any;
  permissionsData: any;
  isLoading;
  customFields;
  opportunityTypeFieldsData;
  opportunityTypeEntity;
  challengeTypeEntity;
  readMore = [];
  notSimilar = [];
  duplicates = [];
  totalDuplicates = 0;
  draftList = [];
  totalDraft = 0;
  viewDrafts = false;
  draft;
  scrollDownDistance = 2;
  count = 0;
  disableScroll = true;
  draftArchiveId;
  totalList = 10;
  draftDisabled = false;

  private sub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private ngbModal: NgbModal,
    private sharedApi: SharedApi,
    private ngRedux: NgRedux<AppState>,
    private notifier: NotificationService,
    private router: Router,
    private entityApiService: EntityApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private opportunityApi: OpportunityApiService,
    private customFieldApi: CustomFieldApiService,
    private communityApi: CommunityApi,
    public util: UtilService,
    private storage: StorageService
  ) {
    this.modelChanged.pipe(debounceTime(950)).subscribe(() => {
      this.searchSimilar();
    });
    this.error = true;
    this.anonymous = false;
    this.selectedFiles = [];
    this.allFiles = [];
    this.tagsSelected = [];
    this.mentions = [];
    this.tags = [];
    this.similarIdeas = [];
    this.isPopupClosed = false;
    this.tagInput = '';
    this.isEdit = false;
    this.isLoading = true;
  }

  ngOnInit() {
    this.isLoading = true;
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getOpportunityTypes();
    this.getMentionData();
    this.getTags();
    this.initializeOpportunitySubmissionForm();
    this.getDraftOpportunityCount();

    this.subscribeToFileState();
    if (this.challenge) {
      this.getChallengePermissions(this.challenge.id);
    }
  }

  ngOnChanges() {
    if (this.idea) {
      this.initializeEditOpportunitySubmissionForm();
    }
  }

  private searchSimilar() {
    const updatedValue = this.getIdea();
    const params = {
      title: updatedValue.title,
      description: updatedValue.description,
      ...(updatedValue.challenge && { challenge: updatedValue.challenge }),
      ...(updatedValue.opportunityType && {
        opportunityType: updatedValue.opportunityType
      })
    };
    this.opportunityApi.searchDuplicates(params).subscribe(async (res: any) => {
      const count = _.get(res, 'response.total', 0);
      const opportunityArray = _.get(res, 'response.opportunities', []);
      if (_.isEmpty(this.notSimilar)) {
        this.totalDuplicates = count;
        this.duplicates = opportunityArray;
      } else {
        this.duplicates = _.filter(
          opportunityArray,
          (o) => !_.includes(this.notSimilar, o.id)
        );
        this.totalDuplicates = this.duplicates.length;
      }
    });
  }

  markNotSimilar(id) {
    if (id) {
      this.notSimilar.push(id);
      this.duplicates = _.filter(
        this.duplicates,
        (o) => !_.includes(this.notSimilar, o.id)
      );
      this.totalDuplicates = this.duplicates.length;
    }
    return false;
  }

  commentOnSimilar(id) {
    const oppData = this.getIdea() || {};
    this.storage.setItem('newOpportunity', oppData);
    const queryParams = { scrollTo: 'newComment' };
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/idea/view/', id], {
        queryParams
      })
    );
    window.open(url, '_blank');
  }

  public initializeOpportunitySubmissionForm() {
    if (!this.idea) {
      this.postIdeaForm = this.formBuilder.group({
        title: ['', Validators.required],
        description: [''],
        community: []
      });
      this.dispatchFiles([]);
      this.postIdeaForm.controls.title.valueChanges.subscribe((val) => {
        this.modelChanged.next();
      });
      this.postIdeaForm.controls.description.valueChanges.subscribe((val) => {
        this.modelChanged.next();
      });
    }
  }

  private initializeEditOpportunitySubmissionForm() {
    if (this.idea.challenge) {
      this.getChallengePermissions(this.idea.challenge.id);
    }
    this.postIdeaForm = this.formBuilder.group({
      title: [this.idea.title || '', Validators.required],
      description: [this.idea.description || ''],
      community: [this.idea.community.id || null]
    });

    this.tags = this.idea.tags;
    this.mentions = this.idea.mentions;
    this.anonymous = this.idea.anonymous;
    this.dispatchFiles(this.idea.opportunityAttachments);
    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: []
    });
  }

  private dispatchFiles(files) {
    this.ngRedux.dispatch({
      type: LOAD_SELECTED_IDEA_FILES,
      selected: files
    });
  }

  private subscribeToFileState() {
    this.sub = this.ngRedux
      .select(STATE_TYPES.filesState)
      .subscribe((filesData: Files) => {
        this.selectedFiles = filesData.ideaFiles.selected;
        this.allFiles = filesData.all;
      });
  }

  private getOpportunityTypes() {
    const params = {
      community: this.communityId,
      ...(!this.idea && { isEnabled: true })
    };
    this.opportunityApi
      .getOpportunityType(params)
      .subscribe(async (res: any) => {
        this.opportunityTypes = res.response;
        if (this.challenge) {
          this.selectedType = _.find(
            this.opportunityTypes,
            (t) => t.id === this.challenge.opportunityType.id
          );
        } else if (this.idea) {
          this.selectedType = _.find(
            this.opportunityTypes,
            (t) => t.id === this.idea.opportunityType.id
          );
        } else {
          this.selectedType = _.first(this.opportunityTypes);
        }
        this.getOpportunityTypeEntity();
        this.getChallengeTypeEntity();
        this.getCustomFields();
        this.isLoading = false;
      });
  }

  getCustomFields() {
    this.idea ? this.getCustomFieldsWithData() : this.getCustomFieldsPlain();
  }

  private getCustomFieldsPlain() {
    this.customFieldApi
      .getAttachedFields({
        entityObjectId: this.challenge
          ? this.challenge.id
          : this.selectedType.id,
        entityType: this.challenge
          ? this.challengeTypeEntity.id
          : this.opportunityTypeEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
      })
      .subscribe((res: any) => {
        this.customFields = _.map(res.response, (field) => ({
          ...field.field,
          permissions: {
            viewCustomFieldData: true
          }
        }));
      });
  }

  private getCustomFieldsWithData() {
    this.customFieldApi
      .getAttachedFieldsWithData({
        entityObjectId: this.idea.challengeId
          ? this.idea.challengeId
          : this.selectedType.id,
        entityType: this.idea.challengeId
          ? this.challengeTypeEntity.id
          : this.opportunityTypeEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM,
        opportunity: this.idea.id
      })
      .subscribe(async (res: any) => {
        if (res.response.length) {
          const customFieldIds = _.map(res.response, (field) => field.field.id);
          const userCustomFieldPermissions = await this.getCustomFieldPermissions(
            customFieldIds
          );
          this.customFields = _.map(res.response, (field) => ({
            ...field.field,
            opportunityDataId:
              field.field.opportunityFieldData &&
              field.field.opportunityFieldData.length
                ? _.first(field.field.opportunityFieldData).id
                : null,
            permissions: _.find(
              userCustomFieldPermissions,
              (p) => p.customFieldId === field.field.id
            ).permissions
          }));
        } else {
          this.customFields = [];
        }
        console.log(this.customFields);
      });
  }

  private getCustomFieldPermissions(customFieldIds: []) {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCustomFields(this.idea.id, customFieldIds)
      .toPromise()
      .then((res: any) => res.response);
  }

  private getOpportunityTypeEntity() {
    this.opportunityTypeEntity = this.entityApiService.getEntity(
      ENTITY_TYPE.OPPORTUNITY_TYPE
    );
  }

  private getChallengeTypeEntity() {
    this.challengeTypeEntity = this.entityApiService.getEntity(
      ENTITY_TYPE.CHALLENGE
    );
  }

  private getMentionData() {
    const params = {
      community: this.communityId,
      ...{ challenge: _.get(this.challenge, 'id') },
      ...{ opportunity: _.get(this.idea, 'id') }
    };
    this.communityApi.getMentionData(params).subscribe((res: any) => {
      this.mentionUsers = _.get(res.response, 'users', []);
      this.mentionGroups = _.get(res.response, 'groups', []);
    });
  }

  public getTags() {
    this.sharedApi.searchTags().subscribe((res: any) => {
      this.mentionTags = res.response;
      if (this.mentionTags.length) {
        _.first(this.mentionTags).select = true;
      }
    });
  }

  private saveIdeaForm() {
    const errors = [];
    if (this.postIdeaForm.invalid) {
      this.error = false;
      this.notifier.showError('Idea Title is required field');
      return;
    }

    if (this.customFields.length > 0) {
      _.find(this.customFields, (obj) => {
        if (obj.isRequired) {
          errors.push({
            id: obj.id,
            title: obj.title
          });
        }
      });

      if (this.opportunityTypeFieldsData) {
        _.remove(errors, (e) => {
          for (let i = 0; i < this.opportunityTypeFieldsData.length; i++) {
            if (e.id == this.opportunityTypeFieldsData[i].field) {
              return true;
            }
          }
          return false;
        });
      }
    }

    if (errors.length > 0) {
      let result = _.flatMap(errors, (n) => {
        return n.title;
      });
      result = _.join(result, ', ');
      this.notifier.showError('These are required fields: ' + result);
      return;
    }

    _.remove(this.opportunityTypeFieldsData, (d) => !d.field);

    const apiHit = this.idea
      ? this.opportunityApi.editOpportunity(this.idea.id, this.getIdea())
      : this.opportunityApi.saveOpportunity(this.getIdea());

    apiHit.subscribe(
      (res: any) => {
        this.notifier.showSuccess('Alerts.PostSubmissionSuccess', {
          positionClass: 'toast-top-center'
        });
        this.postedIdeaId.emit(res.response.id);
        if (this.challengeRedirect) {
          this.redirectToChallenge();
        }

        this.dispatchFiles([]);
        this.ngRedux.dispatch({
          type: FORM_SUBMISSION,
          latestSubmission: { opportunity: true }
        });
        if (this.draft) {
          this.draftArchiveId = this.draft.id;
          this.archiveOpportunityDraft('post');
        }
      },
      () => this.notifier.showError('Something Went Wrong')
    );

    this.ngbModal.dismissAll();
  }

  private async getChallengePermissions(challengeId) {
    this.getChallengeEntity();
    this.permissionsData = _.first(
      ((await this.roleAndPermissionsApi
        .getPermissionsByEntityTypeAndObjectId({
          entityType: this.challengeEntity.id,
          entityObjectId: challengeId,
          community: this.ngRedux.getState().userState.currentCommunityId
        })
        .toPromise()) as any).response
    );
  }

  private redirectToChallenge() {
    if (this.challenge) {
      this.router.navigate(['/challenges/ideas/', this.challenge.id]);
    }
  }

  private getChallengeEntity() {
    this.challengeEntity = this.entityApiService.getEntity(
      ENTITY_TYPE.CHALLENGE
    );
  }

  selectedTags(id) {
    this.tags.push(id);
    this.tags = [...this.tags];
  }

  open(content: TemplateRef<HTMLTemplateElement>) {
    if (this.title.value) {
      this.ngbModal.open(content);
    } else {
      this.ngbModal.dismissAll();
    }
  }

  openArchiveModal(content, draftArchiveId) {
    this.draftArchiveId = draftArchiveId;
    this.ngbModal.open(content, {
      size: ''
    });
  }
  openConfirmBox() {
    if (this.draft) {
      this.ngbModal.dismissAll();
      return false;
    }
    if (!this.title.value) {
      this.ngbModal.dismissAll();
      return false;
    }
    const modalRef = this.ngbModal.open(ConfirmBoxComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.outPutResult.subscribe((result) => {
      if (result.confirm) {
        this.ngbModal.dismissAll();
      } else {
        modalRef.close('cancel');
      }
    });
  }

  closeModal() {
    this.ngbModal.dismissAll();
  }

  saveDraft() {
    const errors = [];
    if (this.postIdeaForm.invalid) {
      this.error = false;
      this.notifier.showError('Idea Title is required field');
      return;
    }
    _.remove(this.opportunityTypeFieldsData, (d) => !d.field);
    this.draftDisabled = true;
    const apiHit = this.draft
      ? this.opportunityApi.editOpportunityDraft(
          this.draft.id,
          this.getDraftIdea()
        )
      : this.opportunityApi.saveOpportunityDraft(this.getDraftIdea());

    apiHit.subscribe(
      (res: any) => {
        this.notifier.showInfo('Your idea has been saved as a draft');
        if (!this.draft) {
          this.totalDraft += 1;
        }
        this.draft = res.response;
        this.draftDisabled = false;
      },
      () => this.notifier.showError('Something Went Wrong')
    );
  }

  postIdea() {
    this.saveIdeaForm();
  }

  ngMentionTriggers(char) {
    const code = char === '@' ? 'Digit2' : 'Digit3';
    const kEvent = new KeyboardEvent('keydown', {
      key: char,
      code
    });
    this.mentionId.ngMentionId.nativeElement.dispatchEvent(kEvent);
    this.mentionId.ngMentionId.nativeElement.value += char;
    this.mentionId.ngMentionId.nativeElement.focus();
  }

  closePostIdeaDialog(closePopup) {
    this.isPopupClosed = closePopup;
    this.closePostIdeaPopup.emit(closePopup);
    this.isPopupClosed = false;
  }

  deleteMedia(fileObject) {
    const foundIndex = _.findIndex(
      this.selectedFiles,
      (o) => o.url === fileObject.url
    );
    if (foundIndex !== -1) {
      this.selectedFiles.splice(foundIndex, 1);
      this.dispatchFiles(this.selectedFiles);
    }
  }

  getIdea() {
    return {
      title: this.title.value,
      description: this.description.value,
      challenge: (this.challenge || {}).id,
      opportunityType: this.selectedType.id,
      community: this.communityId,
      anonymous: this.anonymous ? 1 : 0,
      tags: [...this.tagsSelected],
      mentions: this.mentions,
      attachments: this.selectedFiles,
      opportunityTypeFieldsData: this.opportunityTypeFieldsData
    };
  }

  getDraftIdea() {
    return {
      title: this.title.value,
      description: this.description.value,
      challengeId: this.challenge ? this.challenge.id : null,
      opportunityTypeId: this.selectedType.id,
      communityId: this.communityId,
      anonymous: this.anonymous ? 1 : 0,
      tags: [...this.tagsSelected],
      mentions: this.mentions,
      attachments: this.selectedFiles,
      customFieldsData: this.opportunityTypeFieldsData
    };
  }

  public getDraftList(value) {
    if (value) {
      this.count = 0;
      this.draftList = [];
    }
    let params = {
      take: this.totalList,
      skip: this.count,
      ...{
        opportunityTypeId: this.challenge
          ? this.challenge.opportunityTypeId
          : null
      }
    };
    this.opportunityApi
      .getDraftOpportunityList(params)
      .subscribe((res: any) => {
        res['response']['opportunityDrafts'].forEach((element) => {
          this.draftList.push(element);
        });
        this.count = this.draftList.length || 0;
        this.disableScroll = false;
      });
  }

  public getDraftOpportunityCount() {
    let params = {
      ...{
        opportunityTypeId: this.challenge
          ? this.challenge.opportunityTypeId
          : null
      }
    };
    this.opportunityApi
      .getDraftOpportunityTotalCount(params)
      .subscribe((res: any) => {
        this.totalDraft = res['response']['count'];
      });
  }

  private getCustomFieldsDraft() {
    this.customFieldApi
      .getAttachedFields({
        entityObjectId: this.challenge
          ? this.challenge.id
          : this.selectedType.id,
        entityType: this.challenge
          ? this.challengeTypeEntity.id
          : this.opportunityTypeEntity.id,
        community: this.ngRedux.getState().userState.currentCommunityId,
        visibilityExperience: FIELD_INTEGRATION.SUBMISSION_FORM
      })
      .subscribe((res: any) => {
        this.customFields = _.map(res.response, (field) => ({
          ...field.field,
          opportunityFieldData: _.find(
            this.draft.customFieldsData,
            (p) => p.field === field.field.id
          )
            ? [
                {
                  fieldData: _.find(
                    this.draft.customFieldsData,
                    (p) => p.field === field.field.id
                  ).fieldData
                }
              ]
            : null,
          permissions: {
            viewCustomFieldData: true
          }
        }));
      });
  }

  public initializeEditOpportunityDraftSubmissionForm() {
    this.postIdeaForm = this.formBuilder.group({
      title: [this.draft.title || '', Validators.required],
      description: [this.draft.description || ''],
      community: [this.draft.communityId || null]
    });

    this.selectedType = _.find(
      this.opportunityTypes,
      (t) => t.id === this.draft.opportunityTypeId
    );

    this.tags = this.draft.tags;
    this.mentions = this.draft.mentions;
    this.anonymous = this.draft.anonymous;
    this.dispatchFiles(this.draft.attachments);
    this.getCustomFieldsDraft();
    this.ngRedux.dispatch({
      type: LOAD_ALL_FILES,
      all: []
    });
  }

  public editDraft(draft) {
    this.draft = draft;
    this.viewDrafts = !this.viewDrafts;
    this.initializeEditOpportunityDraftSubmissionForm();
  }

  public archiveOpportunityDraft(value?) {
    this.opportunityApi.archiveOpportunityDraft(this.draftArchiveId).subscribe(
      (res: any) => {
        if (value != 'post') {
          this.notifier.showSuccess('Draft deleted successfully');
        }
        _.remove(this.draftList, (value) => value.id == this.draftArchiveId);
        this.totalDraft -= 1;
        if (this.draftList.length < this.totalList) {
          this.count = this.draftList.length || 0;
          this.changePage();
        }
        if (this.draftList.length == 0) {
          this.viewDrafts = false;
        }
      },
      (err) => {}
    );
  }

  changePage() {
    if (this.count >= this.totalDraft) {
      return false;
    }
    this.getDraftList(false);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    setTimeout(() => {
      this.storage.clearItem('newOpportunity');
    }, 4000);
  }

  get title() {
    return this.postIdeaForm.get('title');
  }

  get description() {
    return this.postIdeaForm.get('description');
  }

  showFullDesc(id) {
    return _.includes(this.readMore, id) ? true : false;
  }

  readFull(id) {
    this.readMore.push(id);
  }

  readLess(id) {
    this.readMore = _.remove(this.readMore, (n) => n !== id);
  }
  get titlePlaceHolder() {
    if (this.challenge && this.challenge.postTitlePlaceholder) {
      return this.challenge.postTitlePlaceholder;
    } else if (this.selectedType && this.selectedType.titlePlaceholder) {
      return this.selectedType.titlePlaceholder;
    } else {
      const defaultValue = `Give your ${
        this.selectedType ? this.selectedType.name : ''
      } a catchy title...`;
      return defaultValue;
    }
  }
  get descPlaceHolder() {
    if (this.challenge && this.challenge.postDescPlaceholder) {
      return this.challenge.postDescPlaceholder;
    } else if (this.selectedType && this.selectedType.descPlaceholder) {
      return this.selectedType.descPlaceholder;
    } else {
      const defaultValue = `Describe your great ${
        this.selectedType ? this.selectedType.name : ''
      } here. You can mention others using the @ symbol and tag your ${
        this.selectedType ? this.selectedType.name : ''
      } using the # symbol to make it searchable...`;
      return defaultValue;
    }
  }
}
