import { Subscription } from 'rxjs';

import { NgRedux } from '@angular-redux/store';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { LOAD_REGISTRATION_FORM_DATA } from '../../../../actions';
import { AuthorizationApiService } from '../../../../services';
import { AppState, RegistrationState, STATE_TYPES } from '../../../../store';
import { LANGUAGES } from '../../../../utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  public submitted = false;
  public hideDuplicateErrorMessage = true;
  public hideErrorMessage: boolean;
  public languages = LANGUAGES;
  public user;
  public registrationForm;

  private subscription: Subscription;

  @ViewChild('fName', { static: false }) firstNameElement: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ngRedux: NgRedux<AppState>,
    private authorizationApi: AuthorizationApiService
  ) {}

  ngOnInit() {
    this.subscription = this.ngRedux
      .select(STATE_TYPES.registrationState)
      .subscribe((state: RegistrationState) => {
        this.registrationForm = this.formBuilder.group({
          firstName: [state.user.firstName, [Validators.required]],
          lastName: [state.user.lastName, [Validators.required]],
          email: [state.user.email, [Validators.required, Validators.email]],
          userName: [
            state.user.userName,
            [Validators.required, Validators.pattern('[a-zA-Z0-9 ]*')]
          ],
          defaultLanguage: [
            state.user.defaultLanguage === ''
              ? 'en'
              : state.user.defaultLanguage
          ],
          password: [state.user.password, [Validators.required]]
        });
      });
    this.hideErrorMessage = true;
  }

  ngAfterViewInit() {
    this.firstNameElement.nativeElement.focus();
  }

  async onSubmit() {
    const companyInfo = {
      ...this.registrationForm.value,
      isSSO: false,
      lastLogin: new Date().toDateString(),
      role: 'Admin'
    };

    this.submitted = true;

    if (this.registrationForm.valid) {
      const data = await this.authorizationApi
        .checkDuplicateEmail(this.email.value)
        .toPromise()
        .then((res: any) => res.response.data);

      if (data) {
        this.hideDuplicateErrorMessage = false;
      } else {
        this.ngRedux.dispatch({
          type: LOAD_REGISTRATION_FORM_DATA,
          user: companyInfo
        });

        this.router.navigateByUrl('/community/add');
      }
    } else {
      this.hideErrorMessage = false;
    }
  }

  checkDuplicateEmail() {
    this.authorizationApi
      .checkDuplicateEmail(this.email.value)
      .subscribe((res: any) => {
        if (res.response.data) {
          this.hideDuplicateErrorMessage = false;
        } else {
          this.hideDuplicateErrorMessage = true;
        }
      });
  }

  get firstName() {
    return this.registrationForm.get('firstName');
  }

  get lastName() {
    return this.registrationForm.get('lastName');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get userName() {
    return this.registrationForm.get('userName');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get defaultLanguage() {
    return this.registrationForm.get('defaultLanguage');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
