import { Routes } from '@angular/router';
import {
  redirectDashboardIfAuthenticated,
  redirectLoginIfNotAuthenticated,
} from './shared/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
    canMatch: [redirectDashboardIfAuthenticated],
    title: 'Log In',
  },
  {
    path: 'register',
    loadComponent: () =>
      import(
        './features/auth/pages/register-page/register-page.component'
      ).then((m) => m.RegisterPageComponent),
    canMatch: [redirectDashboardIfAuthenticated],
    title: 'Register',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password-page/forgot-password-page.component'
      ).then((m) => m.ForgotPasswordPageComponent),
    canMatch: [redirectDashboardIfAuthenticated],
    title: 'Forgot Password',
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('../app/shared/components/layout/layout.component'),
    canActivate: [redirectLoginIfNotAuthenticated()],
    children: [
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),

        title: 'Users Management',
        canActivate: [redirectLoginIfNotAuthenticated()],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            './features/settings/pages/settings-page/settings-page.component'
          ).then((m) => m.SettingsPageComponent),
      },
      {
        path: 'shipping-rates',
        loadComponent: () => import('./features/tarifasEnvío/table.component'),
      },
    ],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('../app/shared/components/layout/layout.component'),
    canActivate: [redirectLoginIfNotAuthenticated()],
    children: [
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
    ],
  },
];
