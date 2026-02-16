import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewOrderData } from '../../models/order.model';

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
  @Output() removeOrder = new EventEmitter<string>();

  displayedColumns: string[] = [
    'recipient_name',
    'recipient_phone',
    'delivery_date',
    'delivery_district_name',
    'delivery_address',
    'item_description',
    'amount_to_collect_at_delivery',
    'shipping_cost',
    'payment_method_for_collection',
    'observations',
    'actions',
  ];

  constructor() {}

  onRemoveOrder(tempId: string | undefined): void {
    if (tempId) {
      this.removeOrder.emit(tempId);
    }
  }
}
