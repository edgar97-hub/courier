import { Routes } from '@angular/router';
import { ProductListPageComponent } from './products/pages/product-list-page/product-list-page.component';
import { StockAdjustmentListPageComponent } from './stock-adjustments/pages/stock-adjustment-list-page/stock-adjustment-list-page.component';
import { StockQueryListPageComponent } from './stock-query/pages/stock-query-list-page/stock-query-list-page.component';
import { KardexListPageComponent } from './kardex/pages/kardex-list-page/kardex-list-page.component';
import { FulfillmentBannerPageComponent } from './banner-page/fulfillment-banner-page.component';

export const FULFILLMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductListPageComponent,
    title: 'Catálogo de Productos Fulfillment',
  },
  {
    path: 'stock-adjustments',
    component: StockAdjustmentListPageComponent,
    title: 'Ingresos y Ajustes de Stock',
  },
  {
    path: 'stock-query',
    component: StockQueryListPageComponent,
    title: 'Consulta de Stock Maestro',
  },
  {
    path: 'kardex',
    component: KardexListPageComponent,
    title: 'Kardex Histórico',
  },
  {
    path: 'banner',
    component: FulfillmentBannerPageComponent,
    title: 'Fulfillment',
  },
];
