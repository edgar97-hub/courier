// src/app/features/orders/components/order-detail-dialog/order-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
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

export interface OrderDetailDialogData {
  order: Order_;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    TitleCasePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    DragDropModule, // Añadido para cdkDrag
    DefaultPipe,
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
})
export class OrderDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailDialogData
  ) {
    console.log('data', data);
  }

  // Para poder usar OrderStatus en el template si es necesario para estilos
  public OrderStatusEnum = OrderStatus;

  getStatusBadgeClass(status: OrderStatus | string | undefined | null): string {
    if (!status) {
      return 'status-desconocido';
    }
    const formattedStatus = status
      .toString()
      .toLowerCase()
      .replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  openMaps(coordinates: string | undefined): void {
    if (coordinates) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
        '_blank'
      );
    }
  }

  callPhone(phone: string | undefined): void {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  printOrder(): void {
    // Lógica más avanzada para imprimir solo el contenido del diálogo sería necesaria.
    // Por ahora, una simulación o la impresión de la ventana completa.
    console.log('Imprimiendo pedido (simulado):', this.data.order.code);
    this.dialogRef.close('print'); // Puedes devolver una acción si quieres que el componente padre haga algo
    // window.print(); // Esto imprimirá toda la página
  }
}
