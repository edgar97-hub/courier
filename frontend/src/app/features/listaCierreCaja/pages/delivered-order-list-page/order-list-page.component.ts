import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // RouterModule si tienes links/botones de navegación
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator'; // Importar PageEvent
import { MatSort, Sort } from '@angular/material/sort'; // Importar Sort
import { Subject, Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  catchError,
} from 'rxjs/operators';

import { OrderFiltersComponent } from '../../components/order-filters/order-filters.component';
import { OrderTableComponent } from '../../components/order-table/order-table.component';
import { OrderService } from '../../services/order.service';
import {
  NewOrderData,
  Order,
  Order_,
  OrderStatus,
  PaginatedOrdersResponse,
} from '../../models/order.model';
import { OrderFilterCriteria } from '../../models/order-filter.model';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ExcelExportService } from '../../services/excel-export.service';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe aquí es solo para el tipado, no para proveerlo

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderFiltersComponent,
    OrderTableComponent,
    MatSnackBarModule,
    MatButtonModule, // Para el botón de Acciones Masivas
    MatIconModule, // Para iconos en botones
    MatMenuModule,
  ],
  templateUrl: './order-list-page.component.html',
  styleUrls: ['./order-list-page.component.scss'],
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private router = inject(Router); // Si necesitas navegar
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog); // Inyectar MatDialog
  private excelExportService = inject(ExcelExportService); // <--- INYECTA EL SERVICIO
  private datePipe = inject(DatePipe);
  orders: Order_[] = [];
  isLoading = false;
  totalOrderCount = 0;
  currentPageIndex = 0; // Paginator es base 0
  currentPageSize = 10; // Valor inicial para el paginador
  currentSortField = 'registration_date'; // Campo de ordenamiento inicial
  currentSortDirection: 'asc' | 'desc' = 'desc'; // Dirección inicial

  // Subject para manejar los filtros actuales
  private filterCriteriaSubject = new BehaviorSubject<OrderFilterCriteria>({});
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Escuchar cambios en los filtros y recargar datos
    this.filterCriteriaSubject
      .pipe(
        takeUntil(this.destroy$),
        // debounceTime(300), // Opcional: añadir debounce si los filtros emiten muy rápido
        // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap(() => (this.currentPageIndex = 0)) // Resetear a la primera página cuando los filtros cambian
      )
      .subscribe((criteria) => {
        this.fetchOrders();
      });
  }

  private async getAllFilteredOrdersForExport(): Promise<Order[]> {
    try {
      const currentFilters = this.filterCriteriaSubject.value;
      const allOrders = await firstValueFrom(
        this.orderService
          .getOrders2(
            currentFilters,
            this.currentSortField,
            this.currentSortDirection
          )
          .pipe(takeUntil(this.destroy$))
      );

      return allOrders || []; // Devuelve un array vacío si la respuesta es null/undefined
    } catch (error) {
      console.error('Error fetching all filtered orders for export:', error);
      this.snackBar.open('Failed to fetch data for export.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return []; // Devuelve un array vacío en caso de error para no romper la exportación
    }
  }

  async exportDataToExcel(): Promise<void> {
    this.isLoading = true;
    this.snackBar.open(
      'Preparando la exportación a Excel, esto puede tardar un momento...',
      '',
      { duration: 0 }
    );

    try {
      interface ExcelOrderRow {
        'N° PEDIDO': string | number;
        'TIPO DE PEDIDO': string;
        EMPRESA: string;
        CLIENTE: string;
        DISTRITO: string;
        'FECHA DE REGISTRO': string | null;
        ESTADO: string;
        'MONTO A COBRAR': number | null;
        EFECTIVO: number | null;
        'PAGO DIRECTO': number | null;
        'COSTO ENVIO': number | null;
        'PAGO EFECTIVO A COURIER': number | null;
        'PAGO DIRECTO A COURIER': number | null;
        'PAGO DIRECTO A EMPRESA': number | null;
        DIFERENCIA: number | null;
      }

      const totals = {
        amount_to_collect_at_delivery: 0,
        efectivo_monto_cobrar: 0,
        pago_directo_monto_cobrar: 0,
        shipping_cost: 0,
        efectivo_courier_costo_servicio: 0,
        pago_directo_courier_costo_servicio: 0,
        pago_directo_empresa_costo_servicio: 0,
        diferencia: 0,
      };

      const allFilteredOrders = await this.getAllFilteredOrdersForExport();
      if (allFilteredOrders && allFilteredOrders.length > 0) {
        const dataForSheet: ExcelOrderRow[] = allFilteredOrders.map(
          (order: any) => {
            order.efectivo_monto_cobrar =
              order.payment_method_for_collection === 'Efectivo'
                ? order.amount_to_collect_at_delivery
                : 0;

            order.pago_directo_monto_cobrar =
              order.payment_method_for_collection === 'Pago directo'
                ? order.amount_to_collect_at_delivery
                : 0;

            // costo de envio
            order.efectivo_courier_costo_servicio =
              order.payment_method_for_shipping_cost ===
              'Efectivo (Pago a COURIER)'
                ? order.shipping_cost
                : 0;

            order.pago_directo_courier_costo_servicio =
              order.payment_method_for_shipping_cost ===
              'Pago directo (Pago a COURIER)'
                ? order.shipping_cost
                : 0;

            order.pago_directo_empresa_costo_servicio =
              order.payment_method_for_shipping_cost ===
              'Pago directo (Pago a EMPRESA)'
                ? order.shipping_cost
                : 0;

            let diferencia = 0;
            let monto_a_cobrar = order.amount_to_collect_at_delivery;
            let costo_servicio_pagado_cliente_al_courier =
              order.efectivo_courier_costo_servicio ||
              order.pago_directo_courier_costo_servicio;
            /**
             * si el pago del monto a cobrar se hizo por pago directo,
             * ya no es considerado para el calculo en columna diferencia
             */
            if (
              order.pago_directo_monto_cobrar ===
              order.amount_to_collect_at_delivery
            ) {
              monto_a_cobrar = 0;
            } else {
              /**
               * quiere decir que el pago se hizo al courier,
               * y se le tiene que devolver a la empresa
               */
              diferencia = monto_a_cobrar;
            }

            /**
             * si el cliente no pago el costo del servicio,
             * quiere decir que se le tiene que cobrar a la empresa
             */
            if (costo_servicio_pagado_cliente_al_courier === 0) {
              diferencia = monto_a_cobrar - order.shipping_cost;
            }
            order.diferencia = diferencia;

            totals.amount_to_collect_at_delivery +=
              Number(order.amount_to_collect_at_delivery) || 0;
            totals.efectivo_monto_cobrar += order.efectivo_monto_cobrar;
            totals.pago_directo_monto_cobrar += order.pago_directo_monto_cobrar;
            totals.shipping_cost += Number(order.shipping_cost) || 0;
            totals.efectivo_courier_costo_servicio +=
              order.efectivo_courier_costo_servicio;
            totals.pago_directo_courier_costo_servicio +=
              order.pago_directo_courier_costo_servicio;
            totals.pago_directo_empresa_costo_servicio +=
              order.pago_directo_empresa_costo_servicio;
            totals.diferencia += diferencia;

            return {
              'N° PEDIDO': order.code,
              'TIPO DE PEDIDO': order.shipment_type,
              EMPRESA: order.company?.username,
              CLIENTE: order.recipient_name,
              DISTRITO: order.delivery_district_name,
              'FECHA DE REGISTRO': order.createdAt
                ? this.datePipe.transform(order.createdAt, 'dd/MM/yyyy')
                : 'N/A',
              ESTADO: order.status,
              'MONTO A COBRAR': order.amount_to_collect_at_delivery,
              EFECTIVO: order.efectivo_monto_cobrar,
              'PAGO DIRECTO': order.pago_directo_monto_cobrar,

              'COSTO ENVIO': order.shipping_cost,
              'PAGO EFECTIVO A COURIER': order.efectivo_courier_costo_servicio,
              'PAGO DIRECTO A COURIER':
                order.pago_directo_courier_costo_servicio,
              'PAGO DIRECTO A EMPRESA':
                order.pago_directo_empresa_costo_servicio,
              DIFERENCIA: diferencia,
            };
          }
        );
        const separatorRow = {
          'N° PEDIDO': '',
          'TIPO DE PEDIDO': '',
          EMPRESA: '',
          CLIENTE: '',
          DISTRITO: '',
          'FECHA DE REGISTRO': '',
          ESTADO: '',
          'MONTO A COBRAR': null,
          EFECTIVO: null,
          'PAGO DIRECTO': null,
          'COSTO ENVIO': null,
          'PAGO EFECTIVO A COURIER': null,
          'PAGO DIRECTO A COURIER': null,
          'PAGO DIRECTO A EMPRESA': null,
          DIFERENCIA: null,
        };
        const totalsRow = {
          'N° PEDIDO': 'TOTALES',
          'TIPO DE PEDIDO': '',
          EMPRESA: '',
          CLIENTE: '',
          DISTRITO: '',
          'FECHA DE REGISTRO': '',
          ESTADO: '',
          'MONTO A COBRAR': totals.amount_to_collect_at_delivery,
          EFECTIVO: totals.efectivo_monto_cobrar,
          'PAGO DIRECTO': totals.pago_directo_monto_cobrar,
          'COSTO ENVIO': totals.shipping_cost,
          'PAGO EFECTIVO A COURIER': totals.efectivo_courier_costo_servicio,
          'PAGO DIRECTO A COURIER': totals.pago_directo_courier_costo_servicio,
          'PAGO DIRECTO A EMPRESA': totals.pago_directo_empresa_costo_servicio,
          DIFERENCIA: totals.diferencia,
        };

        dataForSheet.push(separatorRow);
        dataForSheet.push(totalsRow);

        this.excelExportService.exportAsExcelFile(
          dataForSheet,
          'Listado_Pedidos_Filtrados',
          'Pedidos'
        );
        this.snackBar.dismiss();
        this.snackBar.open('Archivo de Excel exportado exitosamente!', 'OK', {
          duration: 3500,
          panelClass: ['success-snackbar'],
        });
      } else {
        this.snackBar.dismiss();
        this.snackBar.open(
          'No hay datos disponibles para exportar con los filtros actuales.',
          'OK',
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error during Excel export process:', error);
      this.snackBar.dismiss();
      this.snackBar.open(
        'Se produjo un error durante la exportación a Excel.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    } finally {
      this.isLoading = false;
    }
  }

  fetchOrders(): void {
    this.isLoading = true;
    const currentFilters = this.filterCriteriaSubject.value;

    this.orderService
      .getOrders(
        currentFilters,
        this.currentPageIndex + 1,
        this.currentPageSize,
        this.currentSortField,
        this.currentSortDirection
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open(
            error.message || 'Failed to load orders.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.isLoading = false;
          return [];
        })
      )
      .subscribe((response: PaginatedOrdersResponse) => {
        response.items.forEach((order) => {
          order.efectivo_monto_cobrar =
            order.payment_method_for_collection === 'Efectivo'
              ? order.amount_to_collect_at_delivery
              : 0;

          order.pago_directo_monto_cobrar =
            order.payment_method_for_collection === 'Pago directo'
              ? order.amount_to_collect_at_delivery
              : 0;

          // costo de envio
          order.efectivo_courier_costo_servicio =
            order.payment_method_for_shipping_cost ===
            'Efectivo (Pago a COURIER)'
              ? order.shipping_cost
              : 0;

          order.pago_directo_courier_costo_servicio =
            order.payment_method_for_shipping_cost ===
            'Pago directo (Pago a COURIER)'
              ? order.shipping_cost
              : 0;

          order.pago_directo_empresa_costo_servicio =
            order.payment_method_for_shipping_cost ===
            'Pago directo (Pago a EMPRESA)'
              ? order.shipping_cost
              : 0;

          let diferencia = 0;
          let monto_a_cobrar = order.amount_to_collect_at_delivery || 0;
          let costo_servicio_pagado_cliente_al_courier =
            order.efectivo_courier_costo_servicio ||
            order.pago_directo_courier_costo_servicio;

          /**
           * si el pago del monto a cobrar se hizo por pago directo,
           * ya no es considerado para el calculo en columna diferencia
           */
          if (
            order.pago_directo_monto_cobrar ===
            order.amount_to_collect_at_delivery
          ) {
            monto_a_cobrar = 0;
          } else {
            /**
             * quiere dicer que el pago se hizo al courier,
             * y se le tiene que devolver a la empresa
             */
            diferencia = monto_a_cobrar;
          }

          /**
           * si el cliente no pago el costo del servicio,
           * quiere decir que se le tiene que cobrar a la empresa
           */
          if (costo_servicio_pagado_cliente_al_courier === 0) {
            diferencia = monto_a_cobrar - (order.shipping_cost || 0);
          }

          order.diferencia = diferencia;
        });
        this.orders = response.items;
        this.totalOrderCount = response.total_count || 0;
        this.isLoading = false;
      });
  }

  handlePaymentTypeChanged(event: {
    orderId: number | string;
    // newStatus: OrderStatus;
    // reason?: string | null;
    // proofOfDeliveryImageUrl?: string | null;
    shippingCostPaymentMethod?: string | null;
    collectionPaymentMethod?: string | null;
  }): void {
    this.isLoading = true;
    console.log('OrderListPage: Status change requested', event);

    this.orderService
      .updateOrderPaymentType(
        event.orderId,
        // event.newStatus,
        // event.reason || '',
        // event.proofOfDeliveryImageUrl,
        event.shippingCostPaymentMethod,
        event.collectionPaymentMethod
      )
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Pedido actualizado.`,
            'OK',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.fetchOrders();
        },
        error: (err) => {
          this.snackBar.open(
            `Error al actualizar estado: ${err.message || 'Intente de nuevo'}`,
            'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  // handleMotorizedChanged(event: {
  //   orderId: number | string;
  //   motorizedId: string;
  // }): void {
  //   this.orderService
  //     .assignDriverToOrder(event.orderId, event.motorizedId)
  //     .subscribe({
  //       next: (updatedOrder) => {
  //         this.snackBar.open(
  //           `Motorizado ${updatedOrder.assigned_driver?.username} asignado al pedido ${updatedOrder.code}.`,
  //           'OK',
  //           {
  //             duration: 3000,
  //             panelClass: ['success-snackbar'],
  //           }
  //         );
  //         this.fetchOrders();
  //       },
  //       error: (err) => {
  //         this.snackBar.open(
  //           `Error al asignar motorizado: ${err.message || 'Intente de nuevo'}`,
  //           'Cerrar',
  //           {
  //             duration: 5000,
  //             panelClass: ['error-snackbar'],
  //           }
  //         );
  //       },
  //     });
  // }

  // handleRescheduleChanged(event: {
  //   orderId: number | string;
  //   newDate: Date;
  //   reason?: string;
  // }): void {
  //   const isoString = new Date(event.newDate).toISOString();
  //   this.orderService
  //     .rescheduleOrder(event.orderId, isoString || '', event.reason)
  //     .subscribe({
  //       next: (updatedOrder) => {
  //         this.snackBar.open(
  //           `Pedido ${
  //             updatedOrder.code
  //           } reprogramado para ${this.datePipe.transform(
  //             updatedOrder.delivery_date,
  //             'dd/MM/yyyy'
  //           )}.`,
  //           'OK',
  //           {
  //             duration: 3500,
  //             panelClass: ['success-snackbar'],
  //           }
  //         );
  //         this.fetchOrders();
  //       },
  //       error: (err) => {
  //         this.snackBar.open(
  //           `Error al reprogramar pedido: ${err.message || 'Intente de nuevo'}`,
  //           'Cerrar',
  //           {
  //             duration: 5000,
  //             panelClass: ['error-snackbar'],
  //           }
  //         );
  //       },
  //     });
  // }

  onFiltersChanged(filters: OrderFilterCriteria): void {
    console.log('OrderListPage: Filters changed', filters);
    this.filterCriteriaSubject.next(filters);
  }

  onPageChanged(event: PageEvent): void {
    console.log('OrderListPage: Page changed', event);
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.fetchOrders();
  }

  onSortChanged(sort: Sort): void {
    console.log('OrderListPage: Sort changed', sort);
    this.currentSortField = sort.active;
    this.currentSortDirection = sort.direction as 'asc' | 'desc';
    this.currentPageIndex = 0;
    this.fetchOrders();
  }

  handleMassiveActions(action: string): void {
    console.log('Massive action selected:', action);
    this.snackBar.open(`Action: ${action} not implemented yet.`, 'OK', {
      duration: 3000,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
