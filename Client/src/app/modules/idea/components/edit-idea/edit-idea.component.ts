import { forEach, remove, get } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { NgbActiveModal, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  EntityApiService,
  NotificationService,
  OpportunityApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import {
  EDIT_OPPORTUNITY,
  ENTITY_TYPE,
  ENTITY_VISIBILITIES,
  IDEA_USERS
} from '../../../../utils';
import { AddUserComponent } from '../addUsers/addUsers.component';
import { PostIdeaComponent } from '../post-idea/post-idea.component';

@Component({
  selector: 'app-edit-idea',
  templateUrl: './edit-idea.component.html',
  styleUrls: ['./edit-idea.component.scss']
})
export class EditIdeaComponent implements OnInit {
  @Input() ideaId;
  @Input() tab = EDIT_OPPORTUNITY.edit.key;
  @Output() updatedIdea = new EventEmitter<any>();
  @ViewChild('dateDisplay', { static: false }) dateDisplay;
  // @ViewChild('postIdea', { static: false }) postIdeaComponent;
  private postIdea: PostIdeaComponent;

  @ViewChild('postIdea', { static: false }) set content(
    content: PostIdeaComponent
  ) {
    if (content) {
      this.postIdea = content;
    }
  }

  submissionDate: NgbDate;
  entityType;
  visibilitySetting;
  visibilitySettingFinalData;
  selectedGroups;
  preSelectedGroups;
  currentVisibility;
  entityVisibilities = ENTITY_VISIBILITIES;
  ideaUserType = IDEA_USERS;
  idea;

  public objectKeys = Object.keys;
  public tabsList = EDIT_OPPORTUNITY;
  public experienceSettings;
  constructor(
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private opportunityApi: OpportunityApiService,
    private notifier: NotificationService,
    private entityApiService: EntityApiService,
    private ngRedux: NgRedux<AppState>
  ) {}

  async ngOnInit() {
    this.entityType = this.entityApiService.getEntity(ENTITY_TYPE.IDEA);
    if (this.tab) {
      this.switchTab(this.tab, false);
    }

    const res = await this.opportunityApi
      .getOpportunityOld({
        community: this.ngRedux.getState().userState.currentCommunityId,
        isDeleted: false,
        id: this.ideaId
      })
      .toPromise();

    this.idea = get(res, 'response.data[0]', null);
    this.setSubmissionDate(this.idea.createdAt);
  }

  updateIdea() {
    const editedIdea = this.postIdea.getIdea();
    remove(editedIdea.opportunityTypeFieldsData, (d) => !d.field);

    this.opportunityApi
      .updateOpportunity(this.ideaId, {
        ...editedIdea,
        createdAt: new Date(
          this.submissionDate.year,
          this.submissionDate.month - 1,
          this.submissionDate.day
        )
      })
      .subscribe(
        (res: any) => {
          this.updatedIdea.emit(res.response.updatedData);
          this.notifier.showInfo('Changes Saved Successfully', {
            positionClass: 'toast-top-center'
          });
        },
        (err) => {
          this.notifier.showError('Something Went Wrong');
        }
      );
    this.activeModal.dismiss();
    this.ngRedux.dispatch({
      type: 'LOAD_SELECTED_OPPORTUNITY_FILE',
      selected: []
    });
    this.ngRedux.dispatch({
      type: 'LOAD_OPPORTUNITY_FILES',
      all: []
    });
  }

  setSubmissionDate(date) {
    const dateTrans = new Date(date);
    this.submissionDate = new NgbDate(
      dateTrans.getFullYear(),
      dateTrans.getMonth() + 1,
      dateTrans.getDate()
    );
  }

  close() {
    this.activeModal.dismiss();
  }

  public openAddNewBox(type) {
    const modalRef = this.modalService.open(AddUserComponent, {
      ariaLabelledBy: 'modal-basic-title'
    });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
    modalRef.componentInstance.data.subscribe((result) => {
      if (result) {
        modalRef.close('save');
      }
    });
  }

  switchTab(key, resetSubdate = true) {
    this.tab = key;
    if (key === this.tabsList.edit.key && resetSubdate) {
      this.setSubmissionDate(this.idea.createdAt);
    }
    if (key === this.tabsList.settings.key) {
      this.getVisibilitySettings();
      this.getExperienceSettings();
    }
  }

  getSelectedGroups(event) {
    this.selectedGroups = [];
    forEach(event, (val) => {
      this.selectedGroups.push(parseInt(val.id, 10));
    });
  }

  getExperienceSettings() {
    const params = {
      entityObjectId: this.ideaId,
      entityType: this.entityType.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.entityApiService
      .getEntityExperienceSetting(params)
      .subscribe((res: any) => {
        this.experienceSettings = res.response[0];
      });
  }

  visibilityChangedHandler(event: any) {
    if (event.target.value === ENTITY_VISIBILITIES.GROUPS) {
      this.visibilitySettingFinalData = { groups: this.selectedGroups };
    } else {
      this.visibilitySettingFinalData = {
        [event.target.value]: true
      };
    }
  }

  getVisibilitySettings() {
    const params = {
      entityObjectId: this.ideaId,
      entityType: this.entityType.id,
      community: this.ngRedux.getState().userState.currentCommunityId
    };
    this.entityApiService
      .getEntityVisibilitySetting(params)
      .subscribe((res: any) => {
        this.visibilitySetting = res.response[0];
        if (this.visibilitySetting.public) {
          this.currentVisibility = ENTITY_VISIBILITIES.PUBLIC;
        } else if (
          this.visibilitySetting.groups &&
          this.visibilitySetting.groups.length
        ) {
          this.currentVisibility = ENTITY_VISIBILITIES.GROUPS;
          const toBelSelected = [];
          forEach(this.visibilitySetting.groups, (val) => {
            toBelSelected.push({ id: val.toString(), type: 'Group' });
          });
          this.preSelectedGroups = toBelSelected;
        } else if (
          this.visibilitySetting.roles &&
          this.visibilitySetting.roles.length
        ) {
          this.currentVisibility = ENTITY_VISIBILITIES.PRIVATE;
        }
      });
  }

  updateIdeaSettings() {
    this.visibilityChangedHandler({
      target: { value: this.currentVisibility }
    });
    this.opportunityApi
      .updateOpportunity(this.ideaId, {
        title: this.idea.title,
        ...{ entityExperienceSetting: this.experienceSettings },
        ...{ entityVisibilitySetting: this.visibilitySettingFinalData }
      })
      .subscribe(
        (res: any) => {
          this.updatedIdea.emit(res.response.updatedData);
          this.notifier.showInfo(
            'Your Idea Settings Have Been Updated Successfully',
            {
              positionClass: 'toast-bottom-center'
            }
          );
        },
        (err) => {
          this.notifier.showError('Something Went Wrong');
        }
      );
    this.activeModal.dismiss();
  }
}
