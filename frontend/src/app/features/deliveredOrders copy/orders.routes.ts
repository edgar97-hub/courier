import { Routes } from '@angular/router';
import { OrderListPageComponent } from './pages/delivered-order-list-page/order-list-page.component';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: OrderListPageComponent,
    title: 'Listado de Pedidos',
  },
];
