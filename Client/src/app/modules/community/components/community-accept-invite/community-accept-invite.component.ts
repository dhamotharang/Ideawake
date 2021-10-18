import { get } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  LOAD_ALL_ENTITIES
} from '../../../../actions';
import { WINDOW } from '../../../../providers';
import {
  ApiService,
  AuthorizationApiService,
  CommunityApi,
  NotificationService,
  RoleAndPermissionsApi,
  EntityApiService,
  AuthService
} from '../../../../services';
import { AppState } from '../../../../store';
import { LANGUAGES } from '../../../../utils';
import { I18nService } from 'src/app/modules/i18n/i18n.service';
@Component({
  selector: 'app-community-accept-invite',
  templateUrl: './community-accept-invite.component.html',
  styleUrls: ['./community-accept-invite.component.scss'],
  providers: [AuthorizationApiService]
})
export class CommunityAcceptInviteComponent implements OnInit {
  public invite;
  public submitted = false;
  public inviteExpired = false;
  public communityName = '';
  public urlCommunityId = null;
  public languages = LANGUAGES;

  public acceptInviteForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    defaultLanguage: ['en'],
    password: ['', Validators.required],
    termsAndConditions: [false, Validators.pattern('true')]
  });

  constructor(
    @Inject(WINDOW) private window: any,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private authorizationApi: AuthorizationApiService,
    private communityApi: CommunityApi,
    private entityApi: EntityApiService,
    private authService: AuthService,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private i18nService: I18nService
  ) {
    let data = this.route.snapshot.data.urlInfo;
    this.i18nService.setLanguage(get(data, 'defaultLanguage', 'en'));
    this.defaultLanguage.setValue(get(data, 'defaultLanguage', 'en'));
    this.communityName = get(data, 'name', '');
    this.urlCommunityId = get(data, 'id', null);
  }

  ngOnInit() {
    const id = this.route.snapshot.params.id;

    this.authorizationApi.acceptUserInvite(id).subscribe(
      (res: any) => {
        if (res.statusCode === 404) {
          this.notifier.showError('Invite Link not Valid');
          this.authService.logout(true);
        } else if (res.wasSuccess && res.response[0].inviteAccepted) {
          this.notifier.showError('Invite Already Accepted');
          this.authService.logout(true);
          /* else if (new Date().toISOString() > res.response[0].expiryDate) {
              this.notifier.showError('Invite Expired');
              this.inviteExpired = true;
            } */
        } else if (res.response[0].user) {
          const user = {
            firstName: res.response[0].user.firstName,
            lastName: res.response[0].user.lastName,
            email: res.response[0].email,
            userName: 'set on server',
            defaultLanguage: res.response[0].user.defaultLanguage,
            role: res.response[0].role.id,
            password: 'demo',
            lastLogin: new Date().toDateString()
          };

          this.authorizationApi
            .addUserToCommunityViaInviteCode({
              user,
              inviteCode: res.response[0].id
            })
            .subscribe(
              async (res1: any) => {
                if (res1.wasSuccess) {
                  this.notifier.showSuccess(
                    'You can login using your credentials from other community'
                  );
                  this.ngRedux.dispatch({
                    type: LOAD_USER_DATA,
                    user: res1.response.user
                  });
                  if (get(res1.response, 'user.currentCommunity.id')) {
                    this.ngRedux.dispatch({
                      type: CHANGE_CURRENT_COMMUNITY,
                      currentCommunityId: get(
                        res1.response,
                        'user.currentCommunity.id'
                      )
                    });
                    this.getAppearanceSettings();
                    const userCommunityPermissions = await this.roleAndPermissionsApi
                      .getUserPermissionsInCommunity()
                      .toPromise()
                      .then((res2: any) => res2.response);

                    this.ngRedux.dispatch({
                      type: LOAD_USER_PERMISSIONS,
                      userCommunityPermissions
                    });
                    this.router.navigateByUrl('/');
                  } /* else {
                      this.router.navigateByUrl('/community/select');
                    } */
                }
              },
              () => {
                this.notifier.showError('Something Went Wrong');
              }
            );
          // End
        } else {
          this.invite = res.response[0];
        }
      },
      (error) => {
        this.router.navigateByUrl('/');
      }
    );
  }

  onSubmit(formData) {
    this.submitted = true;

    if (this.acceptInviteForm.status.toLowerCase() === 'valid') {
      const user = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: this.invite.email,
        userName: 'set on server',
        language: formData.defaultLanguage,
        password: formData.password,
        role: this.invite.role.id,
        lastLogin: new Date().toDateString()
      };

      this.apiService
        .post(`/auth/accept-invite`, {
          user,
          inviteCode: this.invite.id
        })
        .subscribe(
          async (res: any) => {
            if (res.wasSuccess) {
              this.invite = res.response[0];
              this.ngRedux.dispatch({
                type: LOAD_USER_DATA,
                user: res.response.user
              });
              this.notifier.showSuccess('Invite Accepted');
              if (get(res.response, 'user.currentCommunity.id')) {
                this.ngRedux.dispatch({
                  type: CHANGE_CURRENT_COMMUNITY,
                  currentCommunityId: get(
                    res.response,
                    'user.currentCommunity.id'
                  )
                });
                this.getAppearanceSettings();

                const entities = await this.getAllEntities();
                this.ngRedux.dispatch({
                  type: LOAD_ALL_ENTITIES,
                  entities: get(entities, 'response', [])
                });

                const userCommunityPermissions = await this.roleAndPermissionsApi
                  .getUserPermissionsInCommunity()
                  .toPromise()
                  .then((res1: any) => res1.response);

                this.ngRedux.dispatch({
                  type: LOAD_USER_PERMISSIONS,
                  userCommunityPermissions
                });
                this.ngRedux.dispatch({
                  type: LOAD_USER_DATA,
                  user: res.response.user
                });

                this.i18nService.setLanguage(
                  get(this.defaultLanguage, 'value', 'en')
                );
                location.assign('/');
              } /* else {
                this.router.navigateByUrl('/community/select');
              } */
            } else {
              this.notifier.showError('Invalid Link');
              this.authService.logout(true);
            }
          },
          (error) => {
            this.notifier.showError('Error Happened');
            this.router.navigateByUrl('/');
          }
        );
    }
  }

  getAllEntities() {
    return this.entityApi.getEntities().toPromise();
  }

  getAppearanceSettings() {
    this.communityApi.getAppearanceSettings().subscribe((res: any) => {
      const communitySettings = res.response[0];
      this.ngRedux.dispatch({
        type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
        communityAppearance: communitySettings
      });
    });
  }

  resendInvite() {}
  get firstName() {
    return this.acceptInviteForm.get('firstName');
  }

  get lastName() {
    return this.acceptInviteForm.get('lastName');
  }

  get password() {
    return this.acceptInviteForm.get('password');
  }

  get defaultLanguage() {
    return this.acceptInviteForm.get('defaultLanguage');
  }
}
