import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DateFormatPipe } from '../../pipes';
import { SocialActivityModule } from '../social-activity/social-activity.module';
import {
  ReviewCriteriaApiService,
  ElasticSearchApiService,
  StorageService
} from '../../services';
import {
  IdeaWidgetFeedComponent,
  IdeaWidgetFeedListComponent,
  IdeaWidgetSmallComponent,
  SaveShortcutSearchComponent,
  SearchComponent,
  SearchFieldsComponent,
  SearchGroupsComponent,
  SearchInlineComponent,
  SearchNavigationComponent,
  SearchQuestionsComponent,
  SearchScorecardsComponent,
  SearchTagsComponent,
  SearchTypesComponent,
  SearchUsersComponent,
  ManagingWidgetComponent,
  AddEditShortcutSearchComponent
} from './components';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { I18nModule } from '../i18n/i18n.module';

@NgModule({
  declarations: [
    SaveShortcutSearchComponent,
    SearchComponent,
    SearchGroupsComponent,
    SearchInlineComponent,
    SearchNavigationComponent,
    SearchTagsComponent,
    SearchUsersComponent,
    IdeaWidgetFeedComponent,
    IdeaWidgetFeedListComponent,
    SearchFieldsComponent,
    SearchScorecardsComponent,
    SearchQuestionsComponent,
    SearchTypesComponent,
    DateFormatPipe,
    IdeaWidgetSmallComponent,
    ManagingWidgetComponent,
    AddEditShortcutSearchComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    NgSelectModule,
    FormsModule,
    SocialActivityModule,
    NgbModule,
    RouterModule,
    LazyLoadImageModule,
    I18nModule
  ],
  exports: [
    SaveShortcutSearchComponent,
    SearchGroupsComponent,
    SearchTagsComponent,
    SearchUsersComponent,
    SearchNavigationComponent,
    SearchInlineComponent,
    IdeaWidgetFeedComponent,
    IdeaWidgetFeedListComponent,
    IdeaWidgetSmallComponent,
    SearchFieldsComponent,
    SearchScorecardsComponent,
    SearchQuestionsComponent,
    SearchTypesComponent,
    AddEditShortcutSearchComponent,
    I18nModule,
    ManagingWidgetComponent
  ],
  entryComponents: [AddEditShortcutSearchComponent],
  providers: [ReviewCriteriaApiService, ElasticSearchApiService, StorageService]
})
export class SearchModule {}
