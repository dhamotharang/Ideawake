import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccessGuard, AuthGuard, EditChallengeAccessGuard } from '../../guards';
import { ChallengePermissionResolver } from '../../resolvers';
import { ACCESS_ROUTE_PERMISSIONS } from '../../utils';
import {
  ChallengeActivityComponent,
  ChallengeAnalyticsComponent,
  ChallengeDiscussionComponent,
  ChallengeIdeasComponent,
  ChallengeLeaderboardComponent,
  ChallengePairwiseComponent,
  ChallengePostComponent,
  ChallengesListComponent,
  ChallengeUpdatesComponent,
  ChallengeViewContainerComponent
} from './components';
import { PostUpdateComponent } from '../community/components';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ChallengesListComponent
  },
  {
    path: 'post',
    canActivate: [AuthGuard, AccessGuard],
    data: { setting: ACCESS_ROUTE_PERMISSIONS.postChallenge },
    component: ChallengePostComponent
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    data: {
      settings: [
        ACCESS_ROUTE_PERMISSIONS.editChallengeDetails,
        ACCESS_ROUTE_PERMISSIONS.editChallengeSettings,
        ACCESS_ROUTE_PERMISSIONS.editChallengeTargetting
      ],
      conditionAnd: false
    },
    component: ChallengePostComponent,
    resolve: {
      permissions: ChallengePermissionResolver
    }
  },
  {
    path: 'view/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengeViewContainerComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'ideas/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengeIdeasComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'analytics/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    data: {
      settings: [
        ACCESS_ROUTE_PERMISSIONS.viewChallenge,
        ACCESS_ROUTE_PERMISSIONS.editChallengeDetails
      ],
      conditionAnd: true
    },
    component: ChallengeAnalyticsComponent
  },
  {
    path: 'updates/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengeUpdatesComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'activity/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengeActivityComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'leaderboard',
    canActivate: [AuthGuard],
    component: ChallengeLeaderboardComponent
  },
  {
    path: 'discussion/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengeDiscussionComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'pairwise/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    component: ChallengePairwiseComponent,
    data: {
      settings: [ACCESS_ROUTE_PERMISSIONS.viewChallenge],
      conditionAnd: true
    }
  },
  {
    path: 'post-update/:id',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    data: {
      settings: [
        ACCESS_ROUTE_PERMISSIONS.viewChallenge,
        ACCESS_ROUTE_PERMISSIONS.manageAnnouncement
      ],
      conditionAnd: true
    },
    component: PostUpdateComponent
  },
  {
    path: 'post-update/:id/edit/:announcementId',
    canActivate: [AuthGuard, EditChallengeAccessGuard],
    data: {
      settings: [
        ACCESS_ROUTE_PERMISSIONS.viewChallenge,
        ACCESS_ROUTE_PERMISSIONS.manageAnnouncement
      ],
      conditionAnd: true
    },
    component: PostUpdateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChallengeRoutingModule {}
