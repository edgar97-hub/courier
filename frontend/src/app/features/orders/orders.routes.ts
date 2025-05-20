import { Routes } from '@angular/router';
import { OrderListPageComponent } from './pages/order-list-page/order-list-page.component';
import { OrderCreatePageComponent } from './pages/order-create-page/order-create-page.component'; // Importar

export const ORDERS_ROUTES: Routes = [
  {
    path: '', // Ruta para el listado (ej. /features/orders)
    component: OrderListPageComponent,
    title: 'Listado de Pedidos',
  },
  {
    path: 'create', // Ruta para la creación (ej. /features/orders/create)
    component: OrderCreatePageComponent,
    title: 'Registrar Nuevo Pedido',
  },
  // Podrías tener más rutas aquí, como para ver detalles de un pedido:
  // { path: ':id', component: OrderDetailPageComponent, title: 'Detalle del Pedido' }
];
