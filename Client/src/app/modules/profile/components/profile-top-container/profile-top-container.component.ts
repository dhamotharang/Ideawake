import { find } from 'lodash';

import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ProfileApiService, SettingsApiService } from '../../../../services';
import { AppState, STATE_TYPES } from '../../../../store';
import {
  PROFILE_PAGE_TABS,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-top-container',
  templateUrl: './profile-top-container.component.html',
  styleUrls: ['./profile-top-container.component.scss'],
  providers: [ProfileApiService, SettingsApiService]
})
export class ProfileTopContainerComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  closeResult: string;
  @Input() user;
  @Input() profileId = this.activatedRoute.snapshot.params.id;
  public skills;
  public communityId = this.ngRedux.getState().userState.currentCommunityId;
  public currentCommunity = find(
    this.ngRedux.getState().userState.user.communities,
    ['id', this.communityId]
  );
  public currentUser;
  public isDeleted = false;
  public communityPermissions = this.ngRedux.getState().userState
    .userCommunityPermissions;
  public queryParams: any = this.activatedRoute.snapshot.queryParams;
  public profileTabs = PROFILE_PAGE_TABS;
  public tab = PROFILE_PAGE_TABS.SUMMARY.key;
  public objectKeys = Object.keys;
  public currentCommunityRole;
  private sub: Subscription;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private profileApiService: ProfileApiService,
    private ngRedux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.profileId = parseInt(params.id, 10);
      this.currentUser =
        this.profileId === this.ngRedux.getState().userState.user.id
          ? true
          : false;
      this.tab = this.queryParams.tab || PROFILE_PAGE_TABS.SUMMARY.key;
      this.subscribeUser();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.tab = params.tab || PROFILE_PAGE_TABS.SUMMARY.key;
      this.subscribeUser();
    });

    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((state: any) => {
        this.user = state.user;
      });
  }
  ngOnDestroy() {}
  navigateTo(params) {
    this.tab = params.tab;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params
    });
  }

  subscribeUser() {
    this.isDeleted = false;
    if (this.currentUser) {
      this.user = this.ngRedux.getState().userState.user;
      this.setCurrentCommunityRole();
    } else {
      this.profileApiService.getUser(this.profileId).subscribe((res: any) => {
        this.user = res.response[0];
        if (!this.user) {
          this.router.navigateByUrl('/error/404');
        } else {
          this.isDeleted = find(this.user.userCommunities, [
            'communityId',
            this.communityId
          ]).isDeleted;
          this.setCurrentCommunityRole();
        }
      });
    }
  }

  setCurrentCommunityRole() {
    this.currentCommunityRole = find(this.user.roles, [
      'communityId',
      this.communityId
    ]);
  }

  open(content) {
    this.modalService.open(content, {
      windowClass: 'custom-field-modal',
      ariaLabelledBy: 'modal-basic-title'
    });
  }
}
