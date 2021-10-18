import { get, groupBy, map } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  OpportunityApiService,
  RoleAndPermissionsApi
} from '../../../../services';
import { AppState } from '../../../../store';
import { IDEA_USERS, DEFAULT_PRELOADED_IMAGE } from '../../../../utils';
import { AddUserComponent } from '../addUsers/addUsers.component';

@Component({
  selector: 'app-idea-team-container',
  templateUrl: './idea-team-container.component.html',
  styleUrls: ['./idea-team-container.component.scss']
})
export class IdeaTeamContainerComponent implements OnChanges {
  beforeDismiss: () => boolean | Promise<boolean>;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() idea;
  @Input() userOpportunityPermissions;

  @Output() updated = new EventEmitter<any>();

  currentUser = this.ngRedux.getState().userState;
  ideaUserType = IDEA_USERS;
  owners = [];
  contributors = [];
  submitters = [];
  userIds = {
    owner: [],
    submitter: [],
    contributor: []
  };
  closeResult: string;
  opportunityTypeSettings;

  constructor(
    private ngRedux: NgRedux<AppState>,
    private modalService: NgbModal,
    private opportunityService: OpportunityApiService,
    private roleAndPermissionsApi: RoleAndPermissionsApi
  ) {}

  ngOnChanges() {
    if (this.idea && this.idea.id) {
      this.getUsersList();
      this.getOpportunitySettings();
    }
  }

  getUsersList() {
    const params = {
      community: this.currentUser.currentCommunityId,
      opportunity: this.idea.id
    };
    this.opportunityService
      .getOpportunityUsers(params)
      .subscribe((res: any) => {
        const opportunityUsers = groupBy(
          get(res, 'response', []),
          'opportunityUserType'
        );
        this.owners = get(opportunityUsers, this.ideaUserType.owner.key, []);
        this.contributors = get(
          opportunityUsers,
          this.ideaUserType.contributors.key,
          []
        );
        this.submitters = get(
          opportunityUsers,
          this.ideaUserType.submitter.key,
          []
        );
        this.submitters = map(this.submitters, (obj) => {
          if (
            get(obj, 'opportunity.anonymous', false) &&
            obj.message === 'Original Submitter'
          ) {
            obj.showAnonymous = true;
          }
          return obj;
        });
        this.userIds.owner = map(this.owners, 'user.id');
        this.userIds.contributor = map(this.contributors, 'user.id');
        this.userIds.submitter = map(this.submitters, 'user.id');
      });
  }

  open(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'custom-field-modal'
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

  public openAddNewBox(type) {
    const modalRef = this.modalService.open(AddUserComponent, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'custom-field-modal'
    });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.exclude = this.userIds[type.key];
    modalRef.componentInstance.closePopup.subscribe((result) => {
      if (result) {
        modalRef.close('cancel');
      }
    });
    modalRef.componentInstance.data.subscribe((result) => {
      if (result) {
        const dataSet = map(result.users, (value) => {
          return {
            user: value,
            opportunity: this.idea.id,
            community: this.currentUser.currentCommunityId,
            message: result.message,
            opportunityUserType: type.key
          };
        });
        this.opportunityService
          .postOpportunityUsers(dataSet)
          .subscribe((res) => {
            this.updated.emit(true);
            this.getUsersList();
          });
        modalRef.close('save');
      }
    });
  }

  removeUser(user, type) {
    this.opportunityService.deleteOpportunityUsers(user.id).subscribe((res) => {
      this.updated.emit(true);
      this.getUsersList();
    });
  }

  getDismissReason(reason: any) {
    return 'Method not implemented.';
  }

  getUserName(user) {
    return `${get(user, 'user.firstName', '')} ${get(
      user,
      'user.lastName',
      ''
    )}`;
  }

  getUserImage(user) {
    return get(
      user,
      'user.profileImage.url',
      'https://via.placeholder.com/40x40'
    );
  }

  getOpportunitySettings() {
    this.roleAndPermissionsApi
      .getOpportunitySettingsForUser(this.idea.opportunityType.id)
      .subscribe((res: any) => (this.opportunityTypeSettings = res.response));
  }
}
