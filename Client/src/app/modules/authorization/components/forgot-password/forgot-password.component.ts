import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  AuthorizationApiService,
  NotificationService,
  UtilService
} from '../../../../services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [NotificationService]
})
export class ForgotPasswordComponent {
  public hideInValidEmailError = true;
  public hideEmptyFieldError = true;
  public forgotPasswordForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required, Validators.email]
  });

  constructor(
    private formBuilder: FormBuilder,
    private utilities: UtilService,
    private notifier: NotificationService,
    private authorizationApi: AuthorizationApiService
  ) {}

  async onSubmit() {
    if (this.email.value === '') {
      this.hideEmptyFieldError = false;
      return;
    }

    if (!this.utilities.isEmail(this.email.value)) {
      this.hideInValidEmailError = false;
      return;
    }

    const data = await this.checkDuplicate()
      .then((res: any) => res.response.data)
      .catch((err) =>
        this.notifier.showError('Unable to check for duplication')
      );

    if (data) {
      this.authorizationApi
        .resetUserPassword(this.email.value)
        .subscribe((result: any) => {
          if (result.statusCode === 200) {
            this.email.setValue('');
            this.notifier.showSuccess('Alerts.PasswordResetMessage');
          } else if (result.statusCode === 422) {
            this.notifier.showError('Alerts.AccountDoesntExist');
          } else {
            this.notifier.showError('Unable to send request');
          }
        });
    } else {
      this.notifier.showError('Alerts.AccountDoesntExist');
    }
  }

  checkDuplicate() {
    return this.authorizationApi
      .checkDuplicateEmail(this.email.value)
      .toPromise();
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
