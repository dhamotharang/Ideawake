import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WINDOW_PROVIDERS } from '../../providers';
import { AuthorizationApiService } from '../../services';
import { SharedModule } from '../shared/shared.module';
import { AuthorizationRoutingModule } from './authorization-routing.module';
import { LoadersModule } from '../../modules/loaders/loaders.module';
import { urlDataResolver } from '../../resolvers';
import {
  ForgotPasswordComponent,
  LoginComponent,
  LoginSsoButtonComponent,
  RegisterComponent,
  SwitchCommunityComponent,
  CommunitySearchComponent
} from './components';

// @dynamic
@NgModule({
  declarations: [
    RegisterComponent,
    LoginSsoButtonComponent,
    LoginComponent,
    ForgotPasswordComponent,
    SwitchCommunityComponent,
    CommunitySearchComponent
  ],
  imports: [
    CommonModule,
    AuthorizationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LoadersModule
  ],
  providers: [AuthorizationApiService, WINDOW_PROVIDERS, urlDataResolver]
})
export class AuthorizationModule {
  constructor() {}
}
