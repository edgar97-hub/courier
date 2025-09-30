import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { OrderEditionFormComponent } from '../order-edition-form/order-edition-form.component';
import { Order_, UpdateOrderRequestDto } from '../../models/order.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';

export interface OrderEditionDialogData {
  orderId: string;
}

@Component({
  selector: 'app-order-edition-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    OrderEditionFormComponent,
  ],
  templateUrl: './order-edition-dialog.component.html',
  styleUrls: ['./order-edition-dialog.component.scss'],
})
export class OrderEditionDialogComponent {
  @ViewChild(OrderEditionFormComponent)
  orderEditionForm!: OrderEditionFormComponent;
  private snackBar = inject(MatSnackBar);
  isFormValid: boolean = false;
  private orderService = inject(OrderService);
  order: Order_ | null = null;

  constructor(
    public dialogRef: MatDialogRef<OrderEditionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderEditionDialogData
  ) {}
  ngOnInit(): void {
    this.orderService.getOrderById(this.data.orderId).subscribe({
      next: (order: Order_) => {
        if (order) {
          this.order = order;
        }
      },
      error: (error: any) => {
        console.error('Error fetching order:', error);
        this.snackBar.open('Error al cargar el pedido.', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  onOrderUpdated(updatedOrder: UpdateOrderRequestDto): void {
    this.dialogRef.close(updatedOrder);
    this.snackBar.open('Pedido actualizado exitosamente.', 'Cerrar', {
      duration: 3000,
    });
  }

  onFormValidityChanged(isValid: boolean): void {
    this.isFormValid = isValid;
  }
}
