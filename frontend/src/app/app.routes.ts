import { Routes } from '@angular/router';

import { authGuard, loginPageGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · Tidalis Project References',
    canActivate: [loginPageGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'Tidalis · Project References',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/start/start-page.component').then((m) => m.StartPageComponent),
  },
  {
    path: 'projects',
    title: 'Projects · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/projects-page.component').then((m) => m.ProjectsPageComponent),
  },
  {
    path: 'systems',
    title: 'Systems · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/systems/systems-page.component').then((m) => m.SystemsPageComponent),
  },
  {
    path: 'map',
    title: 'World Map · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/world-map/world-map-page.component').then((m) => m.WorldMapPageComponent),
  },
  {
    path: 'reference-data',
    title: 'Reference Data · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reference-data/reference-data-page.component').then(
        (m) => m.ReferenceDataPageComponent,
      ),
  },
  {
    path: 'reference-data/:type',
    title: 'Reference Data · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reference-data/reference-table/reference-table.component').then(
        (m) => m.ReferenceTablePageComponent,
      ),
  },
  {
    path: 'audit-log',
    title: 'Audit Trail · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/audit-log/audit-log-page.component').then((m) => m.AuditLogPageComponent),
  },
  {
    path: 'manual',
    title: 'User Manual · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user-manual/user-manual-page.component').then(
        (m) => m.UserManualPageComponent,
      ),
  },
  {
    path: 'claude-integration',
    title: 'Connect Claude · Tidalis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/claude-integration/claude-integration-page.component').then(
        (m) => m.ClaudeIntegrationPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
