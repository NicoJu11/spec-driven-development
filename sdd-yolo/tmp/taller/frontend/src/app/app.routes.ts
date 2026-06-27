import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
  {
    path: 'teams',
    loadComponent: () =>
      import('./features/teams/teams.component').then((m) => m.TeamsComponent),
  },
  {
    path: 'teams/:code',
    loadComponent: () =>
      import('./features/teams/team-detail.component').then(
        (m) => m.TeamDetailComponent
      ),
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./features/groups/groups.component').then(
        (m) => m.GroupsComponent
      ),
  },
  {
    path: 'bracket',
    loadComponent: () =>
      import('./features/bracket/bracket.component').then(
        (m) => m.BracketComponent
      ),
  },
];
