import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlanningEventFilterCriteria } from '../../models/planning-event-filter.model';
import { PlanningEventStatus } from '../../models/planning-event.model';

@Component({
  selector: 'app-planning-events-filters',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './planning-events-filters.component.html',
  styleUrls: ['./planning-events-filters.component.scss'],
})
export class PlanningEventsFiltersComponent implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<PlanningEventFilterCriteria>();

  filterForm: FormGroup;
  planningEventStatuses: PlanningEventStatus[] =
    Object.values(PlanningEventStatus);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();

  private statusLabelMap: Record<string, string> = {
    [PlanningEventStatus.PENDING]: 'Pendiente',
    [PlanningEventStatus.COMPLETED]: 'Completado',
  };

  getStatusLabel(status: string): string {
    return this.statusLabelMap[status] ?? status;
  }

  constructor() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm = this.fb.group({
      startDate: [firstDay],
      endDate: [lastDay],
      status: [null],
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400), // Espera 400ms después del último cambio
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  applyFilters(): void {
    const formValues = this.filterForm.value;
    const filters: PlanningEventFilterCriteria = {
      startDate: formValues.startDate
        ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-dd')
        : null,
      endDate: formValues.endDate
        ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-dd')
        : null,
      status: formValues.status || null,
    };
    console.log('PlanningEventsFiltersComponent: Emitting filters', filters);
    this.filtersChanged.emit(filters);
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      status: null,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
