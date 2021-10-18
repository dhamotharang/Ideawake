import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ActionItemsListByProfileComponent } from './components/action-items-list-by-profile/action-items-list-by-profile.component';

@NgModule({
  imports: [CommonModule, FontAwesomeModule],
  declarations: [ActionItemsListByProfileComponent],
  exports: [ActionItemsListByProfileComponent]
})
export class ActionItemsListByProfileModule {}
