import { NgRedux } from '@angular-redux/store';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { find } from 'lodash';
import {
  CommunityApi,
  NotificationService,
  UtilService,
  SettingsApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { PERMISSION_LEVEL } from '../../../../utils';

@Component({
  selector: 'app-community-register-send-invites',
  templateUrl: './community-register-send-invites.component.html',
  styleUrls: ['./community-register-send-invites.component.scss'],
  providers: [UtilService]
})
export class CommunityRegisterSendInvitesComponent
  implements OnInit, AfterViewInit {
  public emailErrors: boolean[];
  private stateInfo;
  private communityId;
  public communityRoles = [];
  public communitySendInviteForm: FormGroup = this.formBuilder.group({
    role: [null],
    emails: this.formBuilder.array([])
  });

  @ViewChild('inviteEmail', { static: false }) inviteEmailElement: ElementRef;

  constructor(
    private settingsApi: SettingsApiService,
    private formBuilder: FormBuilder,
    private utilities: UtilService,
    private communityApi: CommunityApi,
    private notifier: NotificationService,
    private router: Router,
    private ngRedux: NgRedux<AppState>
  ) {}

  ngOnInit() {
    this.communityId = this.ngRedux.getState().userState.currentCommunityId;
    this.getRoles();
    this.stateInfo = history.state;
    this.emailErrors = [];

    for (let index = 0; index < 3; index++) {
      this.emailErrors.push(true);
      this.emails.push(this.formBuilder.control('', Validators.email));
    }
  }

  ngAfterViewInit() {
    this.inviteEmailElement.nativeElement.focus();
  }

  private getRoles() {
    this.settingsApi
      .getCommunityRoles(PERMISSION_LEVEL.COMMUNITY)
      .subscribe((res: any) => {
        this.communityRoles = res.response;
        const userRole = find(this.communityRoles, ['abbreviation', 'user']);
        this.communitySendInviteForm.controls.role.setValue(userRole.id);
      });
  }

  onSubmit() {
    const data = this.communitySendInviteForm.value;
    const dataToSend = [];

    let error = false;
    data.emails.forEach((email, index) => {
      this.emailErrors[index] = true;
      if (email !== '') {
        if (!this.utilities.isEmail(email)) {
          this.emailErrors[index] = false;
          error = true;
        }
      }
    });

    if (error) {
      return;
    }
    data.emails.forEach((email) => {
      if (email !== '') {
        const temp: any = {
          name: email.substring(0, email.lastIndexOf('@')) || 'Invite Receiver',
          email,
          invitedByUserId: this.stateInfo.user.response.user.id,
          senderName: this.stateInfo.user.response.user.userName,
          isOpened: true,
          isEmailLinkClicked: false,
          statusCode: 'NotSent',
          role: data.role,
          inviteCode: '345',
          emailOpenedCount: 2
        };
        dataToSend.push(temp);
      }
    });

    if (dataToSend.length !== 0) {
      const payload = {
        inviteUsers: dataToSend,
        community: this.communityId,
        isSSO: false
      };
      this.communityApi.sendCommunityInvite(payload).subscribe((res: any) => {
        if (res.emailSent) {
          this.notifier.showSuccess('Alerts.EmailsSent');
        }
      });
    }

    this.router.navigateByUrl('/');
  }

  get emails() {
    return this.communitySendInviteForm.get('emails') as FormArray;
  }

  get role() {
    return this.communitySendInviteForm.get('role') as FormArray;
  }

  addEmail() {
    this.emails.push(this.formBuilder.control('', Validators.email));
    this.emailErrors.push(true);
  }
}
