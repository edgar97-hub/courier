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
  UpdateOrderRequestDto,
} from '../../models/order.model';
import { OrderFilterCriteria } from '../../models/order-filter.model';

// Para el título y breadcrumbs (opcional)
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { OrderImportModalComponent } from '../../components/order-import-modal/order-import-modal.component';
import { Order_importacion, STATES } from '../../models/order.model';
import { ExcelExportService } from '../../services/excel-export.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderFiltersComponent,
    OrderTableComponent,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
  ],
  templateUrl: './order-list-page.component.html',
  styleUrls: ['./order-list-page.component.scss'],
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private excelExportService = inject(ExcelExportService);
  private datePipe = inject(DatePipe);
  appStore = inject(AppStore); // Inject AppStore

  orders: Order_[] = [];
  isLoading = false;
  totalOrderCount = 0;
  currentPageIndex = 0;
  currentPageSize = 10;
  currentSortField = 'registration_date';
  currentSortDirection: 'asc' | 'desc' = 'desc';
  showMyOrders: boolean = false; // New property for the toggle

  now = new Date();
  firstDay = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
  lastDay = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0);

  private filterCriteriaSubject = new BehaviorSubject<OrderFilterCriteria>({
    start_date: this.datePipe.transform(this.firstDay, 'yyyy-MM-dd'),
    end_date: this.datePipe.transform(this.lastDay, 'yyyy-MM-dd'),
    status: null,
  });
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.filterCriteriaSubject
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.currentPageIndex = 0))
      )
      .subscribe(() => {
        this.fetchOrders();
      });
  }

  isDriver(): boolean {
    return this.appStore.currentUser()?.role === 'MOTORIZADO';
  }

  onToggleMyOrders(event: any): void {
    this.showMyOrders = event.checked;
    const currentFilters = this.filterCriteriaSubject.value;
    this.filterCriteriaSubject.next({
      ...currentFilters,
      myOrders: this.showMyOrders,
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

      return allOrders || [];
    } catch (error) {
      console.error('Error fetching all filtered orders for export:', error);
      this.snackBar.open('Failed to fetch data for export.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return [];
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
      const allFilteredOrders = await this.getAllFilteredOrdersForExport();
      if (allFilteredOrders && allFilteredOrders.length > 0) {
        const dataForSheet = allFilteredOrders.map((order: any) => ({
          'TIPO DE ENVIO': order.shipment_type,
          'NOMBRE DEL DESTINATARIO': order.recipient_name,
          'TELEFONO DESTINATARIO 9 DIGITOS': order.recipient_phone,
          DISTRITO: order.delivery_district_name,
          'DIRECCION DE ENTREGA': order.delivery_address,
          'FECHA DE REGISTRO': order.createdAt
            ? this.datePipe.transform(order.createdAt, 'dd/MM/yyyy')
            : 'N/A',
          'FECHA DE ENTREGA': order.delivery_date,
          'DETALLE DEL PRODUCTO': order.item_description,
          'COSTO DE ENVIO': order.shipping_cost,
          'MONTO A COBRAR': order.amount_to_collect_at_delivery,
          'FORMA DE PAGO': order.payment_method_for_collection,
          OBSERVACION: order.observations || '',
        }));

        this.excelExportService.exportAsExcelFile(
          dataForSheet,
          'Listado_Pedidos_Filtrados',
          'Pedidos'
        );
        this.snackBar.dismiss();
        this.snackBar.open('¡Archivo Excel exportado exitosamente!', 'OK', {
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
      this.snackBar.open('An error occurred during Excel export.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading = false;
    }
  }

  async exportDataToExcel2(): Promise<void> {
    this.isLoading = true;
    this.snackBar.open(
      'Preparando la exportación a Excel, esto puede tardar un momento...',
      '',
      { duration: 0 }
    );
    const standardPackageMeasurement = await firstValueFrom(
      this.orderService
        .getStandardPackageMeasurements()
        .pipe(takeUntil(this.destroy$))
    );
    try {
      const allFilteredOrders = await this.getAllFilteredOrdersForExport();
      if (allFilteredOrders && allFilteredOrders.length > 0) {
        const dataForSheet = allFilteredOrders.map((order: any) => {
          let package_height_cm = standardPackageMeasurement.sta_height_cm;
          let package_length_cm = standardPackageMeasurement.sta_length_cm;
          let package_width_cm = standardPackageMeasurement.sta_width_cm;
          let package_weight_kg = standardPackageMeasurement.sta_weight_kg;

          if (order.package_size_type === 'custom') {
            package_height_cm = order.package_height_cm;
            package_length_cm = order.package_length_cm;
            package_width_cm = order.package_width_cm;
            package_weight_kg = order.package_weight_kg;
          }

          return {
            pedido_id: order.code,
            peso_kg: package_weight_kg,
            largo_cm: package_length_cm,
            ancho_cm: package_width_cm,
            alto_cm: package_height_cm,
            direccion:
              order.delivery_address + '-' + order.delivery_district_name,
          };
        });

        this.excelExportService.exportAsExcelFile(
          dataForSheet,
          'Listado_Pedidos_Filtrados',
          'Pedidos'
        );
        this.snackBar.dismiss();
        this.snackBar.open('¡Archivo Excel exportado exitosamente!', 'OK', {
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
      this.snackBar.open('An error occurred during Excel export.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading = false;
    }
  }

  fetchOrders(): void {
    this.isLoading = true;
    const currentFilters = this.filterCriteriaSubject.value;
    const filtersToSend: OrderFilterCriteria = { ...currentFilters };
    if (this.showMyOrders) {
      filtersToSend.myOrders = true;
    } else {
      delete filtersToSend.myOrders;
    }

    this.orderService
      .getOrders(
        filtersToSend,
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
        this.orders = response.items;
        this.totalOrderCount = response.total_count || 0;
        this.isLoading = false;
        console.log('Orders fetched:', response);
      });
  }

  openImportModal(): void {
    const dialogRef = this.dialog.open(OrderImportModalComponent, {
      width: '90%', // Hacerlo más ancho por defecto, el componente interno puede tener max-width
      maxWidth: '700px', // Máximo ancho para desktop
      autoFocus: false, // Evitar que el primer botón tome foco automáticamente
      // disableClose: true, // Si quieres que solo se cierre con botones
    });

    dialogRef.componentInstance.importCompleted.subscribe(
      (success: boolean) => {
        if (success) {
          console.log('Import completed, reloading orders...');
          this.fetchOrders(); // Recargar la lista de pedidos si la importación fue exitosa
        }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The import dialog was closed', result);
      // Puedes hacer algo con el 'result' si el modal devuelve datos al cerrarse
    });
  }
  handleEditOrderChanged(event: { order: UpdateOrderRequestDto }): void {
    console.log('OrderListPage: Status change requested', event);
    this.fetchOrders();

    // this.orderService
    //   .updateOrderStatus(event.orderId, event.newStatus)
    //   .subscribe({
    //     next: (updatedOrder) => {
    //       this.snackBar.open(
    //         `Estado del pedido ${updatedOrder.code} actualizado a ${event.newStatus}.`,
    //         'OK',
    //         { duration: 3000, panelClass: ['success-snackbar'] }
    //       );
    //       this.fetchOrders();
    //     },
    //     error: (err) => {
    //       this.snackBar.open(
    //         `Error al actualizar estado: ${err.message || 'Intente de nuevo'}`,
    //         'Cerrar',
    //         { duration: 5000, panelClass: ['error-snackbar'] }
    //       );
    //       this.isLoading = false;
    //     },
    //     complete: () => {
    //       this.isLoading = false;
    //     },
    //   });
  }
  handleStatusChanged(event: {
    orderId: number | string;
    newStatus: OrderStatus;
    reason?: string | null;
    proofOfDeliveryImageUrl?: string | null;
    shippingCostPaymentMethod?: string | null;
    collectionPaymentMethod?: string | null;
  }): void {
    this.isLoading = true; // O una bandera de carga específica para la actualización
    console.log('OrderListPage: Status change requested', event);

    this.orderService
      .updateOrderStatus(
        event.orderId,
        event.newStatus,
        event.reason || '',
        event.proofOfDeliveryImageUrl,
        event.shippingCostPaymentMethod,
        event.collectionPaymentMethod
      )
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Estado del pedido ${updatedOrder.code} actualizado a ${event.newStatus}.`,
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

  handleMotorizedChanged(event: {
    orderId: number | string;
    motorizedId: string;
  }): void {
    console.log('orderId', event.orderId);
    console.log('motorizedId', event.motorizedId);
    this.orderService
      .assignDriverToOrder(event.orderId, event.motorizedId)
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Motorizado ${updatedOrder.assigned_driver?.username} asignado al pedido ${updatedOrder.code}.`,
            'OK',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
          this.fetchOrders();
        },
        error: (err) => {
          this.snackBar.open(
            `Error al asignar motorizado: ${err.message || 'Intente de nuevo'}`,
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
  }

  handleRescheduleChanged(event: {
    orderId: number | string;
    newDate: Date;
    reason?: string;
  }): void {
    const isoString = new Date(event.newDate).toISOString();
    this.orderService
      .rescheduleOrder(event.orderId, isoString || '', event.reason)
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Pedido ${
              updatedOrder.code
            } reprogramado para ${this.datePipe.transform(
              updatedOrder.delivery_date,
              'dd/MM/yyyy'
            )}.`,
            'OK',
            {
              duration: 3500,
              panelClass: ['success-snackbar'],
            }
          );
          this.fetchOrders();
        },
        error: (err) => {
          this.snackBar.open(
            `Error al reprogramar pedido: ${err.message || 'Intente de nuevo'}`,
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
  }

  handleAmountToCollectChanged(event: {
    orderId: string | number;
    newAmount: number;
    observation: string;
  }): void {
    this.isLoading = true;
    console.log('OrderListPage: Shipping cost change requested', event);

    this.orderService
      .updateOrderAmountToCollect(
        event.orderId,
        event.newAmount,
        event.observation
      )
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Monto a cobrar del pedido ${updatedOrder.code} actualizado.`,
            'OK',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.fetchOrders();
        },
        error: (err) => {
          this.snackBar.open(
            `Error al actualizar costo: ${err.message || 'Intente de nuevo'}`,
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
  handleShippingCostChanged(event: {
    orderId: string | number;
    newShippingCost: number;
    observation: string;
  }): void {
    this.isLoading = true;
    console.log('OrderListPage: Shipping cost change requested', event);

    this.orderService
      .updateOrderShippingCost(
        event.orderId,
        event.newShippingCost,
        event.observation
      )
      .subscribe({
        next: (updatedOrder) => {
          this.snackBar.open(
            `Costo de envío del pedido ${updatedOrder.code} actualizado.`,
            'OK',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.fetchOrders();
        },
        error: (err) => {
          this.snackBar.open(
            `Error al actualizar costo: ${err.message || 'Intente de nuevo'}`,
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
    this.currentSortDirection = sort.direction as 'asc' | 'desc'; // El tipo SortDirection puede ser '', pero nuestro servicio espera 'asc' o 'desc'
    this.currentPageIndex = 0; // Resetear a la primera página al cambiar el orden
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
