// src/app/features/orders/components/order-detail-dialog/order-detail-dialog.component.ts
import { Component, Inject, signal, WritableSignal } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  CurrencyPipe,
  TitleCasePipe,
} from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips
import { DragDropModule } from '@angular/cdk/drag-drop'; // Para cdkDrag
import { Order, Order_, OrderStatus } from '../../models/order.model';
import { DefaultPipe } from '../../../../shared/pipes/default.pipe'; // <--- IMPORTA TU PIPE
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
export interface OrderDetailDialogData {
  order: Order_;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    DragDropModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
})
export class OrderDetailDialogComponent {
  isLoadingImage: WritableSignal<boolean> = signal(true); // Inicia cargando si hay URL
  imageLoadFailed: WritableSignal<boolean> = signal(false); //

  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailDialogData
  ) {
    if (!this.data.order.product_delivery_photo_url) {
      this.isLoadingImage.set(false);
      this.imageLoadFailed.set(true); // Si no hay URL de inicio, considera que falló o no hay imagen
    }
  }

  onImageLoad(): void {
    console.log(
      'EVENTO: onImageLoad DISPARADO para URL:',
      this.data.order.product_delivery_photo_url
    );
    this.isLoadingImage.set(false);
    this.imageLoadFailed.set(false);
    console.log('Imagen cargada');
  }

  onImageError(): void {
    this.isLoadingImage.set(false);
    this.imageLoadFailed.set(true);
    console.error('Error al cargar la imagen de evidencia.');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
