import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject,
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
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Order, Order_, OrderStatus } from '../../models/order.model';

import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppStore } from '../../../../app.store';
import heic2any from 'heic2any';

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
    // 'observation_shipping_cost_modification',
    // 'recipient_phone',
    // 'createdAt',
    // 'shipping_cost',
    'actions',
  ];
  dataSource: MatTableDataSource<Order_> = new MatTableDataSource<Order_>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly OrderStatus = OrderStatus;
  displayImageUrl: string | null = null;
  isLoadingImage: boolean = false;

  constructor(private http: HttpClient) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] && this.orders) {
      this.dataSource.data = this.orders;
    }
  }

  ngAfterViewInit(): void {}

  // async onDownload(order: Order_): Promise<void> {
  //   if (order && order.product_delivery_photo_url) {
  //     const imageUrl = order.product_delivery_photo_url;

  //     if (
  //       imageUrl.toLowerCase().endsWith('.heic') ||
  //       imageUrl.toLowerCase().endsWith('.heif')
  //     ) {
  //       await this.convertHeicToJpeg(imageUrl);
  //       const link = document.createElement('a');

  //       link.download = 'filename';
  //       link.href = this.displayImageUrl || '';
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       order.product_delivery_photo_url = imageUrl;
  //       this.http
  //         .get(order.product_delivery_photo_url || '', { responseType: 'blob' })
  //         .subscribe((blob) => {
  //           const link = document.createElement('a');
  //           link.href = URL.createObjectURL(blob);
  //           link.download = 'filename';
  //           document.body.appendChild(link);
  //           link.click();
  //           document.body.removeChild(link);
  //         });
  //     }
  //   }
  // }

  async onViewImage(order: Order_): Promise<void> {
    if (order) {
      //   const imageUrl = order.product_delivery_photo_url;

      //   if (
      //     imageUrl.toLowerCase().endsWith('.heic') ||
      //     imageUrl.toLowerCase().endsWith('.heif')
      //   ) {
      //     await this.convertHeicToJpeg(imageUrl);
      //   } else {
      //     this.displayImageUrl = imageUrl;
      //   }
      // }
      // order.product_delivery_photo_url = this.displayImageUrl || '';
      this.viewDetailsClicked.emit(order);
      this.dialog.open(OrderDetailDialogComponent, {
        width: '750px',
        maxWidth: '100vw', // Permite que ocupe todo el ancho en móvil
        maxHeight: '100vh', // Permite que ocupe todo el alto en móvil
        panelClass: 'full-screen-modal-mobile', // Clase opcional si quieres forzar full screen
        data: { order: order },
        autoFocus: false, // Mejor para móvil
      });
    }

    // private async convertHeicToJpeg(heicUrl: string): Promise<void> {
    //   this.isLoadingImage = true;
    //   try {
    //     const response = await fetch(heicUrl);
    //     const heicBlob = await response.blob();

    //     const jpegBlob = (await heic2any({
    //       blob: heicBlob,
    //       toType: 'image/jpeg',
    //       quality: 0.8,
    //     })) as Blob;

    //     this.displayImageUrl = URL.createObjectURL(jpegBlob);
    //     console.log('Imagen HEIC convertida y lista para mostrar.');
    //   } catch (error) {
    //     console.error('Error al convertir la imagen HEIC en el frontend:', error);
    //   } finally {
    //     this.isLoadingImage = false;
    //   }
  }

  ngOnDestroy(): void {
    if (this.displayImageUrl && this.displayImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.displayImageUrl);
      console.log('Object URL liberado.');
    }
  }
}
