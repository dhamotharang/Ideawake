import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { SettingsApiService } from '../../services';
import { CommunityNavigationModule } from '../community/community-navigation.module';
import { SharedModule } from '../shared/shared.module';
import { UploadsModule } from '../uploads/uploads.module';
import {
  BillingAndPlanComponent,
  CommunityAppearanceSettingsComponent,
  CommunityBasicSettingsComponent,
  InvitesPendingComponent,
  InvitesSendComponent,
  PointsManageComponent,
  ResetPasswordComponent,
  SecurityComponent,
  UsersListContainerComponent
} from './components';
import { CommunityGamificationContainerComponent } from './components/community-gamification-container/community-gamification-container.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { MobileNavigationComponent } from './components/mobile-navigation/mobile-navigation.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';

const config: SocketIoConfig = {
  url: environment.socket.settingsSocket,
  options: { transports: ['websocket'] }
};
// @dynamic
@NgModule({
  declarations: [
    InvitesPendingComponent,
    UsersListContainerComponent,
    InvitesSendComponent,
    ResetPasswordComponent,
    SecurityComponent,
    PointsManageComponent,
    BillingAndPlanComponent,
    CommunityAppearanceSettingsComponent,
    CommunityBasicSettingsComponent,
    SettingsComponent,
    CommunityGamificationContainerComponent,
    MobileNavigationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    CommunityNavigationModule,
    UploadsModule,
    NgxSkeletonLoaderModule,
    LazyLoadImageModule,
    MediaModule
  ],
  providers: [SettingsApiService]
})
export class SettingsModule {}
