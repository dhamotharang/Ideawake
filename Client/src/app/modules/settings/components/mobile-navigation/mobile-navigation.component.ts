import { get } from 'lodash';
import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_PERMISSIONS
} from '../../../../actions';
import {
  AuthService,
  CommunityApi,
  RoleAndPermissionsApi
} from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import { PostIdeaComponent } from '../../../idea/components';
import { CollectOpportunityTypeComponent } from '../../../shared/components';

@Component({
  selector: 'app-mobile-navigation',
  templateUrl: './mobile-navigation.component.html',
  styleUrls: ['./mobile-navigation.component.scss']
})
export class MobileNavigationComponent implements OnInit, OnDestroy {
  public user;
  public showLoading;
  public userCommunityPermissions;
  public communityLogo;
  public ideaQueryParam = JSON.stringify({ postedByMe: true });
  private sub1: Subscription;
  private sub2: Subscription;
  private sub3: Subscription;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private rolesAndPermissionsApi: RoleAndPermissionsApi,
    private ngRedux: NgRedux<AppState>,
    private router: Router,
    private communityApi: CommunityApi
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
        this.communityLogo = get(
          state,
          'communityAppearance.defaultLogo',
          'https://ideawake.com/wp-content/uploads/2017/11/Idewake-Innovation-Management-Logo.png'
        );
      });
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
}
