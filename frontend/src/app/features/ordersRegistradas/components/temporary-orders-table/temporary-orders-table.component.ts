import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Pipes
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewOrderData } from '../../models/order.model'; // Usamos NewOrderData que tiene temp_id y district_name

@Component({
  selector: 'app-temporary-orders-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './temporary-orders-table.component.html',
  styleUrls: ['./temporary-orders-table.component.scss'],
})
export class TemporaryOrdersTableComponent {
  @Input() pendingOrders: NewOrderData[] = [];
  @Output() removeOrder = new EventEmitter<string>(); // Emitimos el temp_id para eliminar

  displayedColumns: string[] = [
    'recipient_name',
    'recipient_phone',
    'delivery_date',
    'delivery_district_name', // Usamos el nombre del distrito
    'delivery_address',
    'item_description', // Producto
    'amount_to_collect_at_delivery', // Cobrar
    'shipping_cost', // Costo de envío
    'payment_method_for_collection', // Método de Pago
    'observations',
    'actions', // Para el botón de quitar
  ];

  constructor() {}

  onRemoveOrder(tempId: string | undefined): void {
    if (tempId) {
      this.removeOrder.emit(tempId);
    }
  }
}
