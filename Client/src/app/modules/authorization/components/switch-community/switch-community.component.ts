import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CHANGE_CURRENT_COMMUNITY,
  LOAD_COMMUNITY_APPEARANCE_SETTINGS,
  LOAD_USER_DATA,
  LOAD_USER_PERMISSIONS,
  LOAD_ALL_ENTITIES
} from '../../../../actions';
import {
  AuthorizationApiService,
  CommunityApi,
  RoleAndPermissionsApi,
  EntityApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { I18nService } from '../../../../modules/i18n/i18n.service';
import { get } from 'lodash';
@Component({
  selector: 'app-switch-community',
  templateUrl: './switch-community.component.html',
  providers: [RoleAndPermissionsApi]
})
export class SwitchCommunityComponent implements OnInit {
  constructor(
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private roleAndPermissionsApi: RoleAndPermissionsApi,
    private authorizationApi: AuthorizationApiService,
    private communityApi: CommunityApi,
    private entityApi: EntityApiService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.authorizationApi.switchCommunityToken().subscribe(
      async (res: any) => {
        this.i18nService.setLanguage(
          get(res, 'response.user.currentCommunity.defaultLanguage', 'en')
        );
        this.ngRedux.dispatch({
          type: CHANGE_CURRENT_COMMUNITY,
          currentCommunityId: get(res, 'response.user.currentCommunity.id')
        });
        this.ngRedux.dispatch({
          type: LOAD_USER_DATA,
          user: res.response.user
        });
        const entities = await this.getAllEntities();
        this.ngRedux.dispatch({
          type: LOAD_ALL_ENTITIES,
          entities: get(entities, 'response', [])
        });
        const appearance = await this.getAppearanceSettings();
        this.ngRedux.dispatch({
          type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
          communityAppearance: get(appearance, 'response[0]', {})
        });
        const permissions: any = await this.getCommunityPermissions();
        this.ngRedux.dispatch({
          type: LOAD_USER_PERMISSIONS,
          userCommunityPermissions: permissions.response
        });
        this.router.navigateByUrl('/');
      },
      (err: any) => {
        this.router.navigate(['/auth/login'], {
          queryParams: { redirectTo: document.location.href }
        });
      }
    );
  }

  private getAppearanceSettings() {
    return this.communityApi.getAppearanceSettings().toPromise();
  }

  private getCommunityPermissions() {
    return this.roleAndPermissionsApi
      .getUserPermissionsInCommunity()
      .toPromise();
  }

  getAllEntities() {
    return this.entityApi.getEntities().toPromise();
  }
}
