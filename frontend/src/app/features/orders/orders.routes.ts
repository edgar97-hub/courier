import { Routes } from '@angular/router';
import { OrderListPageComponent } from './pages/order-list-page/order-list-page.component';
import { OrderCreatePageComponent } from './pages/order-create-page/order-create-page.component'; // Importar
import { OrderEditionPageComponent } from './pages/order-edition-page/order-edition-page.component';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: OrderListPageComponent,
  },
  {
    path: 'create',
    component: OrderCreatePageComponent,
  },
  {
    path: 'edit/:id',
    component: OrderEditionPageComponent,
  },
];
