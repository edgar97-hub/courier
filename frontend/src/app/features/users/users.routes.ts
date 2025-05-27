import { Routes } from '@angular/router';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';
import { UserCreatePageComponent } from './pages/user-create-page/user-create-page.component';
import { UserEditPageComponent } from './pages/user-edit-page/user-edit-page.component';
import { usersFeatureProviders } from './users.config'; // <--- IMPORTA LOS PROVIDERS
import { UserDetailPageComponent } from './pages/user-detail-page/user-detail-page.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      ...usersFeatureProviders, // <--- USA LOS PROVIDERS IMPORTADOS
    ],
    children: [
      {
        path: '',
        component: UserListPageComponent,
        title: 'User List',
      },
      {
        path: 'create',
        component: UserCreatePageComponent,
        title: 'Create New User',
      },
      {
        path: 'edit/:id',
        component: UserEditPageComponent,
        title: 'Edit User',
      },
      {
        path: 'detail',
        component: UserDetailPageComponent,
        title: 'User Details',
      },
    ],
  },
];
