import { NgModule } from '@angular/core';
import { CommunityNavigationComponent } from './components';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// @dynamic
@NgModule({
  declarations: [CommunityNavigationComponent],
  imports: [FontAwesomeModule, CommonModule, RouterModule],
  exports: [CommunityNavigationComponent]
})
export class CommunityNavigationModule {}
