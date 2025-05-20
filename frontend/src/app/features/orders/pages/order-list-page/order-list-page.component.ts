import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // RouterModule si tienes links/botones de navegación
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator'; // Importar PageEvent
import { MatSort, Sort } from '@angular/material/sort'; // Importar Sort
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  catchError,
} from 'rxjs/operators';

import { OrderFiltersComponent } from '../../components/order-filters/order-filters.component';
import { OrderTableComponent } from '../../components/order-table/order-table.component';
import { OrderService } from '../../services/order.service';
import { Order, PaginatedOrdersResponse } from '../../models/order.model';
import { OrderFilterCriteria } from '../../models/order-filter.model';

// Para el título y breadcrumbs (opcional)
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderFiltersComponent,
    OrderTableComponent,
    MatSnackBarModule,
    MatButtonModule, // Para el botón de Acciones Masivas
    MatIconModule, // Para iconos en botones
    MatMenuModule,
  ],
  templateUrl: './order-list-page.component.html',
  styleUrls: ['./order-list-page.component.scss'],
})
export class OrderListPageComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private router = inject(Router); // Si necesitas navegar
  private snackBar = inject(MatSnackBar);

  orders: Order[] = [];
  isLoading = false;
  totalOrderCount = 0;
  currentPageIndex = 0; // Paginator es base 0
  currentPageSize = 10; // Valor inicial para el paginador
  currentSortField = 'registration_date'; // Campo de ordenamiento inicial
  currentSortDirection: 'asc' | 'desc' = 'desc'; // Dirección inicial

  // Subject para manejar los filtros actuales
  private filterCriteriaSubject = new BehaviorSubject<OrderFilterCriteria>({});
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Escuchar cambios en los filtros y recargar datos
    this.filterCriteriaSubject
      .pipe(
        takeUntil(this.destroy$),
        // debounceTime(300), // Opcional: añadir debounce si los filtros emiten muy rápido
        // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap(() => (this.currentPageIndex = 0)) // Resetear a la primera página cuando los filtros cambian
      )
      .subscribe((criteria) => {
        this.fetchOrders();
      });
  }

  fetchOrders(): void {
    this.isLoading = true;
    const currentFilters = this.filterCriteriaSubject.value;

    this.orderService
      .getOrders(
        currentFilters,
        this.currentPageIndex + 1, // API suele esperar page index 1-based
        this.currentPageSize,
        this.currentSortField,
        this.currentSortDirection
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open(
            error.message || 'Failed to load orders.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.isLoading = false;
          return []; // Devuelve un array vacío o un observable vacío para que la cadena no se rompa
        })
      )
      .subscribe((response: PaginatedOrdersResponse) => {
        this.orders = response.items;
        this.totalOrderCount = response.total_count;
        this.isLoading = false;
        console.log('Orders fetched:', response);
      });
  }

  onFiltersChanged(filters: OrderFilterCriteria): void {
    console.log('OrderListPage: Filters changed', filters);
    this.filterCriteriaSubject.next(filters);
    // fetchOrders se llamará a través de la suscripción a filterCriteriaSubject
  }

  onPageChanged(event: PageEvent): void {
    console.log('OrderListPage: Page changed', event);
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.fetchOrders();
  }

  onSortChanged(sort: Sort): void {
    console.log('OrderListPage: Sort changed', sort);
    this.currentSortField = sort.active;
    this.currentSortDirection = sort.direction as 'asc' | 'desc'; // El tipo SortDirection puede ser '', pero nuestro servicio espera 'asc' o 'desc'
    this.currentPageIndex = 0; // Resetear a la primera página al cambiar el orden
    this.fetchOrders();
  }

  // Placeholder para acciones masivas
  handleMassiveActions(action: string): void {
    console.log('Massive action selected:', action);
    // Implementar lógica para acciones masivas
    this.snackBar.open(`Action: ${action} not implemented yet.`, 'OK', {
      duration: 3000,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
