import * as _ from 'lodash';

import { COMMUNITY_SSO_LOGIN_ENUM, PERMISSION_LEVEL } from '../../../../utils';
import {
  CommunityApi,
  NotificationService,
  SettingsApiService,
  UtilService
} from '../../../../services';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppState } from '../../../../store';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invites-send',
  templateUrl: './invites-send.component.html',
  styleUrls: ['./invites-send.component.scss']
})
export class InvitesSendComponent implements OnInit {
  public sendInvitesForm: FormGroup = this.formBuilder.group({
    groups: [''],
    role: [0],
    emails: this.formBuilder.array([])
  });
  isSSO = false;
  hideErrorMessage = true;
  bulkInvite = false;
  submitted = false;
  currentUser = this.ngRedux.getState().userState;
  communityId = this.ngRedux.getState().userState.currentCommunityId;
  searchGroupQuery;
  searchedGroups = [];
  groupIds;
  communityRoles;
  communitySsoLoginEnum = COMMUNITY_SSO_LOGIN_ENUM;
  communitySSO = COMMUNITY_SSO_LOGIN_ENUM.DISABLED;

  emailsFromTextArea = '';

  constructor(
    private formBuilder: FormBuilder,
    private notifier: NotificationService,
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private settingsApi: SettingsApiService,
    private communityApi: CommunityApi,
    private util: UtilService
  ) {}

  get groups() {
    return this.sendInvitesForm.get('groups');
  }

  get role() {
    return this.sendInvitesForm.get('role') as FormArray;
  }

  get sendInvitesFormControls() {
    return this.sendInvitesForm.controls;
  }

  get emails() {
    return this.sendInvitesForm.get('emails') as FormArray;
  }

  ngOnInit() {
    this.getRoles();
    this.communityApi
      .getCommunityById(this.communityId)
      .subscribe((res: any) => {
        this.communitySSO = _.first(res.response).loginWithSSO;
        if (this.communitySSO === COMMUNITY_SSO_LOGIN_ENUM.DISABLED) {
          this.isSSO = false;
        } else {
          this.isSSO = true;
        }
      });
  }

  trimSpaces(emails) {
    emails.forEach((element, index) => {
      emails[index] = emails[index].trim();
    });
    return emails;
  }

  onKeyupEvent($event: KeyboardEvent) {
    if ($event.key !== 'Enter') {
      this.submitted = false;
    }
  }

  onSubmit() {
    this.sendInvitesForm.controls['emails'].setValue(
      this.trimSpaces(this.sendInvitesForm.value.emails)
    );
    this.submitted = true;
    if (this.sendInvitesForm.invalid) {
      return;
    }

    let fromTextArea = _.split(this.emailsFromTextArea, '\n');
    fromTextArea = this.trimSpaces(fromTextArea);

    const dataToSend = _.concat(
      this.addEmailsFromInputs(this.sendInvitesForm.value.emails),
      this.addEmailsFromInputs(fromTextArea)
    );

    if (!dataToSend.length) {
      this.notifier.showError('Alerts.SendInvitesNoEmail');
      return;
    }

    const payload = {
      inviteUsers: dataToSend,
      community: this.communityId,
      isSSO: this.isSSO
    };

    this.settingsApi.sendCommunityInvites(payload).subscribe((res: any) => {
      if (res.wasSuccess) {
        this.notifier.showSuccess('Alerts.EmailsSent');
      } else {
        this.notifier.showError('Something Occurred');
      }
      this.router.navigateByUrl('/settings/invites-pending?tab=pending');
    });
  }

  private addEmailsFromInputs(emails: []) {
    const finalData = [];
    _.forEach(emails, (email) => {
      if (email !== '' && this.util.isEmail(email)) {
        finalData.push({
          name: email.substring(0, email.lastIndexOf('@')) || 'Invite Receiver',
          email,
          invitedByUserId: this.currentUser.user.id,
          senderName: this.currentUser.user.userName,
          isOpened: false,
          isEmailLinkClicked: false,
          statusCode: 'NotSent',
          role: this.sendInvitesForm.value.role,
          inviteCode: '345',
          emailOpenedCount: 2,
          circles: this.groupIds || []
        });
      }
    });

    return finalData;
  }

  groupSuggestions(event) {
    this.groupIds = _.map(event, 'id');
  }

  addEmail() {
    this.emails.push(this.formBuilder.control('', [Validators.email]));
    // this.role.push(this.formBuilder.control(this.communityRoles[0].id));
  }

  private getRoles() {
    this.settingsApi
      .getCommunityRoles(PERMISSION_LEVEL.COMMUNITY)
      .subscribe((res: any) => {
        this.communityRoles = res.response;
        const userRole = _.find(this.communityRoles, ['abbreviation', 'user']);
        this.sendInvitesForm.controls.role.setValue(userRole.id);
        for (let i = 0; i < 3; i++) {
          this.addEmail();
        }
      });
  }

  onClickBulkInvite() {
    if (this.bulkInvite) {
      this.bulkInvite = false;
    } else {
      this.bulkInvite = true;
    }
  }
}
