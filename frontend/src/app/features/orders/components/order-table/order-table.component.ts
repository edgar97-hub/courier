import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'; // Pipes necesarios
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
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips en acciones
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe, // Para formatear fechas
    CurrencyPipe, // Para formatear moneda
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss'],
})
export class OrderTableComponent implements AfterViewInit, OnChanges {
  @Input() orders: Order[] | null = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0; // Total de registros para el paginador (viene de la API)
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0; // El índice de la página actual (base 0)

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() sortChanged = new EventEmitter<Sort>();
  // @Output() viewOrder = new EventEmitter<Order>(); // Ejemplo si tuvieras acción de ver
  // @Output() editOrder = new EventEmitter<Order>();
  // @Output() deleteOrder = new EventEmitter<Order>();

  // Las claves DEBEN coincidir con las propiedades de tu interfaz Order (snake_case)
  // y con los matColumnDef en el HTML.
  displayedColumns: string[] = [
    'id',
    'shipment_type	',
    'recipient_name',
    'recipient_phone',
    'delivery_district_name',
    'createdAt',
    'delivery_date',
    'status',
    'amount_to_collect_at_delivery',
    'shipping_cost',
    'actions',
  ];
  dataSource: MatTableDataSource<Order> = new MatTableDataSource<Order>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders'] && this.orders) {
      this.dataSource.data = this.orders;
    }
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.sortChanged.emit(sortState);
      });
    }

    if (this.paginator) {
      this.paginator.page.subscribe((pageState: PageEvent) => {
        this.pageChanged.emit(pageState);
      });
    }
  }

  onViewDetails(order: Order): void {
    console.log('View details for:', order);
    // this.viewOrder.emit(order);
  }

  onEditOrder(order: Order): void {
    console.log('Edit order:', order);
    // this.editOrder.emit(order);
  }

  onDeleteOrder(order: Order): void {
    if (confirm(`Are you sure you want to delete order ${order.id}?`)) {
      console.log('Delete order:', order);
      // this.deleteOrder.emit(order);
    }
  }
}
