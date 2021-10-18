import { first } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  LOAD_ALL_ENTITIES
} from '../../../../actions';
import { WINDOW } from '../../../../providers';
import { I18nService } from '../../../../modules/i18n/i18n.service';
import {
  AuthService,
  CommunityApi,
  NotificationService,
  RoleAndPermissionsApi,
  EntityApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { COMMUNITY_SSO_LOGIN_ENUM, PRIMARY_COLORS } from '../../../../utils';
import { get, isEmpty, find } from 'lodash';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [RoleAndPermissionsApi]
})
export class LoginComponent implements OnInit {
  showPage = false;
  constructor(
    @Inject(WINDOW) private window: any,
    private formBuilder: FormBuilder,
    private router: Router,
    private notifier: NotificationService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngRedux: NgRedux<AppState>,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private communityApi: CommunityApi,
    private entityApi: EntityApiService,
    private i18nService: I18nService
  ) {
    let language = localStorage.getItem('language');
    if (
      language !==
      get(this.route.snapshot.data.urlInfo, 'defaultLanguage', 'en')
    ) {
      this.i18nService.setLanguage(
        get(this.route.snapshot.data.urlInfo, 'defaultLanguage', 'en')
      );
      location.reload();
    } else {
      this.showPage = true;
    }
  }

  public loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  private themeWrapper = document.querySelector('body');
  public domainName = environment.domainName;
  hideErrorMessage = true;
  submitted = false;
  redirectUri = null;
  clientId = null;
  state = null;
  loginFormValues = {};
  communityName = 'Ideawake';
  validCommunityUrl = false;
  communityId = 0;
  communitySsoLoginEnum = COMMUNITY_SSO_LOGIN_ENUM;
  communitySSO = COMMUNITY_SSO_LOGIN_ENUM.DISABLED;
  redirectTo = get(this.route.snapshot.queryParams, 'redirectTo', null);
  communityInfo = this.route.snapshot.data.urlInfo;
  ngOnInit() {
    this.validCommunityUrl = get(this.communityInfo, 'valid', false);
    this.communityName = get(this.communityInfo, 'name', 'Ideawake');
    this.communityId = get(this.communityInfo, 'id', 0);
    this.communitySSO = get(
      this.communityInfo,
      'loginWithSSO',
      COMMUNITY_SSO_LOGIN_ENUM.DISABLED
    );
    this.themeWrapper.style.setProperty(
      '--primary',
      get(this.communityInfo, 'primaryColor', '#1ab394')
    );
    const hoverColor = find(PRIMARY_COLORS, [
      'color',
      get(this.communityInfo, 'primaryColor', '#1ab394')
    ]);
    this.themeWrapper.style.setProperty(
      '--primaryHover',
      get(
        hoverColor,
        'hover-color',
        get(this.communityInfo, 'primaryColor', '#1ab394')
      )
    );

    this.route.queryParams.subscribe((params) => {
      if (params.redirect_uri) {
        this.redirectUri = params.redirect_uri;
        this.clientId = params.client_id;
        this.state = params.state;
      }
      if (params.inviteAccepted === 'false') {
        this.notifier.showError(
          'You haven’t yet accepted your invite' +
            ' to Ideawake.Please check your email' +
            ' for a confirmation link to accept your' +
            ' invite and create your account'
        );
      }
      if (params.e_status === '1' || params.e_status === '2') {
        this.notifier.showError(
          `Sorry we are unable to identify you. Please contact to your community administrator`
        );
      }
    });
    this.checkLogin();
  }

  checkLogin() {
    const payload = {
      ...(this.state && { state: this.state }),
      ...(this.clientId && { clientId: this.clientId }),
      ...(this.redirectUri && { redirectUri: this.redirectUri })
    };
    this.authService
      .checkLoggedIn(payload)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.response.appLoginData) {
          const loginData = res.response.appLoginData;
          window.location.href = `${loginData.redirectUri}?code=${loginData.code}&state=${loginData.state}&response_type=code`;
        } else {
          this.setLoginDetail(res);
        }
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.hideErrorMessage = false;
      return;
    }
    if (this.redirectUri) {
      this.loginFormValues = {
        ...this.loginForm.value,
        ...{
          clientId: this.clientId,
          redirectUri: this.redirectUri,
          state: this.state
        }
      };
    } else {
      this.loginFormValues = this.loginForm.value;
    }
    this.authService
      .login(this.loginFormValues)
      .pipe(first())
      .subscribe(
        async (res: any) => {
          if (res.response.appLoginData) {
            const loginData = res.response.appLoginData;
            window.location.href = `${loginData.redirectUri}?code=${loginData.code}&state=${loginData.state}&response_type=code`;
          } else if (
            this.validCommunityUrl ||
            this.window.location.hostname === 'localhost'
          ) {
            this.setLoginDetail(res);
            return false;
          } else {
            const url = new URL(window.location.href);
            const communityUrl = get(res.response, 'user.currentCommunity.url');
            const redirectTo = isEmpty(url.port)
              ? communityUrl
              : `${communityUrl}:${url.port}`;
            window.location.href = `${redirectTo}/auth/community`;
            return false;
          }
          this.notifier.showSuccess('Logged In', {
            positionClass: 'toast-bottom-right'
          });
        },
        (err) => {
          if (err.error && err.error.statusCode) {
            switch (err.error.statusCode) {
              case 401:
                // Password incorrect
                this.notifier.showError('Alerts.LoginIncorrect');
                break;
              case 404:
                // UserName incorrect
                this.notifier.showError('Alerts.LoginIncorrect');
                break;
              case 501:
              case 409:
                this.notifier.showError('Alerts.InviteNotAccepted');
                break;
              default:
                this.notifier.showError('Alerts.LoginIncorrect');
            }
          } else {
            this.notifier.showError('Server Error');
          }
        }
      );
  }

  async setLoginDetail(res) {
    this.i18nService.setLanguage(get(res, 'response.user.language', 'en'));
    const entities = await this.getAllEntities();
    this.ngRedux.dispatch({
      type: LOAD_ALL_ENTITIES,
      entities: get(entities, 'response', [])
    });

    this.ngRedux.dispatch({
      type: CHANGE_CURRENT_COMMUNITY,
      currentCommunityId: get(res.response, 'user.currentCommunity.id')
    });

    this.ngRedux.dispatch({
      type: LOAD_USER_DATA,
      user: res.response.user
    });

    const appearance = await this.getAppearanceSettings();
    this.ngRedux.dispatch({
      type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
      communityAppearance: get(appearance, 'response[0]', {})
    });

    const permissions = await this.getCommunityPermissions();
    this.ngRedux.dispatch({
      type: LOAD_USER_PERMISSIONS,
      userCommunityPermissions: get(permissions, 'response', {})
    });
    if (this.redirectTo && this.excludeRedirection()) {
      window.location.href = this.redirectTo;
      return false;
    } else {
      this.router.navigateByUrl('/');
      return false;
    }
  }

  excludeRedirection() {
    const url = this.redirectTo;
    return !(
      url.includes('/error/404') ||
      url.includes('/error/access-denied') ||
      url.includes('/auth/login') ||
      url.includes('/auth/search-url') ||
      url.includes('/auth/community') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/settings/update-password') ||
      url.includes('/community/select') ||
      url.includes('/community/accept/invite/')
    );
  }

  getAppearanceSettings() {
    return this.communityApi.getAppearanceSettings().toPromise();
  }

  getCommunityPermissions() {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCommunity()
      .toPromise();
  }

  getAllEntities() {
    return this.entityApi.getEntities().toPromise();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
  get loginFormControls() {
    return this.loginForm.controls;
  }
}
