// src/app/features/districts/districts.routes.ts
import { Routes } from '@angular/router';
import { DistrictListPageComponent } from './pages/district-list-page/district-list-page.component';
import { DistrictFormPageComponent } from './pages/district-form-page/district-form-page.component';

export const DISTRICTS_ROUTES: Routes = [
  {
    path: '',
    component: DistrictListPageComponent,
    title: 'Distritos y Tarifas',
  },
  {
    path: 'create',
    component: DistrictFormPageComponent,
    title: 'Nuevo Distrito/Tarifa',
    // data: { mode: 'create' } // Opcional para pasar modo al componente
  },
  {
    path: 'edit/:id', // El 'id' del distrito a editar
    component: DistrictFormPageComponent,
    title: 'Editar Distrito/Tarifa',
    // data: { mode: 'edit' } // Opcional
  },
];
