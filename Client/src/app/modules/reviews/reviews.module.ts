import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CDKModule } from '../../cdk-module';
import { ReviewCriteriaApiService } from '../../services';
import { ActionItemsListByProfileModule } from '../action-items/action-items-list-by-profile.module';
import {
  AddCriteriaComponent,
  AddQuestionComponent,
  AddRatingComponent,
  QuestionAnswerComponent,
  QuestionComponent,
  QuestionListComponent,
  QuestionResponsesComponent,
  QuestionStatsComponent,
  RangeComponent,
  RangeStatsComponent,
  ReviewCompleteComponent,
  ReviewCreateComponent,
  ReviewResponsesComponent
} from './components';

@NgModule({
  declarations: [
    QuestionAnswerComponent,
    QuestionListComponent,
    QuestionResponsesComponent,
    ReviewCompleteComponent,
    ReviewCreateComponent,
    ReviewResponsesComponent,
    AddCriteriaComponent,
    AddRatingComponent,
    AddQuestionComponent,
    QuestionComponent,
    RangeComponent,
    QuestionStatsComponent,
    RangeStatsComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ActionItemsListByProfileModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    CDKModule,
    NgbModule
  ],
  exports: [
    QuestionAnswerComponent,
    QuestionListComponent,
    QuestionResponsesComponent,
    ReviewCompleteComponent,
    ReviewCreateComponent,
    ReviewResponsesComponent,
    AddCriteriaComponent,
    AddRatingComponent,
    AddQuestionComponent
  ],
  entryComponents: [
    AddCriteriaComponent,
    AddRatingComponent,
    AddQuestionComponent
  ],
  providers: [ReviewCriteriaApiService]
})
export class ReviewsModule {}
