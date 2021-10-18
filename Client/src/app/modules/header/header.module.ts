import {
  ActionItemSocketService,
  HeaderApiService,
  NotificationSocketService
} from '../../services';
import {
  ActionItemsNotificationComponent,
  HeaderComponent,
  NotificationsComponent
} from './components';

import { CommonModule } from '@angular/common';
import { CommunityModule } from '../community/community.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaModule } from '../idea/idea.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';
import { NgModule } from '@angular/core';
import { ReviewsModule } from '../reviews/reviews.module';
import { RouterModule } from '@angular/router';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { SocketIoModule } from 'ngx-socket-io';

@NgModule({
  declarations: [
    HeaderComponent,
    NotificationsComponent,
    ActionItemsNotificationComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SearchModule,
    RouterModule,
    SharedModule,
    InfiniteScrollModule,
    IdeaModule,
    ReviewsModule,
    SocketIoModule,
    LazyLoadImageModule,
    MediaModule,
    CommunityModule
  ],
  exports: [HeaderComponent],
  providers: [
    HeaderApiService,
    ActionItemSocketService,
    NotificationSocketService
  ]
})
export class HeaderModule {}
