import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, tap, catchError, debounceTime } from 'rxjs/operators';

// Import models and services related to Planning Events
import {
  PlanningEvent,
  PaginatedPlanningEventsResponse,
} from '../../models/planning-event.model';
import { PlanningEventService } from '../../services/planning-event.service';
import { PlanningEventFilterCriteria } from '../../models/planning-event-filter.model';

// Import components
import { PlanningEventsTableComponent } from '../../components/planning-events-table/planning-events-table.component';
import { PlanningEventsFiltersComponent } from '../../components/planning-events-filters/planning-events-filters.component';
import { PlanningEventImportModalComponent } from '../../components/planning-event-import-modal/planning-event-import-modal.component';

@Component({
  selector: 'app-planning-events-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    PlanningEventsTableComponent,
    PlanningEventsFiltersComponent,
  ],
  templateUrl: './planning-events-list-page.component.html',
  styleUrls: ['./planning-events-list-page.component.scss'],
})
export class PlanningEventsListPageComponent implements OnInit, OnDestroy {
  private planningEventsService = inject(PlanningEventService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  planningEvents: PlanningEvent[] = [];
  isLoading = false;
  totalPlanningEventCount = 0;
  currentPageIndex = 0;
  currentPageSize = 10;
  currentSortField = 'planningDate';
  currentSortDirection: 'asc' | 'desc' = 'desc';
  private datePipe = inject(DatePipe);

  now = new Date();
  firstDay = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
  lastDay = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0);

  private filterCriteriaSubject =
    new BehaviorSubject<PlanningEventFilterCriteria>({
      startDate: this.datePipe.transform(this.firstDay, 'yyyy-MM-dd'),
      endDate: this.datePipe.transform(this.lastDay, 'yyyy-MM-dd'),
      status: null,
    });
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.filterCriteriaSubject
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.currentPageIndex = 0)) // Resetear a la primera página cuando los filtros cambian
      )
      .subscribe(() => {
        this.fetchPlanningEvents();
      });
  }

  fetchPlanningEvents(): void {
    this.isLoading = true;
    const currentFilters = this.filterCriteriaSubject.value ?? 1;
    this.planningEventsService
      .getPlanningEvents(
        currentFilters,
        this.currentPageIndex + 1,
        this.currentPageSize,
        this.currentSortField,
        this.currentSortDirection
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open(
            error.message || 'Failed to load planning events.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.isLoading = false;
          return [];
        })
      )
      .subscribe((response: PaginatedPlanningEventsResponse) => {
        this.planningEvents = response.items;
        this.totalPlanningEventCount = response.total_count || 0;
        this.isLoading = false;
        console.log('Planning Events fetched:', response);
      });
  }

  openImportModal(): void {
    const dialogRef = this.dialog.open(PlanningEventImportModalComponent, {
      width: '90%', // Hacerlo más ancho por defecto, el componente interno puede tener max-width
      maxWidth: '700px', // Máximo ancho para desktop
      autoFocus: false, // Evitar que el primer botón tome foco automáticamente
      // disableClose: true, // Si quieres que solo se cierre con botones
    });

    dialogRef.componentInstance.importCompleted.subscribe(
      (success: boolean) => {
        if (success) {
          console.log('Import completed, reloading orders...');
          this.fetchPlanningEvents(); // Recargar la lista de pedidos si la importación fue exitosa
        }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The import dialog was closed', result);
      // Puedes hacer algo con el 'result' si el modal devuelve datos al cerrarse
    });
  }

  onFiltersChanged(filters: PlanningEventFilterCriteria): void {
    console.log('PlanningEventsListPage: Filters changed', filters);
    this.filterCriteriaSubject.next(filters);
  }

  onPageChanged(event: PageEvent): void {
    console.log('PlanningEventsListPage: Page changed', event);
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.fetchPlanningEvents();
  }

  onSortChanged(sort: Sort): void {
    console.log('PlanningEventsListPage: Sort changed', sort);
    this.currentSortField = sort.active;
    this.currentSortDirection = sort.direction as 'asc' | 'desc';
    this.currentPageIndex = 0;
    this.fetchPlanningEvents();
  }

  onViewDetails(planningEventId: number): void {
    this.router.navigate(['/planning-events', planningEventId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
