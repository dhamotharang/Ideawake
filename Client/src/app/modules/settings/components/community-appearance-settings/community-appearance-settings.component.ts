import {
  COMMUNITY_APPEARANCE,
  CommunityAppearance,
  DEFAULT_PRELOADED_IMAGE,
  ENTITY_FOLDER,
  PRIMARY_COLORS
} from '../../../../utils';
import { CommunityApi, NotificationService } from '../../../../services';
import { Component, OnInit, ViewChild } from '@angular/core';

import { AppState } from '../../../../store';
import { LOAD_COMMUNITY_APPEARANCE_SETTINGS } from '../../../../actions';
import { NgRedux } from '@angular-redux/store';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-community-appearance-settings',
  templateUrl: './community-appearance-settings.component.html',
  styleUrls: ['./community-appearance-settings.component.scss'],
  providers: [CommunityApi]
})
export class CommunityAppearanceSettingsComponent implements OnInit {
  defaultImage = DEFAULT_PRELOADED_IMAGE;
  @ViewChild('defaultLogo', { static: false }) defaultLogo;
  @ViewChild('mobileLogo', { static: false }) mobileLogo;
  @ViewChild('favicon', { static: false }) favicon;
  @ViewChild('emailFeaturedImage', { static: false }) emailFeaturedImage;

  uploadingLogo = false;
  uploadingMobileLogo = false;
  uploadingFavicon = false;
  uploadingFImage = false;
  settings: CommunityAppearance;
  saved;
  backupSettings;
  s3Folder = ENTITY_FOLDER;

  appearanceSettingsEdit = false;

  primaryColors = [];

  toggleAppearanceEdit() {
    this.appearanceSettingsEdit = !this.appearanceSettingsEdit;
  }

  constructor(
    private communityApi: CommunityApi,
    private notifier: NotificationService,
    private ngRedux: NgRedux<AppState>
  ) {
    this.settings = COMMUNITY_APPEARANCE;
    this.backupSettings = cloneDeep(this.settings);
  }

  ngOnInit() {
    /* Populating primary colors from constant file */
    PRIMARY_COLORS.forEach((data) => {
      this.primaryColors.push(data.color);
    });

    this.communityApi.getAppearanceSettings().subscribe((res: any) => {
      this.saved = res.response.length !== 0;
      if (this.saved) {
        this.settings = res.response[0];
        this.backupSettings = cloneDeep(this.settings);
      }
    });
  }

  saveSettings() {
    this.appearanceSettingsEdit = false;
    if (this.saved) {
      this.editSettings();
    } else {
      this.createSettings();
    }
  }

  private createSettings() {
    this.ngRedux.dispatch({
      type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
      communityAppearance: this.settings
    });
    this.communityApi.saveAppearanceSettings(this.settings).subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showSuccess('Appearance settings updated successfully');
        }
      },
      (err) => {
        this.notifier.showError('Something Went Wrong');
      }
    );
  }

  private editSettings() {
    this.communityApi.editAppearanceSettings(this.settings).subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showSuccess('Appearance settings updated successfully');
          this.ngRedux.dispatch({
            type: LOAD_COMMUNITY_APPEARANCE_SETTINGS,
            communityAppearance: this.settings
          });
        }
      },
      (err) => {
        this.notifier.showError('Something Went Wrong');
      }
    );
  }

  openDefaultLogoUploadBox() {
    this.defaultLogo.fileInput.nativeElement.click();
  }

  openMobileLogoUploadBox() {
    this.mobileLogo.fileInput.nativeElement.click();
  }

  openFaviconUploadBox() {
    this.favicon.fileInput.nativeElement.click();
  }

  openEmailFeaturedUploadBox() {
    this.emailFeaturedImage.fileInput.nativeElement.click();
  }

  reset() {
    this.settings = cloneDeep(this.backupSettings);
  }
}
