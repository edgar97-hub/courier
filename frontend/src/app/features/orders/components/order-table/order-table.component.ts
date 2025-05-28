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
// Necesitarás crear estos componentes de diálogo más adelante
import {
  ChangeStatusDialogComponent,
  ChangeStatusDialogResult,
} from '../change-status-dialog/change-status-dialog.component';
// import { ReportIssueDialogComponent } from '../report-issue-dialog/report-issue-dialog.component';
import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component'; //
import { environment } from '../../../../../environments/environment';
import {
  AssignDriverDialogComponent,
  AssignDriverDialogResult,
} from '../assign-driver-dialog/assign-driver-dialog.component'; // <--- IMPORTA EL DIÁLOGO
import { User } from '../../../../shared/models/user';
import { RescheduleOrderDialogComponent } from '../reschedule-order-dialog/reschedule-order-dialog.component';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
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
  // ... otros outputs para acciones específicas si las manejas en el componente padre

  displayedColumns: string[] = [
    'code',
    'shipment_type',
    'recipient_name',
    'status', // Moví estado más a la izquierda para visibilidad
    'delivery_district_name',
    'delivery_date',
    'amount_to_collect_at_delivery',
    'tracking_code',
    // 'recipient_phone', // Puedes decidir cuáles mostrar por defecto
    // 'createdAt',
    // 'shipping_cost',
    'actions',
  ];
  dataSource: MatTableDataSource<Order_> = new MatTableDataSource<Order_>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyectar servicios de Material
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  // private orderService = inject(OrderService); // Inyecta tu servicio de pedidos

  readonly OrderStatus = OrderStatus; // Para usar la enum en la plantilla

  constructor() {}

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
    // const pdfUrl = `http://127.0.0.1:8000/api/orders/${order.id}/pdf`;
    const pdfUrl = environment.apiUrl + '/orders/' + order.id + '/pdf';
    window.open(pdfUrl, '_blank');
    this.viewPdfClicked.emit(order);
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

  openChangeStatusModal(order: Order_): void {
    const availableStatuses = this.getAvailableStatuses(order);
    if (availableStatuses.length === 0) {
      this.snackBar.open(
        'No hay cambios de estado disponibles para este pedido.',
        'OK',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open<
      ChangeStatusDialogComponent,
      { order: Order_; availableStatuses: OrderStatus[] },
      ChangeStatusDialogResult
    >(ChangeStatusDialogComponent, {
      width: '450px', // Ajusta el ancho según necesites
      data: { order: order, availableStatuses: availableStatuses },
      disableClose: true, // Evita que se cierre al hacer clic fuera
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.newStatus) {
        console.log('Dialog result:', result);
        const updatePayload: any = {
          newStatus: result.newStatus,
          reason: result.reason || '',
          proofOfDeliveryImageUrl: '',
          shippingCostPaymentMethod: '',
          collectionPaymentMethod: '',
        };
        if (result.newStatus === OrderStatus.ENTREGADO) {
          if (result.proofOfDeliveryImageUrl) {
            updatePayload.proofOfDeliveryImageUrl =
              result.proofOfDeliveryImageUrl;
          }
          if (result.shippingCostPaymentMethod) {
            updatePayload.shippingCostPaymentMethod =
              result.shippingCostPaymentMethod;
          }
          if (result.collectionPaymentMethod) {
            updatePayload.collectionPaymentMethod =
              result.collectionPaymentMethod;
          }
        }
        console.log('updatePayload', updatePayload);
        this.statusChanged.emit({
          orderId: order.id, // o order.code si usas el código como identificador
          // newStatus: result.newStatus,
          // details: result.reason ? { reason: result.reason } : undefined,
          // reason: result.reason
          ...updatePayload, // Esparce el payload aquí
        });
      } else {
        console.log('Cambio de estado cancelado o sin selección.');
      }
    });
  }

  getAvailableStatuses(order: Order_): OrderStatus[] {
    switch (order.status) {
      case OrderStatus.REGISTRADO:
        return [
          OrderStatus.RECOGIDO,
          OrderStatus.EN_ALMACEN,
          OrderStatus.CANCELADO,
        ];
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

  // Abrir modal para reportar incidencia
  openReportIssueModal(order: Order): void {
    console.log(`Open modal to report issue for order: ${order.code}`);
    // const dialogRef = this.dialog.open(ReportIssueDialogComponent, {
    //   width: '450px',
    //   data: { order: order }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result.issueDescription) {
    //     this.statusChanged.emit({ orderId: order.id, newStatus: OrderStatus.INCIDENCIA, details: result });
    //   }
    // });
  }

  onViewOrderDetails(order: Order_): void {
    this.viewDetailsClicked.emit(order);
    this.dialog.open(OrderDetailDialogComponent, {
      width: '750px', // Puedes ajustar esto
      maxWidth: '90vw',
      maxHeight: '90vh', // Añadir para controlar altura
      data: { order: order },
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

  openAssignDriverModal(order: Order_): void {
    console.log(`Open modal to assign driver for order: ${order.code}`);
    const dialogRef = this.dialog.open<
      AssignDriverDialogComponent,
      { order: Order_; currentDriverId?: string | number | null },
      AssignDriverDialogResult
    >(AssignDriverDialogComponent, {
      width: '550px', // Ajusta el ancho
      data: { order: order, currentDriverId: order.assigned_driver?.uid },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.selectedDriver) {
        console.log(
          'Driver selected from dialog:',
          order.id,
          result.selectedDriver
        );
        this.motorizedChanged.emit({
          orderId: order.id,
          motorizedId: result.selectedDriver.id,
        });
      } else {
        console.log('Assign driver cancelled or no driver selected.');
      }
    });
  }

  openRescheduleOrderModal(order: Order_): void {
    console.log(`Open modal to reschedule order: ${order.code}`);

    const minRescheduleDate = new Date();
    minRescheduleDate.setDate(minRescheduleDate.getDate() + 1);
    interface RescheduleOrderDialogResult {
      newDeliveryDate: Date;
      reason: string;
    }
    const dialogRef = this.dialog.open<
      RescheduleOrderDialogComponent,
      { order: Order_; minDate: Date },
      RescheduleOrderDialogResult
    >(RescheduleOrderDialogComponent, {
      width: '500px',
      data: { order: order, minDate: minRescheduleDate },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.newDeliveryDate) {
        console.log('Reschedule details from dialog:', result);
        this.rescheduleChanged.emit({
          orderId: order.id,
          newDate: result.newDeliveryDate,
          reason: result.reason,
        });
      } else {
        console.log('Reschedule cancelled or no new date selected.');
      }
    });
  }

  isAdminOrDriver(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'ADMINISTRADOR' || userRole === 'MOTORIZADO';
  }

  isAdminOrReceptionist(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA';
  }

  isAdminUser(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'ADMINISTRADOR';
  }
}
