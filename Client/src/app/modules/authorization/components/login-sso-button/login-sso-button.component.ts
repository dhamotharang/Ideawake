import { environment } from './../../../../../environments/environment';
import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-login-sso-button',
  templateUrl: './login-sso-button.component.html',
  styleUrls: ['./login-sso-button.component.scss']
})
export class LoginSsoButtonComponent implements OnChanges {
  @Input() onlySSO = false;
  @Input() community = 0;
  public backendApiUrl = environment.backendApiUrl;
  constructor() {}

  ngOnChanges() {
    /* if (this.onlySSO) {
      this.loginSso();
    } */
  }

  loginSso() {
    if (this.community && this.community > 0) {
      window.location.href = `${this.backendApiUrl}/auth/saml?community=${this.community}`;
      return false;
    }
  }
}
