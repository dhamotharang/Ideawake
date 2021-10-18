import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SharedModule } from '../shared/shared.module';
import { ActionItemsListByProfileModule } from './action-items-list-by-profile.module';
import {
  ActionItemConfirmOpportunityOwnershipComponent,
  ActionItemConfirmOpportunityTeamMembershipComponent,
  ActionItemsListComponent,
  ActionItemsListContainerComponent,
  ActionItemVoteComponent,
  AddActionItemComponent
} from './components';

@NgModule({
  declarations: [
    ActionItemConfirmOpportunityOwnershipComponent,
    ActionItemConfirmOpportunityTeamMembershipComponent,
    ActionItemVoteComponent,
    ActionItemsListComponent,
    ActionItemsListContainerComponent,
    AddActionItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CustomFieldsModule,
    ReviewsModule,
    ActionItemsListByProfileModule
  ],
  exports: [
    ActionItemConfirmOpportunityOwnershipComponent,
    ActionItemConfirmOpportunityTeamMembershipComponent,
    ActionItemVoteComponent,
    ActionItemsListComponent,
    ActionItemsListContainerComponent,
    AddActionItemComponent
  ]
})
export class ActionItemsModule {}
