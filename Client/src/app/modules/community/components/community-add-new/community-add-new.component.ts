import { NgRedux } from '@angular-redux/store';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toLower, get, isEmpty } from 'lodash';
import { environment } from '../../../../../environments/environment';
import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  LOAD_ALL_ENTITIES
} from '../../../../actions';
import {
  CommunityApi,
  NotificationService,
  RoleAndPermissionsApi,
  EntityApiService,
  AuthorizationApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { COMMUNITY_SSO_LOGIN_ENUM } from '../../../../utils';
import { I18nService } from '../../../../modules/i18n/i18n.service';
@Component({
  selector: 'app-community-add-new',
  templateUrl: './community-add-new.component.html',
  styleUrls: ['./community-add-new.component.scss']
})
export class CommunityAddNewComponent implements OnInit, AfterViewInit {
  @ViewChild('commName', { static: false }) commNameElement: ElementRef;
  @Output() newCommunity = new EventEmitter();

  public hideDuplicateErrorMessage = true;
  public hideErrorMessage: boolean;
  public communityAddNewForm = this.formBuilder.group({
    communityName: ['', Validators.required],
    communityDescription: ['', Validators.required],
    communityUrl: ['', Validators.required]
  });
  public modal;
  public domainName = environment.domainName;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private communityApi: CommunityApi,
    private entityApi: EntityApiService,
    private authorizationApiService: AuthorizationApiService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.hideErrorMessage = true;
  }

  ngAfterViewInit() {
    this.commNameElement.nativeElement.focus();
  }

  async onSubmit() {
    if (!this.hideDuplicateErrorMessage) {
      return;
    }
    const communityInfo = {
      name: this.communityName.value,
      description: this.communityDescription.value,
      url: `http://${this.communityUrl.value.toLowerCase()}.${this.domainName}`,
      visibility: 'Private',
      isOpen: true,
      loginWithSSO: COMMUNITY_SSO_LOGIN_ENUM.DISABLED,
      lastLogin: new Date().toDateString(),
      ...(get(
        this.ngRedux.getState(),
        'registrationState.user.defaultLanguage'
      ) && {
        defaultLanguage: get(
          this.ngRedux.getState(),
          'registrationState.user.defaultLanguage'
        )
      })
    };

    if (this.communityAddNewForm.valid) {
      const count = await this.communityApi
        .checkDuplicateCommunities(
          `${this.communityUrl.value}.${this.domainName}`
        )
        .toPromise()
        .then((res: any) => res.response.count);

      if (count >= 1) {
        this.hideDuplicateErrorMessage = false;
      } else {
        if (this.modal) {
          this.addNewCommunity(communityInfo);
        } else {
          this.hideDuplicateErrorMessage = true;
          this.registerTenant({
            user: this.ngRedux.getState().registrationState.user,
            community: communityInfo
          });
        }
      }
    } else {
      this.hideErrorMessage = false;
    }
  }

  checkDuplicateURL() {
    this.communityApi
      .checkDuplicateCommunities(
        `${this.communityUrl.value}.${this.domainName}`
      )
      .subscribe((res: any) => {
        this.hideDuplicateErrorMessage = !(res.response.count >= 1);
      });
  }

  registerTenant(userInfo) {
    this.authorizationApiService
      .registerTenant(userInfo)
      .subscribe(async (response: any) => {
        this.notifier.showSuccess('Community Created');
        const data = response.response.user;
        this.i18nService.setLanguage(
          get(data, 'currentCommunity.defaultLanguage', 'en')
        );
        if (
          get(data, 'currentCommunity.url', false) &&
          this.domainName !== 'localhost'
        ) {
          const url = new URL(window.location.href);
          const communityUrl = get(data, 'currentCommunity.url', false);
          const redirectTo = isEmpty(url.port)
            ? communityUrl
            : `${communityUrl}:${url.port}`;
          window.location.href = `${redirectTo}/auth/community`;
          return false;
        } else {
          data.communities = [response.response.community];
          this.ngRedux.dispatch({ type: LOAD_USER_DATA, user: data });
          this.ngRedux.dispatch({
            type: CHANGE_CURRENT_COMMUNITY,
            currentCommunityId: response.response.community.id
          });
          this.getAppearanceSettings();
          const permissions = await this.getCommunityPermissions();
          this.ngRedux.dispatch({
            type: LOAD_USER_PERMISSIONS,
            userCommunityPermissions: get(permissions, 'response', {})
          });

          const entities = await this.getAllEntities();
          this.ngRedux.dispatch({
            type: LOAD_ALL_ENTITIES,
            entities: get(entities, 'response', [])
          });

          this.router.navigateByUrl('/community/send/invites', {
            state: { data: userInfo.communityInfo, user: response }
          });
        }
      });
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

  getCommunityPermissions() {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCommunity()
      .toPromise();
  }

  setCommunityUrl(value) {
    let url = toLower(value);
    url = url.replace(/[^\w\s-]/gi, ''); // Remove Special Characters
    url = url.replace(/\s/g, '-'); // Replace space with
    url = url.replace(/_/g, ''); // Remove underscore
    this.communityUrl.setValue(url);
  }

  get communityName() {
    return this.communityAddNewForm.get('communityName');
  }

  get communityDescription() {
    return this.communityAddNewForm.get('communityDescription');
  }

  get communityUrl() {
    return this.communityAddNewForm.get('communityUrl');
  }

  addNewCommunity(body) {
    this.communityApi
      .createNewCommunityUnderATenant({
        ...body,
        community: this.ngRedux.getState().userState.currentCommunityId
      })
      .subscribe((res: any) => {
        this.notifier.showSuccess('Community Created');
        const userInfo = this.ngRedux.getState().userState.user;
        if (userInfo.communities && userInfo.communities.length) {
          userInfo.communities.push(res.response);
        } else {
          userInfo.communities = [res.response];
        }
        this.ngRedux.dispatch({
          type: LOAD_USER_DATA,
          user: userInfo
        });
        this.newCommunity.emit(res.response);
      });
  }
}
