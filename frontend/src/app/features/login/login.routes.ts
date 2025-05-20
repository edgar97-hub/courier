import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { redirectDashboardIfAuthenticated } from '../../shared/guards/auth.guards';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    title: 'Log In',
    canActivate: [redirectDashboardIfAuthenticated()],
  },
];
