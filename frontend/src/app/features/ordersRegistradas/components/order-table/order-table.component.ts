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
import {
  EditAmountCollectDialogComponent,
  EditAmountCollectDialogResult,
  EditAmountCollectDialogData,
} from '../edit-amount-collect-dialog/edit-amount-collect-dialog-component'; // <--- IMPORTA EL NUEVO DIÁLOGO
import {
  EditShippingCostDialogComponent,
  EditShippingCostDialogResult,
  EditShippingCostDialogData,
} from '../edit-shipping-cost-dialog/edit-shipping-cost-dialog.component';

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
  @Output() amountToCollectChanged = new EventEmitter<{
    orderId: string | number;
    newAmount: number;
    observation: string;
  }>();

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
    'recipient_phone', // Puedes decidir cuáles mostrar por defecto
    'status', // Moví estado más a la izquierda para visibilidad
    'delivery_district_name',
    'delivery_address',
    // 'delivery_date',
    'createdAt',
    'motorizado',
    'amount_to_collect_at_delivery',
    'tracking_code',
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

  ngAfterViewInit(): void {}

  onViewPdfA4(order: Order_): void {
    const pdfUrl = environment.apiUrl + '/orders/' + order.id + '/pdf-rotulo';
    window.open(pdfUrl, '_blank');
  }

  onViewPdfA4Landscape(order: Order_): void {
    const pdfUrl =
      environment.apiUrl + '/orders/' + order.id + '/pdf-a4-landscape';
    window.open(pdfUrl, '_blank');
  }

  onViewPdfTicket80mm(order: Order_): void {
    const pdfUrl =
      environment.apiUrl + '/orders/' + order.id + '/pdf-ticket-80mm';
    window.open(pdfUrl, '_blank');
  }

  onSeguimiento(order: Order): void {
    window.open('/tracking?code=' + order.tracking_code, '_blank');
  }

  changeOrderStatus(order: Order, newStatus: OrderStatus): void {
    console.log(`Changing status of order ${order.code} to ${newStatus}`);
    this.statusChanged.emit({ orderId: order.id, newStatus });
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
          orderId: order.id,
          ...updatePayload,
        });
      } else {
        console.log('Cambio de estado cancelado o sin selección.');
      }
    });
  }

  getAvailableStatuses(order: Order_): OrderStatus[] {
    const userRole = this.appStore.currentUser()?.role;

    let almacen = [OrderStatus.EN_ALMACEN];
    if (userRole === 'MOTORIZADO' && OrderStatus.REGISTRADO) {
      almacen = [];
    }

    let anulado: any = [];
    if (userRole === 'ADMINISTRADOR') {
      anulado = [OrderStatus.ANULADO];
    }

    order.status === OrderStatus.REGISTRADO;
    switch (order.status) {
      case OrderStatus.REGISTRADO:
        return [
          OrderStatus.RECOGIDO,
          ...almacen,
          OrderStatus.CANCELADO,
          ...anulado,
        ];
      case OrderStatus.RECOGIDO:
        return [OrderStatus.EN_ALMACEN, OrderStatus.CANCELADO, ...anulado];
      case OrderStatus.EN_ALMACEN:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO, ...anulado];
      case OrderStatus.EN_TRANSITO:
        return [
          OrderStatus.ENTREGADO,
          OrderStatus.CANCELADO,
          OrderStatus.RECHAZADO,
          OrderStatus.REPROGRAMADO,
          ...anulado,
        ];
      case OrderStatus.REPROGRAMADO:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO, ...anulado];
      default:
        return [];
    }
  }

  // // Abrir modal para reportar incidencia
  // openReportIssueModal(order: Order): void {
  //   console.log(`Open modal to report issue for order: ${order.code}`);
  //   // const dialogRef = this.dialog.open(ReportIssueDialogComponent, {
  //   //   width: '450px',
  //   //   data: { order: order }
  //   // });

  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   if (result && result.issueDescription) {
  //   //     this.statusChanged.emit({ orderId: order.id, newStatus: OrderStatus.INCIDENCIA, details: result });
  //   //   }
  //   // });
  // }

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
    minRescheduleDate.setDate(minRescheduleDate.getDate());
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

  isAdminOrDriver(order: Order_): boolean {
    const userRole = this.appStore.currentUser()?.role;

    if (userRole === 'MOTORIZADO') {
      if (order.status === OrderStatus.REGISTRADO) {
        return true;
      }

      if (order.assigned_driver?.id === this.appStore.currentUser()?.id) {
        return true;
      }
    }
    if (userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA') {
      return true;
    }
    return false;
  }

  isAdminOrReceptionist(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA';
  }

  openEditAmountToCollectModal(order: Order_): void {
    if (!order.id) {
      console.error(
        'Order ID or current monto a cabrar is missing for editing.',
        order
      );
      this.snackBar.open(
        'No se puede modificar el monto a cabrar: faltan datos del pedido.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open<
      EditAmountCollectDialogComponent,
      EditAmountCollectDialogData,
      EditAmountCollectDialogResult
    >(EditAmountCollectDialogComponent, {
      width: '500px',
      data: {
        orderCode: order.code,
        currentAmount: order.amount_to_collect_at_delivery,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Edit Shipping Cost Dialog result:', result);
        this.amountToCollectChanged.emit({
          orderId: order.id,
          newAmount: result.newAmount,
          observation: result.observation,
        });
      } else {
        console.log('Edición de costo de envío cancelada.');
      }
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
}
