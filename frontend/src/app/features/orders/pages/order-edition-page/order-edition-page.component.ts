import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, Order_ } from '../../models/order.model';
import { OrderEditionFormComponent } from '../../components/order-edition-form/order-edition-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-edition-page',
  standalone: true,
  imports: [
    CommonModule,
    OrderEditionFormComponent,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-edition-page.component.html',
  styleUrls: ['./order-edition-page.component.scss'],
})
export class OrderEditionPageComponent implements OnInit {
  orderId: string | null = null;
  order: Order_ | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order: Order_) => {
          console.log(order);
          this.order = order;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error fetching order:', error);
          this.isLoading = false;
          this.snackBar.open('Error al cargar el pedido.', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/orders']);
        },
      });
    } else {
      this.snackBar.open('ID de pedido no proporcionado.', 'Cerrar', {
        duration: 3000,
      });
      this.router.navigate(['/orders']);
    }
  }

  onOrderUpdated(updatedOrder: Order_): void {
    this.router.navigate(['/orders']);
    this.snackBar.open('Pedido actualizado exitosamente.', 'Cerrar', {
      duration: 3000,
    });
  }
}
