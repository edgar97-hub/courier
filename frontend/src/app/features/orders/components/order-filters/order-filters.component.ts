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
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderFilterCriteria } from '../../models/order-filter.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-filters',
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
  templateUrl: './order-filters.component.html',
  styleUrls: ['./order-filters.component.scss'],
})
export class OrderFiltersComponent implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<OrderFilterCriteria>();

  filterForm: FormGroup;
  orderStatuses$: Observable<string[]>;
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();

  activeDistricts$: Observable<string[]> = of([]);

  constructor() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm = this.fb.group({
      start_date: [firstDay],
      end_date: [lastDay],
      status: [null],
      search_term: [''],
      districts: [[]],
    });
    this.orderStatuses$ = this.orderService.getOrderStatuses();
  }

  ngOnInit(): void {
    this.loadActiveDistricts();

    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe(() => {
        this.applyFilters();
      });

    this.filterForm
      .get('start_date')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadActiveDistricts());
    this.filterForm
      .get('end_date')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadActiveDistricts());
  }

  loadActiveDistricts(): void {
    const start = this.filterForm.get('start_date')?.value;
    const end = this.filterForm.get('end_date')?.value;

    if (start && end) {
      const formattedStart = this.datePipe.transform(start, 'yyyy-MM-dd') || '';
      const formattedEnd = this.datePipe.transform(end, 'yyyy-MM-dd') || '';
      this.filterForm.get('districts')?.setValue([]);
      this.activeDistricts$ = this.orderService.getActiveDistricts(
        formattedStart,
        formattedEnd
      );
    } else {
      this.activeDistricts$ = of([]);
    }
  }

  applyFilters(): void {
    const formValues = this.filterForm.value;
    const filters: OrderFilterCriteria = {
      start_date: formValues.start_date
        ? this.datePipe.transform(formValues.start_date, 'yyyy-MM-dd')
        : null,
      end_date: formValues.end_date
        ? this.datePipe.transform(formValues.end_date, 'yyyy-MM-dd')
        : null,
      status: formValues.status || null,
      search_term: formValues.search_term?.trim() || null,
      districts: formValues.districts || [],
    };
    console.log('OrderFiltersComponent: Emitting filters', filters);
    this.filtersChanged.emit(filters);
  }

  clearFilters(): void {
    this.filterForm.reset({
      start_date: null,
      end_date: null,
      status: null,
      search_term: '',
      districts: [],
    });
    this.loadActiveDistricts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
