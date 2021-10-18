import { IndividualConfig, ToastrService } from 'ngx-toastr';

import { Injectable } from '@angular/core';
import { I18nService } from 'src/app/modules/i18n/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService, private I18n: I18nService) {}

  private title = '';
  private defaultConfig: Partial<IndividualConfig> = {
    positionClass: 'toast-top-center'
  };

  showSuccess(path, config: Partial<IndividualConfig> = this.defaultConfig) {
    this.toastr.success(this.I18n.getTranslation(path), this.title, config);
  }

  showError(path, config: Partial<IndividualConfig> = this.defaultConfig) {
    this.toastr.error(this.I18n.getTranslation(path), this.title, config);
  }

  showWarning(path, config: Partial<IndividualConfig> = this.defaultConfig) {
    this.toastr.warning(this.I18n.getTranslation(path), this.title, config);
  }

  showInfo(path, config: Partial<IndividualConfig> = this.defaultConfig) {
    this.toastr.info(this.I18n.getTranslation(path), this.title, config);
  }
}
