import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MentionModule } from '../../../assets/mentions';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchModule } from '../search/search.module';
import {
  MentionableTextareaComponent,
  MentionAddComponent,
  MentionInlineComponent,
  TagAddComponent,
  TagEditComponent,
  TagInlineComponent,
  TagsComponent,
  TagsManageComponent
} from './components';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    MentionAddComponent,
    MentionInlineComponent,
    MentionableTextareaComponent,
    TagAddComponent,
    TagEditComponent,
    TagInlineComponent,
    TagsComponent,
    TagsManageComponent
  ],
  imports: [
    CommonModule,
    MentionModule,
    FontAwesomeModule,
    NgbPopoverModule,
    SearchModule,
    LazyLoadImageModule
  ],
  exports: [
    MentionAddComponent,
    MentionInlineComponent,
    MentionableTextareaComponent,
    TagAddComponent,
    TagEditComponent,
    TagInlineComponent,
    TagsComponent,
    TagsManageComponent
  ]
})
export class TagMentionModule {}
