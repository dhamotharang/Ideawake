import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SocialActivitiesApiService } from '../../services';
import { I18nModule } from '../i18n/i18n.module';
import {
  BookmarkComponent,
  FollowButtonComponent,
  FollowComponent,
  VoteComponent,
  VoteTextComponent
} from './components';

@NgModule({
  declarations: [
    FollowComponent,
    BookmarkComponent,
    VoteComponent,
    VoteTextComponent,
    FollowButtonComponent
  ],
  imports: [CommonModule, FontAwesomeModule, NgbModule, I18nModule],
  exports: [
    FollowComponent,
    BookmarkComponent,
    VoteComponent,
    VoteTextComponent,
    FollowButtonComponent,
    I18nModule
  ],
  providers: [SocialActivitiesApiService]
})
export class SocialActivityModule {}
