import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HomeApi, ChallengesApiService } from '../../services';
import { ChallengeModule } from '../challenge/challenge.module';
import { SharedModule } from '../shared/shared.module';
import { HomeComponent, UserAlertsComponent } from './component';
import { HomeRoutingModule } from './home-routing.module';

// @dynamic
@NgModule({
  declarations: [HomeComponent, UserAlertsComponent],
  imports: [
    HomeRoutingModule,
    SharedModule,
    ChallengeModule,
    FormsModule,
    CommonModule
  ],
  providers: [HomeApi, ChallengesApiService]
})
export class HomeModule {}
