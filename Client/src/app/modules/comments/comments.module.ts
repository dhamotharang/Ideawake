import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommentApiService } from '../../services';
import { LoadersModule } from '../loaders/loaders.module';
import { SharedModule } from '../shared/shared.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { TagMentionModule } from '../tag-mention/tag-mention.module';
import { UploadsModule } from '../uploads/uploads.module';
import {
  CommentPostComponent,
  CommentReplyComponent,
  CommentsAccessDeniedComponent,
  CommentsContainerComponent,
  CommentVisibilitySettingsComponent,
  EditCommentComponent,
  ReplyComponent
} from './components';
import { ApplicationPipesModule } from '../search/pipes.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MediaModule } from '../media/media.module';

const config: SocketIoConfig = {
  url: environment.socket.commentThreadSocket,
  options: { transports: ['websocket'] }
};

@NgModule({
  declarations: [
    CommentPostComponent,
    CommentsAccessDeniedComponent,
    CommentsContainerComponent,
    ReplyComponent,
    EditCommentComponent,
    CommentReplyComponent,
    CommentVisibilitySettingsComponent
  ],
  imports: [
    CommonModule,
    UploadsModule,
    TagMentionModule,
    SharedModule,
    SocketIoModule.forRoot(config),
    RouterModule,
    SocialActivityModule,
    LoadersModule,
    ApplicationPipesModule,
    LazyLoadImageModule,
    MediaModule
  ],
  exports: [CommentsContainerComponent],
  providers: [CommentApiService]
})
export class CommentsModule {}
