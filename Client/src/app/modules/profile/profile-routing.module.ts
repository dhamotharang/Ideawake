import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards';
import { ProfileTopContainerComponent } from './components';
import { ProfileActionItemsComponent } from './components/profile-action-items/profile-action-items.component';

const routes: Routes = [
  {
    path: 'action-items',
    component: ProfileActionItemsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'view/:id',
    component: ProfileTopContainerComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
