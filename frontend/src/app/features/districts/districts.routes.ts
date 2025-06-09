// src/app/features/districts/districts.routes.ts
import { Routes } from '@angular/router';
import { DistrictListPageComponent } from './pages/district-list-page/district-list-page.component';
import { DistrictFormPageComponent } from './pages/district-form-page/district-form-page.component';

export const DISTRICTS_ROUTES: Routes = [
  {
    path: '',
    component: DistrictListPageComponent,
  },
  {
    path: 'create',
    component: DistrictFormPageComponent,
  },
  {
    path: 'edit/:id',
    component: DistrictFormPageComponent,
  },
];
