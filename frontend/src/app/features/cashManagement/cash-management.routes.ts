import { Routes } from '@angular/router';
import { CashManagementListPageComponent } from './pages/cash-management-list-page/cash-management-list-page.component';

export const CASH_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: CashManagementListPageComponent,
  },
];