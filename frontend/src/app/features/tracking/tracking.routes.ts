// src/app/features/tracking/tracking.routes.ts
import { Routes } from '@angular/router';
import { TrackingPageComponent } from './pages/tracking-page/tracking-page.component';

export const TRACKING_ROUTES: Routes = [
  {
    path: '', // Ruta base para /tracking (ej. /tracking?code=XYZ)
    component: TrackingPageComponent,
    title: 'Rastrear Pedido',
  },
  // {
  //   path: ':trackingCode', // Ruta alternativa ej. /tracking/XYZ
  //   component: TrackingPageComponent,
  //   title: 'Rastrear Pedido'
  // }
];
