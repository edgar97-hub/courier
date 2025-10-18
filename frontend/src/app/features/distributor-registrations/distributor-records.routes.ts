import { Routes } from '@angular/router';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { DistributorRoleGuard } from '../../shared/guards/distributor-role.guard';

export const DISTRIBUTOR_RECORDS_ROUTES: Routes = [
  {
    path: '',
    component: RegistrationPageComponent,
    canActivate: [DistributorRoleGuard],
  },
];
