import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  CardsLoaderComponent,
  ContentCardLoaderComponent,
  ContentListLoaderComponent,
  FilterLoaderComponent,
  FormLoaderComponent,
  ListLoaderComponent,
  LoaderComponent,
  OpportunityPageLoaderComponent,
  PageLoaderComponent,
  SkSpinnerComponent,
  StageProgressLoaderComponent,
  WidgetLoaderComponent
} from './components';
import { ChallengeTopLoaderComponent } from './components/challenge-top-loader/challenge-top-loader.component';
import { CommentsLoaderComponent } from './components/comments-loader/comments-loader.component';
import { JumbotronLoaderComponent } from './components/jumbotron-loader/jumbotron-loader.component';

@NgModule({
  declarations: [
    LoaderComponent,
    PageLoaderComponent,
    SkSpinnerComponent,
    CardsLoaderComponent,
    OpportunityPageLoaderComponent,
    ListLoaderComponent,
    ContentCardLoaderComponent,
    ContentListLoaderComponent,
    FormLoaderComponent,
    WidgetLoaderComponent,
    FilterLoaderComponent,
    StageProgressLoaderComponent,
    JumbotronLoaderComponent,
    ChallengeTopLoaderComponent,
    CommentsLoaderComponent
  ],
  imports: [CommonModule, NgxSkeletonLoaderModule],
  exports: [
    LoaderComponent,
    PageLoaderComponent,
    SkSpinnerComponent,
    CardsLoaderComponent,
    OpportunityPageLoaderComponent,
    ListLoaderComponent,
    ContentCardLoaderComponent,
    ContentListLoaderComponent,
    FormLoaderComponent,
    WidgetLoaderComponent,
    FilterLoaderComponent,
    StageProgressLoaderComponent,
    ChallengeTopLoaderComponent,
    JumbotronLoaderComponent,
    CommentsLoaderComponent
  ]
})
export class LoadersModule {}
