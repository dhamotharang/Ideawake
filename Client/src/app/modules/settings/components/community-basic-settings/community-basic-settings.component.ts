import { get, head, find } from 'lodash';
import { NgRedux } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  CommunityApi,
  NotificationService,
  UtilService,
  AuthorizationApiService
} from '../../../../services';
import { AppState } from '../../../../store';
import { COMMUNITY_SSO_LOGIN_ENUM } from '../../../../utils';
import { LANGUAGES } from '../../../../utils';
import { I18nService } from '../../../../modules/i18n/i18n.service';
@Component({
  selector: 'app-community-basic-settings',
  templateUrl: './community-basic-settings.component.html',
  styleUrls: ['./community-basic-settings.component.scss']
})
export class CommunityBasicSettingsComponent implements OnInit {
  editSettings = false;
  allowSSO = false;
  samlUrl = '';
  communitySsoLoginEnum = COMMUNITY_SSO_LOGIN_ENUM;
  form: FormGroup;
  public languages = LANGUAGES;
  constructor(
    private fb: FormBuilder,
    private ngRedux: NgRedux<AppState>,
    private communityApi: CommunityApi,
    private utilService: UtilService,
    private authorizationApiService: AuthorizationApiService,
    private notificationService: NotificationService,
    private i18nService: I18nService
  ) {}

  toggleEdit() {
    this.editSettings = !this.editSettings;
  }

  copy(str) {
    this.utilService.copyToClipboard(str);
    this.notificationService.showSuccess('Alerts.LinkClipboard');
  }

  ngOnInit() {
    this.initializeForm();
    const currentCommunityId = this.ngRedux.getState().userState
      .currentCommunityId;
    this.communityApi
      .getCommunityById(currentCommunityId)
      .subscribe((res: any) => {
        this.communityForm(head(res.response));
      });
    this.ssoForm();
  }

  ssoForm() {
    this.authorizationApiService.samlRedirectUrl().subscribe((res: any) => {
      this.samlUrl = res.response.url;
    });
    const params = {
      community: this.ngRedux.getState().userState.currentCommunityId,
      isDeleted: false
    };
    this.authorizationApiService
      .authIntegrations(params)
      .subscribe((res: any) => {
        const data = head(res.response);
        this.form.controls.loginUrl.setValue(get(data, 'loginUrl', null));
        this.form.controls.clientId.setValue(get(data, 'clientId', null));
      });
  }

  initializeForm = () => {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null],
      clientId: [null],
      loginUrl: [null],
      defaultLanguage: ['en'],
      url: [null, Validators.required],
      loginWithSSO: [COMMUNITY_SSO_LOGIN_ENUM.DISABLED, Validators.required],
      isTranslation: [false]
    });
  };

  languageTitle(key) {
    return get(find(this.languages, ['key', key]), 'title', key);
  }

  communityForm = (dataSet?) => {
    let url = null;
    if (get(dataSet, 'url', false)) {
      url = new URL(dataSet.url);
      this.form.controls.url.setValue(get(url, 'host', null));
    }
    this.form.controls.name.setValue(get(dataSet, 'name', null));
    this.form.controls.description.setValue(get(dataSet, 'description', null));
    this.form.controls.defaultLanguage.setValue(
      get(dataSet, 'defaultLanguage', 'en')
    );
    this.form.controls.isTranslation.setValue(
      get(dataSet, 'isTranslation', false)
    );
    this.form.controls.loginWithSSO.setValue(
      get(dataSet, 'loginWithSSO', COMMUNITY_SSO_LOGIN_ENUM.DISABLED)
    );
    this.allowSSO = false;
    if (
      get(dataSet, 'loginWithSSO', COMMUNITY_SSO_LOGIN_ENUM.DISABLED) !==
      COMMUNITY_SSO_LOGIN_ENUM.DISABLED
    ) {
      this.allowSSO = true;
      this.form.controls.loginUrl.setValidators([Validators.required]);
      this.form.controls.loginUrl.updateValueAndValidity();
      this.form.controls.clientId.setValidators([Validators.required]);
      this.form.controls.clientId.updateValueAndValidity();
    }
  };

  isSSOAllowed() {
    if (this.allowSSO) {
      this.form.controls.loginUrl.setValidators([Validators.required]);
      this.form.controls.loginUrl.updateValueAndValidity();
      this.form.controls.clientId.setValidators([Validators.required]);
      this.form.controls.clientId.updateValueAndValidity();
      this.form.controls.loginWithSSO.setValue(COMMUNITY_SSO_LOGIN_ENUM.BOTH);
    } else {
      this.form.controls.loginUrl.setValidators([]);
      this.form.controls.loginUrl.updateValueAndValidity();
      this.form.controls.clientId.setValidators([]);
      this.form.controls.clientId.updateValueAndValidity();
      this.form.controls.loginWithSSO.setValue(
        COMMUNITY_SSO_LOGIN_ENUM.DISABLED
      );
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const currentCommunityId = this.ngRedux.getState().userState
        .currentCommunityId;
      const formData = this.form.value;
      const communityData = {
        name: formData.name,
        description: formData.description,
        loginWithSSO: formData.loginWithSSO,
        defaultLanguage: formData.defaultLanguage || 'en',
        isTranslation: formData.isTranslation
      };
      this.communityApi
        .editCommunity(currentCommunityId, communityData)
        .subscribe((res) => {
          this.notificationService.showSuccess(
            'Community Edited Successfully.'
          );
          // let language = localStorage.getItem('language');
          // if (language !== get(formData, 'defaultLanguage', 'en')) {
          //   this.i18nService.setLanguage(
          //     get(formData, 'defaultLanguage', 'en')
          //   );
          //   location.reload();
          // }
        });
      const ssoData = {
        loginUrl: formData.loginUrl,
        clientId: formData.clientId,
        community: currentCommunityId
      };
      this.authorizationApiService
        .updateAuthIntegrations(ssoData)
        .subscribe((res) => {});
    }
  }
}
