import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ApiService,
  NotificationService,
  AuthService
} from '../../../../services';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notifier: NotificationService
  ) {}

  private userId;
  private resetCode;
  public submitted = false;
  resetPasswordForm: FormGroup = this.formBuilder.group(
    {
      password: ['', Validators.required],
      confirmPass: ['', Validators.required]
    },
    { validator: this.checkIfMatchingPasswords('password', 'confirmPass') }
  );

  ngOnInit() {
    this.route.paramMap.subscribe((params: any) => {
      this.resetCode = params.params.resetCode;
      this.apiService
        .get('/password-reset/' + params.params.resetCode)
        .subscribe((res: any) => {
          if (res.response.length === 0) {
            this.notifier.showError('Invalid Link');
            this.router.navigateByUrl('/auth/forgot-password');
          } else if (new Date().toISOString() > res.response[0].expiryDate) {
            this.notifier.showError('Password Link Expired');
            this.router.navigateByUrl('/auth/forgot-password');
          } else {
            this.userId = res.response[0].userId;
            this.resetCode = res.response[0].resetCode;
          }
        });
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.resetPasswordForm.status.toLowerCase() !== 'valid') {
      return;
    }
    this.apiService
      .patch('/password-reset/user', {
        password: this.resetPasswordForm.value.password,
        resetCode: this.resetCode
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.notifier.showSuccess('Password Updated Successfully');
          this.authService.logoutAPI().subscribe(
            (res: any) => {
              this.router.navigate(['/auth/login']);
            },
            (err: any) => {
              this.router.navigate(['/auth/login']);
            }
          );
        } else {
          this.notifier.showError('Something Went Wrong');
        }
      });
  }

  checkIfMatchingPasswords(
    passwordKey: string,
    passwordConfirmationKey: string
  ) {
    return (group: FormGroup) => {
      const passwordInput = group.controls[passwordKey];
      const passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }
}
