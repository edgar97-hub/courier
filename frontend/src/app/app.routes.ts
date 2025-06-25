import { Routes } from '@angular/router';
import {
  redirectDashboardIfAuthenticated,
  redirectLoginIfNotAuthenticated,
} from './shared/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders/orders',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
    canMatch: [redirectDashboardIfAuthenticated],
  },
  {
    path: 'register',
    loadComponent: () =>
      import(
        './features/auth/pages/register-page/register-page.component'
      ).then((m) => m.RegisterPageComponent),
    canMatch: [redirectDashboardIfAuthenticated],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './features/auth/pages/forgot-password-page/forgot-password-page.component'
      ).then((m) => m.ForgotPasswordPageComponent),
    canMatch: [redirectDashboardIfAuthenticated],
  },
  {
    path: '',
    loadComponent: () =>
      import('../app/shared/components/layout/layout.component'),
    canActivate: [redirectLoginIfNotAuthenticated()],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),

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
      {
        path: 'tarifas',
        loadComponent: () =>
          import(
            './features/shared/image-display/image-display.component'
          ).then((m) => m.ImageDisplayComponent),
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import(
            './features/shared/terms-and-conditions-display/terms-and-conditions-display.component'
          ).then((m) => m.TermsConditionsDisplayComponent),
      },
      {
        path: 'package-calculator',
        loadComponent: () =>
          import(
            './features/shared/package-calculator/package-calculator.component'
          ).then((m) => m.PackageCalculatorComponent),
      },
      {
        path: 'districts',
        loadChildren: () =>
          import('./features/districts/districts.routes').then(
            (m) => m.DISTRICTS_ROUTES
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
      {
        path: 'orders-delivered',
        loadChildren: () =>
          import('./features/deliveredOrders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
      {
        path: 'lista-cierre-caja',
        loadChildren: () =>
          import('./features/listaCierreCaja/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
    ],
  },
  {
    path: 'tracking',
    loadChildren: () =>
      import('./features/tracking/tracking.routes').then(
        (m) => m.TRACKING_ROUTES
      ),
    title: 'Seguimiento de Envíos',
  },
];
