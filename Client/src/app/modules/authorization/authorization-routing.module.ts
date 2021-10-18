import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  ForgotPasswordComponent,
  LoginComponent,
  RegisterComponent,
  SwitchCommunityComponent,
  CommunitySearchComponent
} from './components';
import { urlDataResolver } from '../../resolvers';
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    resolve: {
      urlInfo: urlDataResolver
    }
  },
  { path: 'community', component: SwitchCommunityComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'search-url', component: CommunitySearchComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorizationRoutingModule {}
