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

  constructor() {
    this.filterForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      status: [null],
      search_term: [''], // Para el input de búsqueda general en la tabla
    });
    this.orderStatuses$ = this.orderService.getOrderStatuses(); // Carga los estados
  }

  ngOnInit(): void {
    // Emitir cambios cuando el formulario cambie, con un debounce para no emitir en cada keystroke
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400), // Espera 400ms después del último cambio
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ) // Solo emite si los valores realmente cambiaron
      )
      .subscribe(() => {
        this.applyFilters();
      });
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
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
