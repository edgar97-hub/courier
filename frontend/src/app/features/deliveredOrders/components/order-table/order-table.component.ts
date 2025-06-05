import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject, // Para inyectar MatDialog y MatSnackBar
} from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu'; // <--- AÑADIR MatMenuModule
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <--- AÑADIR MatDialog
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // <--- AÑADIR MatSnackBar
import { MatDividerModule } from '@angular/material/divider';
import { Order, Order_, OrderStatus } from '../../models/order.model'; // Asegúrate que OrderStatus esté aquí

import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component'; //
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  EditShippingCostDialogComponent,
  EditShippingCostDialogResult,
  EditShippingCostDialogData,
} from '../edit-shipping-cost-dialog/edit-shipping-cost-dialog.component'; // <--- IMPORTA EL NUEVO DIÁLOGO
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss'],
})
export class OrderTableComponent implements AfterViewInit, OnChanges {
  appStore = inject(AppStore);

  @Input() orders: Order_[] | null = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() statusChanged = new EventEmitter<{
    orderId: number | string;
    newStatus: OrderStatus;
    reason?: string | null;
    proofOfDeliveryImageUrl?: string | null;
    shippingCostPaymentMethod?: string | null;
    collectionPaymentMethod?: string | null;
  }>();
  @Output() motorizedChanged = new EventEmitter<{
    orderId: number | string;
    motorizedId: string;
  }>();

  @Output() rescheduleChanged = new EventEmitter<{
    orderId: number | string;
    newDate: Date;
    reason: string;
  }>();

  @Output() viewPdfClicked = new EventEmitter<Order_>();
  @Output() viewDetailsClicked = new EventEmitter<Order_>();
  @Output() shippingCostChanged = new EventEmitter<{
    orderId: string | number;
    newShippingCost: number;
    observation: string;
  }>();

  displayedColumns: string[] = [
    'code',
    'company',
    'shipment_type',
    'recipient_name',
    'recipient_phone',
    'delivery_district_name',
    'delivery_address',
    'amount_to_collect_at_delivery',
    // 'delivery_date',
    'shipping_cost',
    'observation_shipping_cost_modification',
    // 'recipient_phone', // Puedes decidir cuáles mostrar por defecto
    // 'createdAt',
    // 'shipping_cost',
    'actions',
  ];
  dataSource: MatTableDataSource<Order_> = new MatTableDataSource<Order_>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly OrderStatus = OrderStatus; // Para usar la enum en la plantilla

  constructor(private http: HttpClient) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] && this.orders) {
      this.dataSource.data = this.orders;
    }
  }

  ngAfterViewInit(): void {
    // El sort y paginator ya están configurados para emitir eventos al padre
    // No es necesario configurar dataSource.sort y dataSource.paginator aquí
    // si el padre maneja la paginación y el ordenamiento del lado del servidor.
    // Si es del lado del cliente, SÍ debes configurarlos:
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  // --- Funciones de ayuda para la lógica de acciones ---
  canMarkAs(order: Order, targetStatus: OrderStatus): boolean {
    // Lógica simplificada, necesitarás adaptarla a tu flujo exacto de estados
    // y roles de usuario (que obtendrías de tu AppStore o AuthService)
    const currentStatus = order.status;
    // const userRole = this.appStore.currentUser()?.role;

    // if (userRole === 'MOTORIZADO' || userRole === 'ADMINISTRADOR') {
    // switch (targetStatus) {
    //   case OrderStatus.EN_TRANSITO:
    //     return (
    //       currentStatus === OrderStatus.LISTO_PARA_RECOGER ||
    //       currentStatus === OrderStatus.EN_PREPARACION
    //     );
    //   case OrderStatus.ENTREGADO:
    //     return currentStatus === OrderStatus.EN_TRANSITO;
    //   case OrderStatus.NO_ENTREGADO: // O INCIDENCIA
    //     return currentStatus === OrderStatus.EN_TRANSITO;
    //   // Añade más casos según tu lógica
    //   default:
    //     return false;
    // }
    // }
    return false;
  }

  onViewPdf(order: Order_): void {
    this.http
      .get(order.product_delivery_photo_url || '', { responseType: 'blob' })
      .subscribe((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'filename';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  onSeguimiento(order: Order): void {
    window.open('/tracking?code=' + order.tracking_code, '_blank');
  }

  onViewOrderDetails(order: Order_): void {
    this.viewDetailsClicked.emit(order);
    this.dialog.open(OrderDetailDialogComponent, {
      width: '750px', // Puedes ajustar esto
      maxWidth: '90vw',
      maxHeight: '90vh', // Añadir para controlar altura
      data: {
        order: order,
      },
      panelClass: 'order-detail-dialog-responsive', // Clase para estilos globales si necesitas
      autoFocus: 'dialog', // Para enfocar el diálogo
    });
  }

  onReschedule(order: Order): void {
    console.log('Reschedule order:', order.code);
    this.snackBar.open('Función "Reprogramar" no implementada.', 'OK', {
      duration: 2000,
    });
  }

  openEditShippingCostModal(order: Order_): void {
    if (
      !order.id ||
      order.shipping_cost === undefined ||
      order.shipping_cost === null
    ) {
      console.error(
        'Order ID or current shipping cost is missing for editing.',
        order
      );
      // Podrías mostrar un snackbar aquí
      this.snackBar.open(
        'No se puede modificar el costo: faltan datos del pedido.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open<
      EditShippingCostDialogComponent,
      EditShippingCostDialogData,
      EditShippingCostDialogResult
    >(EditShippingCostDialogComponent, {
      width: '500px', // Ajusta el ancho
      data: {
        orderCode: order.code || order.id.toString(), // Muestra el código o ID
        currentShippingCost: order.shipping_cost,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si el usuario confirmó y no cerró con undefined
        console.log('Edit Shipping Cost Dialog result:', result);
        this.shippingCostChanged.emit({
          orderId: order.id, // o order.code si tu API usa eso
          newShippingCost: result.newShippingCost,
          observation: result.observation,
        });
      } else {
        console.log('Edición de costo de envío cancelada.');
      }
    });
  }
  hashavePermissionEdit(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA';
  }
}
