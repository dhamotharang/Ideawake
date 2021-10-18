import { Angulartics2Module } from 'angulartics2';
import { ToastrModule } from 'ngx-toastr';

import { NgRedux, NgReduxModule } from '@angular-redux/store';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccessGuard, AuthGuard, EditChallengeAccessGuard } from './guards';
import { HeaderModule } from './modules/header/header.module';
import { LoadersModule } from './modules/loaders/loaders.module';
import { SharedModule } from './modules/shared/shared.module';
import { KeysPipe } from './pipes';
import { UserDetailResolver } from './resolvers';
import {
  ApiService,
  AuthService,
  EntityApiService,
  RequestInterceptor,
  RoleAndPermissionsApi,
  StorageService,
  UtilService
} from './services';
import { AppState, INITIAL_APP_STATE, rootReducer } from './store';

// @dynamic
@NgModule({
  declarations: [AppComponent, KeysPipe],
  imports: [
    CommonModule,
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule,
    SharedModule.forRoot(),
    ToastrModule.forRoot(),
    NgReduxModule,
    LoadersModule,
    HeaderModule,
    Angulartics2Module.forRoot()
  ],
  providers: [
    AuthGuard,
    AuthService,
    AccessGuard,
    ApiService,
    EntityApiService,
    RoleAndPermissionsApi,
    UserDetailResolver,
    StorageService,
    UtilService,
    EditChallengeAccessGuard
    // { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary, ngRedux: NgRedux<AppState>) {
    library.addIconPacks(fas);
    ngRedux.configureStore(
      rootReducer,
      INITIAL_APP_STATE /* ,
      environment.production ? [] : [] */
    );
  }
}
