import { Routes } from '@angular/router';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserListPageComponent,
    title: 'Usuarios',
  },
  {
    path: 'detail',
    loadComponent: () =>
      import('./pages/user-detail-page/user-detail-page.component').then(
        (m) => m.UserDetailPageComponent,
      ),
    title: 'Detalles del negocio',
  },
];
