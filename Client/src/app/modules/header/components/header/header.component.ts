import { AppState, STATE_TYPES } from '../../../../store';
import {
  AuthService,
  CommunityApi,
  RoleAndPermissionsApi
} from '../../../../services';
import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_DYNAMIC_TRANSLATION,
  LOAD_USER_PERMISSIONS
} from '../../../../actions';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { get, isEmpty, find, filter, head } from 'lodash';

import { AddEditDashboardComponent } from '../../../community/components/add-edit-dashboard/add-edit-dashboard.component';
import { CollectOpportunityTypeComponent } from '../../../shared/components';
import {
  DEFAULT_PRELOADED_IMAGE,
  LANGUAGES,
  PRIMARY_COLORS
} from '../../../../utils';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostIdeaComponent } from '../../../idea/components';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthService, DashboardService]
})
export class HeaderComponent implements OnInit, OnDestroy {
  dashDesc;
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  public showCreateDropUp = false;
  public loggedIn = false;
  public user;
  public showLoading;
  public userCommunityPermissions;
  public communityLogo;
  public ideaQueryParam = JSON.stringify({ postedByMe: true });
  private sub1: Subscription;
  private sub2: Subscription;
  private sub3: Subscription;
  public domainName = environment.domainName;
  private themeWrapper = document.querySelector('body');
  dashboards;
  isTranslation;
  defaultLanguage;
  public languages = LANGUAGES;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private rolesAndPermissionsApi: RoleAndPermissionsApi,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private communityApi: CommunityApi,
    private dashboardApi: DashboardService
  ) {
    this.showLoading = false;
  }

  ngOnInit() {
    this.sub1 = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.user = state.user;
        this.userCommunityPermissions = state.userCommunityPermissions;
      });

    this.sub2 = this.ngRedux
      .select(STATE_TYPES.activityIndicatorState)
      .subscribe((state: any) => {
        this.showLoading = state.activityIndicatorShown;
      });

    this.sub3 = this.ngRedux
      .select(STATE_TYPES.communitySettingsState)
      .subscribe((state: any) => {
        this.themeWrapper.style.setProperty(
          '--primary',
          get(state, 'communityAppearance.primaryColor', '#1ab394')
        );

        let hoverColor: string = this.findHoverColor(
          state.communityAppearance.primaryColor
        );
        this.themeWrapper.style.setProperty(
          '--primaryHover',
          get(state, hoverColor, hoverColor)
        );
        this.communityLogo = get(
          state,
          'communityAppearance.defaultLogo',
          'https://ideawake.com/wp-content/uploads/2017/11/Idewake-Innovation-Management-Logo.png'
        );
      });
    this.getAllDashboards();
    this.getCommTranslationSetting();
  }

  /* Find hover color matching PRIMARY_COLORS from constants file*/

  findHoverColor(value) {
    let result = find(PRIMARY_COLORS, ['color', value]);
    if (result) {
      return result['hover-color'];
    }
    return '#17a185';
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

  openPostChallenge() {
    const modalRef = this.modalService.open(CollectOpportunityTypeComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.data.subscribe((result) => {
      modalRef.close('success');
      this.router.navigate(['/challenges/post'], {
        queryParams: { opportunityType: result.id }
      });
    });
  }

  openPostIdea() {
    const modalRef = this.modalService.open(PostIdeaComponent, {
      windowClass: 'post-idea-modal',
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modalRef = modalRef;
  }

  open(content) {
    this.modalService.open(content, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  switchCommunityUrl(community) {
    // const communityUrl = new URL(community.url);
    const url = new URL(window.location.href);
    const redirectTo = isEmpty(url.port)
      ? community.url
      : `${community.url}:${url.port}`;
    window.location.href = `${redirectTo}/auth/community`;
    return false;
  }

  async changeCommunity(community) {
    this.ngRedux.dispatch({
      type: CHANGE_CURRENT_COMMUNITY,
      currentCommunityId: community.id
    });

    const userCommunityPermissions = await this.rolesAndPermissionsApi
      .getUserPermissionsInCommunity()
      .toPromise()
      .then((res1: any) => res1.response);

    this.ngRedux.dispatch({
      type: LOAD_USER_PERMISSIONS,
      userCommunityPermissions
    });
    this.getAppearanceSettings();
    this.router.navigateByUrl('/');
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
    if (this.sub3) {
      this.sub3.unsubscribe();
    }
  }

  openCreateDashboard() {
    const modalRef = this.modalService.open(AddEditDashboardComponent, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    });

    modalRef.componentInstance.added.subscribe(() => this.getAllDashboards());
  }

  getMyCommunities() {
    const communities = get(this.user, 'communities', []);
    const currentTenantId = get(this.user, 'currentCommunity.tenantId');
    return filter(communities, { tenantId: currentTenantId });
  }

  private async getAllDashboards() {
    this.dashboards = get(
      await this.dashboardApi
        .getCommunityDashBoards({ isDeleted: false })
        .toPromise(),
      'response'
    );
  }

  languageTitle(key) {
    return get(find(this.languages, ['key', key]), 'title', key);
  }

  getCommTranslationSetting() {
    const currentCommunityId = localStorage.getItem('selectedCommunity');
    this.communityApi
      .getCommunityById(currentCommunityId)
      .subscribe((res: any) => {
        const data = head(res.response);
        this.isTranslation = get(data, 'isTranslation', false);
        this.defaultLanguage = get(
          localStorage.getItem('currentUser'),
          'language',
          'en'
        );
      });
  }
  enableTranslation() {
    this.isTranslation = false;
    this.ngRedux.dispatch({
      type: LOAD_DYNAMIC_TRANSLATION,
      settings: { language: this.defaultLanguage, isDynamicTranslation: true }
    });
    // localStorage.setItem(
    //   'translation',
    //   localStorage.getItem('translation') === 'true' ? 'false' : 'true'
    // );
  }
}
