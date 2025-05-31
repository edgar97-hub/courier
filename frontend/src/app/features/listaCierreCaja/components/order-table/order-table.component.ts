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
  // ... otros outputs para acciones específicas si las manejas en el componente padre

  displayedColumns: string[] = [
    'code',
    'company',
    'recipient_name',
    'delivery_district_name',
    'motorizado',
    'status',
    'amount_to_collect_at_delivery',

    'efectivo_monto_cobrar',
    'pago_directo_monto_cobrar',
    // 'pos_monto_cobrar',

    'efectivo_costo_servicio',
    'pago_directo_costo_servicio',
    // 'pos_costo_servicio',
    'usuario_creacion',
    // 'recipient_phone',
    // 'delivery_address',
    // 'delivery_date',
    // 'shipping_cost',
    // 'recipient_phone', // Puedes decidir cuáles mostrar por defecto
    // 'createdAt',
    // 'shipping_cost',
    // 'actions',
  ];
  dataSource: MatTableDataSource<Order_> = new MatTableDataSource<Order_>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyectar servicios de Material
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  // private orderService = inject(OrderService); // Inyecta tu servicio de pedidos

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

  changeOrderStatus(order: Order, newStatus: OrderStatus): void {
    // Podrías mostrar un diálogo de confirmación aquí
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Confirmar Cambio', message: `¿Marcar pedido ${order.code} como ${newStatus}?`}});
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    console.log(`Changing status of order ${order.code} to ${newStatus}`);
    this.statusChanged.emit({ orderId: order.id, newStatus });
    // Lógica para llamar al servicio y manejar la respuesta estaría en el componente padre
    // Ejemplo: this.orderService.updateStatus(order.id, newStatus).subscribe(...);
    // this.snackBar.open(`Pedido ${order.code} marcado como ${newStatus}`, 'OK', { duration: 2500 });
    //   }
    // });
  }
  getStatusClass(status: string | undefined | null): string {
    if (!status) {
      return 'status-desconocido'; // O una clase por defecto
    }
    const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }

  getAvailableStatuses(order: Order_): OrderStatus[] {
    switch (order.status) {
      case OrderStatus.REGISTRADO:
        return [OrderStatus.RECOGIDO, OrderStatus.CANCELADO];
      case OrderStatus.RECOGIDO:
        return [OrderStatus.EN_ALMACEN, OrderStatus.CANCELADO];
      case OrderStatus.EN_ALMACEN:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
      case OrderStatus.EN_TRANSITO:
      case OrderStatus.EN_TRANSITO:
        return [
          OrderStatus.ENTREGADO,
          OrderStatus.CANCELADO,
          OrderStatus.RECHAZADO,
          OrderStatus.REPROGRAMADO,
        ];
      case OrderStatus.REPROGRAMADO:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
      default:
        return [];
    }
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

  onUploadProof(order: Order): void {
    console.log('Upload proof for order:', order.code);
    this.snackBar.open('Función "Subir Prueba" no implementada.', 'OK', {
      duration: 2000,
    });
  }

  onReschedule(order: Order): void {
    console.log('Reschedule order:', order.code);
    this.snackBar.open('Función "Reprogramar" no implementada.', 'OK', {
      duration: 2000,
    });
  }

  isAdminOrDriver(): boolean {
    // const userRole = this.appStore.currentUser()?.role;
    // return userRole === 'ADMINISTRADOR' || userRole === 'MOTORIZADO';
    return true; // Placeholder
  }

  isAdminUser(): boolean {
    // const userRole = this.appStore.currentUser()?.role;
    // return userRole === 'ADMINISTRADOR';
    return true; // Placeholder
  }
}
