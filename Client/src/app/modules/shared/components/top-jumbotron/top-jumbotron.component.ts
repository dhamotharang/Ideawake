import { AppState, STATE_TYPES, UserState } from '../../../../store';
import {
  COMMUNITY_APPEARANCE,
  CommunityAppearance,
  DEFAULT_PRELOADED_IMAGE
} from '../../../../utils';
import {
  CommunityApi,
  NotificationService,
  SharedApi
} from '../../../../services';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, findIndex, first, replace } from 'lodash';

import { LOAD_COMMUNITY_APPEARANCE_SETTINGS } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UploadSingleFileComponent } from '../../../uploads/components';

@Component({
  selector: 'app-top-jumbotron',
  templateUrl: './top-jumbotron.component.html',
  styleUrls: ['./top-jumbotron.component.scss']
})
export class TopJumbotronComponent implements OnInit, OnDestroy {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @Input() jumbotron: CommunityAppearance;

  saved = true;
  backupJumbotron;
  currentCommunityName;
  hideErrorMessage = true;
  isLoading = true;

  userCommunityPermissions;
  sub: Subscription;

  constructor(
    private modalService: NgbModal,
    private sharedApi: SharedApi,
    private ngRedux: NgRedux<AppState>,
    private communityApi: CommunityApi,
    private notifier: NotificationService
  ) {
    this.sub = this.ngRedux
      .select(STATE_TYPES.userState)
      .subscribe((userState: UserState) => {
        this.userCommunityPermissions = userState.userCommunityPermissions;
      });
  }

  ngOnInit() {
    this.isLoading = true;
    const userState = this.ngRedux.getState().userState;
    const foundData = findIndex(
      userState.user.communities,
      (o) => o.id === userState.currentCommunityId
    );

    this.jumbotron = COMMUNITY_APPEARANCE;

    this.sharedApi.getJumbotronSettings().subscribe((res: any) => {
      if (res.response.length) {
        const response = first(res.response);
        this.jumbotron = { ...response };

        this.jumbotron.jumbotronBackgroundImage =
          !response.jumbotronBackgroundImage ||
          response.jumbotronBackgroundImage === ''
            ? COMMUNITY_APPEARANCE.jumbotronBackgroundImage
            : response.jumbotronBackgroundImage;

        this.jumbotron.jumbotronPageTitle =
          !response.jumbotronPageTitle || response.jumbotronPageTitle === ''
            ? COMMUNITY_APPEARANCE.jumbotronPageTitle
            : response.jumbotronPageTitle;

        this.jumbotron.jumbotronPageDescription =
          !response.jumbotronPageDescription ||
          response.jumbotronPageDescription === ''
            ? COMMUNITY_APPEARANCE.jumbotronPageDescription
            : response.jumbotronPageDescription;
      } else {
        this.saved = false;
      }

      this.backupJumbotron = cloneDeep(this.jumbotron);

      this.jumbotron.jumbotronPageTitle = replace(
        this.jumbotron.jumbotronPageTitle,
        '{{communityName}}',
        userState.user.communities[foundData].name
      );

      this.jumbotron.jumbotronPageDescription = replace(
        this.jumbotron.jumbotronPageDescription,
        '{{communityName}}',
        userState.user.communities[foundData].name
      );
      this.isLoading = false;
    });
  }

  openModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      size: 'lg'
    });
  }

  openSingleFileUpload() {
    const modalRef = this.modalService.open(UploadSingleFileComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.file.subscribe(
      (image) => (this.jumbotron.jumbotronBackgroundImage = image)
    );
  }

  removeImage() {
    this.jumbotron.jumbotronBackgroundImage = '';
  }

  saveChanges(modal) {
    if (
      this.jumbotron.jumbotronPageDescription === '' ||
      this.jumbotron.jumbotronPageTitle === ''
    ) {
      this.hideErrorMessage = false;
      return;
    }

    this.hideErrorMessage = true;

    if (this.saved) {
      this.sharedApi.editJumbotronSettings(this.jumbotron).subscribe((res) => {
        this.ngRedux.dispatch({
          type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
          communityAppearance: this.jumbotron
        });
      });
    } else {
      this.communityApi
        .saveAppearanceSettings(this.jumbotron)
        .subscribe((res) => {
          this.ngRedux.dispatch({
            type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
            communityAppearance: this.jumbotron
          });
          this.notifier.showSuccess('Jumbotron updated successfully');
        });
    }
    this.sharedApi.editJumbotronSettings(this.jumbotron).subscribe((res) => {
      this.ngRedux.dispatch({
        type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
        communityAppearance: this.jumbotron
      });
      this.notifier.showSuccess('Jumbotron updated successfully');
    });
    modal.close();
  }

  reset(modal) {
    this.jumbotron = cloneDeep(this.backupJumbotron);
    modal.close();
  }

  updateDescription(event) {
    this.jumbotron.jumbotronPageDescription = event;
  }

  updateTitle(event) {
    this.jumbotron.jumbotronPageTitle = event;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
