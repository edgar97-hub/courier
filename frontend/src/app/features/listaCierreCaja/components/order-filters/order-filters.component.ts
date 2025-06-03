import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe para formatear fechas
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core'; // MatNativeDateModule para datepicker
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderFilterCriteria } from '../../models/order-filter.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-filters',
  standalone: true,
  providers: [
    provideNativeDateAdapter(), // Necesario para MatDatepicker
    DatePipe, // Para formatear la fecha al enviar
  ],
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

  private initialLoad = true;
  constructor() {
    this.filterForm = this.fb.group({
      delivery_date: [new Date()],
      status: [null],
      search_term: [''],
    });
    this.orderStatuses$ = this.orderService.getOrderStatuses();
  }

  ngOnInit(): void {
    console.log(
      'OrderFiltersComponent: ngOnInit - Instance Created/Initialized'
    );
    this.emitSpecificFilters({
      delivery_date: this.filterForm.get('delivery_date')?.value,
    });

    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((formValues) => {
        this.applyAllFilters(formValues);
      });
  }
  private emitSpecificFilters(criteria: Partial<OrderFilterCriteria>): void {
    const filtersToEmit: OrderFilterCriteria = {
      delivery_date: criteria.delivery_date
        ? this.datePipe.transform(criteria.delivery_date, 'yyyy-MM-dd')
        : null,
      status: criteria.status !== undefined ? criteria.status : null, // Si quieres enviar status null
      search_term:
        criteria.search_term !== undefined ? criteria.search_term : null, // Si quieres enviar search_term null
      // Asegúrate de que el resto de los campos en OrderFilterCriteria sean opcionales o tengan un valor por defecto
    };
    console.log(
      'OrderFiltersComponent: Emitting SPECIFIC filters',
      filtersToEmit
    );
    this.filtersChanged.emit(filtersToEmit);
  }
  private emitInitialFilters(): void {
    const initialDate = this.filterForm.get('delivery_date')?.value;
    const initialFilters: Partial<OrderFilterCriteria> = {
      delivery_date: initialDate
        ? this.datePipe.transform(initialDate, 'yyyy-MM-dd')
        : null,
    };

    this.filtersChanged.emit(initialFilters as OrderFilterCriteria);
    this.initialLoad = false;
  }

  applyAllFilters(formValues: any): void {
    const filters: OrderFilterCriteria = {
      delivery_date: formValues.delivery_date
        ? this.datePipe.transform(formValues.delivery_date, 'yyyy-MM-dd')
        : null,
      status: formValues.status || null,
      search_term: formValues.search_term?.trim() || null,
    };
    this.filtersChanged.emit(filters);
  }
  applyFilters(): void {
    const formValues = this.filterForm.value;
    const filters: OrderFilterCriteria = {
      delivery_date: formValues.delivery_date
        ? this.datePipe.transform(formValues.delivery_date, 'yyyy-MM-dd')
        : null,
      status: formValues.status || null,
      search_term: formValues.search_term?.trim() || null,
    };
    this.filtersChanged.emit(filters);
  }

  clearFilters(): void {
    this.filterForm.reset({
      delivery_date: new Date(),
      status: null,
      search_term: '',
    });
    this.initialLoad = true;
    this.emitSpecificFilters({
      delivery_date: this.filterForm.get('delivery_date')?.value,
    });
  }

  ngOnDestroy(): void {
    console.log('OrderFiltersComponent: ngOnDestroy - Instance Destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
