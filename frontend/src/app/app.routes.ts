import { Routes } from '@angular/router';
import {
  redirectDashboardIfAuthenticated,
  redirectLoginIfNotAuthenticated,
} from './shared/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component'),
    canActivate: [redirectDashboardIfAuthenticated()],
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/shared/components/layout/layout.component'),
    canActivate: [redirectLoginIfNotAuthenticated()],
    children: [
      {
        path: 'users',
        loadComponent: () => import('../app/pages/users/table.component'),
      },
      {
        path: 'districts',
        loadComponent: () => import('../app/pages/distritos/table.component'),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('../app/features/dashboard/dashboard.component'),
      },
      {
        path: 'setting',
        loadComponent: () => import('../app/pages/settings/table.component'),
      },
      // {
      //   path: 'dashboard',
      //   loadComponent: () =>
      //     import('../app/features/dashboard/dashboard.component'),
      // },
      // {
      //   path: 'content',
      //   loadChildren: () => import('../app/features/content/content.routes'),
      // },
      // {
      //   path: 'components',
      //   loadChildren: () =>
      //     import('../app/features/components/components.routes'),
      // },
      // {
      //   path: 'comments',
      //   loadComponent: () =>
      //     import('../app/features/comments/comments.component'),
      // },
      // {
      //   path: 'forms',
      //   loadChildren: () => import('../app/features/forms/forms.routes'),
      // },
    ],
  },
];
