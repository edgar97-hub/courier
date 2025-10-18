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
import { CommonModule, DatePipe } from '@angular/common';
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
import {
  PlanningEvent,
  PlanningEventStatus,
} from '../../models/planning-event.model';
import { OrderStatus, STATES } from '../../../orders/models/order.model';

@Component({
  selector: 'app-planning-events-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
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
  templateUrl: './planning-events-table.component.html',
  styleUrls: ['./planning-events-table.component.scss'],
})
export class PlanningEventsTableComponent implements AfterViewInit, OnChanges {
  @Input() planningEvents: PlanningEvent[] | null = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() viewDetailsClicked = new EventEmitter<number>();

  displayedColumns: string[] = [
    'planningEventIdExternal',
    'planningDate',
    'total_routes',
    'total_stops',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<PlanningEvent> =
    new MatTableDataSource<PlanningEvent>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly PlanningEventStatus = PlanningEventStatus;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['planningEvents'] && this.planningEvents) {
      this.dataSource.data = this.planningEvents;
    }
  }

  ngAfterViewInit(): void {
    // Paginator and sort are handled by the parent component (server-side pagination/sorting)
  }

  getStatusClass(order: any | undefined | null): string {
    let isCompleted = order.routes.every((route: any) => {
      return route.stops.every((stop: any) => {
        if (
          stop.order.status === OrderStatus.ENTREGADO ||
          stop.order.status === OrderStatus.RECHAZADO ||
          stop.order.status === OrderStatus.ANULADO
        ) {
          return true;
        }
        return false;
      });
    });
    let status = isCompleted ? 'completed' : 'pending';
    const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }

  getStatus(order: any | undefined | null): string {
    let isCompleted = order.routes.every((route: any) => {
      return route.stops.every((stop: any) => {
        if (
          stop.order.status === OrderStatus.ENTREGADO ||
          stop.order.status === OrderStatus.RECHAZADO ||
          stop.order.status === OrderStatus.ANULADO
        ) {
          return true;
        }
        return false;
      });
    });
    let status = isCompleted ? 'COMPLETADO' : 'PENDIENTE';
    return status;
  }

  getTotalStops(event: any): number {
    return event.routes.reduce((acumulator: number, router: any) => {
      return router.stops?.length + acumulator;
    }, 0);
  }

  onViewDetails(planningEvent: PlanningEvent): void {
    this.viewDetailsClicked.emit(planningEvent.id);
  }
}
