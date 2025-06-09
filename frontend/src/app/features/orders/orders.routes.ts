import { Routes } from '@angular/router';
import { OrderListPageComponent } from './pages/order-list-page/order-list-page.component';
import { OrderCreatePageComponent } from './pages/order-create-page/order-create-page.component'; // Importar

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: OrderListPageComponent,
  },
  {
    path: 'create',
    component: OrderCreatePageComponent,
  },
];
