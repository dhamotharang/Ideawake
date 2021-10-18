import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { I18nModule } from '../i18n/i18n.module';
import { NotFoundComponent, AccessDeniedComponent } from './components';
import { NotFoundRoutingModule } from './not-found-routing.module';
import { SharedMachineComponent } from './components/shared-machine/shared-machine.component';
// @dynamic
@NgModule({
  declarations: [
    NotFoundComponent,
    AccessDeniedComponent,
    SharedMachineComponent
  ],
  imports: [NotFoundRoutingModule, FontAwesomeModule, I18nModule],
  bootstrap: [NotFoundComponent]
})
export class NotFoundModule {}
