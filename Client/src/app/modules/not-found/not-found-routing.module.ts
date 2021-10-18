import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './../../guards';
import { NotFoundComponent, AccessDeniedComponent } from './components';
import { SharedMachineComponent } from './components/shared-machine/shared-machine.component';

const routes: Routes = [
  { path: '404', canActivateChild: [AuthGuard], component: NotFoundComponent },
  { path: 'shared-machine', component: SharedMachineComponent },
  {
    path: 'access-denied',
    canActivateChild: [AuthGuard],
    component: AccessDeniedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotFoundRoutingModule {}
