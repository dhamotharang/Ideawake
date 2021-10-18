import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GroupsApiService } from '../../services';
import { SharedModule } from '../shared/shared.module';
import {
  EditGroupModalComponent,
  GroupDropdownSelectComponent,
  GroupPageContainerComponent,
  GroupsListContainerComponent
} from './components';
import { GroupsRoutingModule } from './groups-routing.module';
import { CommunityNavigationModule } from '../community/community-navigation.module';

// @dynamic
@NgModule({
  declarations: [
    GroupsListContainerComponent,
    GroupDropdownSelectComponent,
    GroupPageContainerComponent,
    EditGroupModalComponent
  ],
  imports: [
    CommonModule,
    GroupsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommunityNavigationModule
  ],
  providers: [GroupsApiService],
  exports: [GroupDropdownSelectComponent]
})
export class GroupsModule {}
