import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  ActivityApiService,
  ProfileApiService,
  HeaderApiService
} from '../../services';
import { IdeaModule } from '../idea/idea.module';
import { SharedModule } from '../shared/shared.module';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import { MediaModule } from '../media/media.module';
import {
  CommentActivityComponent,
  CommentMentionActivityComponent,
  ContentCardComponent,
  MultiFollowerActivityComponent,
  OmniBoxComponent,
  PostActivityComponent,
  ProfileAchievementsComponent,
  ProfileActionItemsComponent,
  ProfileActivityComponent,
  ProfileBookmarksComponent,
  ProfileContainerComponent,
  ProfileFollowingComponent,
  ProfileMyContentComponent,
  ProfileTopContainerComponent
} from './components';
import { ProfileRoutingModule } from './profile-routing.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

// @dynamic
@NgModule({
  declarations: [
    OmniBoxComponent,
    ProfileAchievementsComponent,
    ProfileActivityComponent,
    ProfileBookmarksComponent,
    ProfileContainerComponent,
    ProfileFollowingComponent,
    ProfileMyContentComponent,
    ProfileTopContainerComponent,
    PostActivityComponent,
    MultiFollowerActivityComponent,
    CommentActivityComponent,
    ContentCardComponent,
    CommentMentionActivityComponent,
    ProfileActionItemsComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FontAwesomeModule,
    SharedModule,
    ReactiveFormsModule,
    SocialActivityModule,
    IdeaModule,
    LazyLoadImageModule,
    MediaModule
  ],
  providers: [ProfileApiService, ActivityApiService, HeaderApiService],
  exports: [OmniBoxComponent]
})
export class ProfileModule {}
