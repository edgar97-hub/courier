import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete'; // Para búsqueda mejorada
import { MatListModule } from '@angular/material/list'; // Para mostrar resultados de búsqueda
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  startWith,
  tap,
  map,
  catchError,
} from 'rxjs/operators';

import { Order, Order_ } from '../../models/order.model'; // Ajusta la ruta a tu modelo Order
import { OrderService } from '../../services/order.service';
import { User } from '../../../../shared/models/user';

export interface AssignDriverDialogData {
  order: Order_;
  currentDriverId?: string | number | null; // ID del motorizado actualmente asignado (si lo hay)
}

export interface AssignDriverDialogResult {
  selectedDriver: User; // Devolvemos el objeto Driver completo
}

@Component({
  selector: 'app-assign-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Usaremos Reactive Forms
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule, // Se puede usar si la lista es corta y sin búsqueda
    MatAutocompleteModule, // Mejor para listas largas con búsqueda
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],

  templateUrl: './assign-driver-dialog.component.html',
  styleUrls: ['./assign-driver-dialog.component.scss'],
})
export class AssignDriverDialogComponent implements OnInit, OnDestroy {
  assignDriverForm: FormGroup;
  drivers$: Observable<User[]> = of([]); // Observable para la lista de motorizados
  isLoadingDrivers = false;
  selectedDriver: User | null = null; // Para mantener el objeto Driver seleccionado

  // Para el autocompletado
  driverSearchCtrl = new FormControl('');
  filteredDrivers$: Observable<User[]>;

  private destroy$ = new Subject<void>();
  private orderService = inject(OrderService); // Inyectar servicio de motorizados
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<
      AssignDriverDialogComponent,
      AssignDriverDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: AssignDriverDialogData
  ) {
    this.assignDriverForm = this.fb.group({
      // El driverId se manejará a través de la selección del autocompletado
      // y se almacenará en this.selectedDriver
    });

    this.filteredDrivers$ = this.driverSearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoadingDrivers = true;
        console.log('searchTerm', searchTerm);
        return this.orderService.getAvailableDrivers(searchTerm || '').pipe(
          tap(() => (this.isLoadingDrivers = false)),
          catchError(() => {
            this.isLoadingDrivers = false;
            return of([]); // Devuelve array vacío en caso de error
          })
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // Si hay un motorizado actualmente asignado, intentar preseleccionar su nombre en la búsqueda
    if (this.data.currentDriverId && this.data.order.assigned_driver) {
      this.selectedDriver = this.data.order.assigned_driver;
      this.driverSearchCtrl.setValue(
        this.data.order.assigned_driver.username || '',
        {
          emitEvent: false,
        }
      );
    }
  }

  displayDriverName(driver: User | null): string {
    return driver && driver.name ? driver.name : '';
  }

  onDriverSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedDriver = event.option.value as User;
    console.log('Driver selected:', this.selectedDriver);
  }

  onConfirm(): void {
    if (this.selectedDriver) {
      this.dialogRef.close({ selectedDriver: this.selectedDriver });
    } else {
      // Opcional: Mostrar error si no se seleccionó ningún motorizado
      console.warn('No driver selected');
      // this.assignDriverForm.get('driverSearch')?.setErrors({'required': true}); // Marcar como error
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  clearSelection(): void {
    this.selectedDriver = null;
    this.driverSearchCtrl.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
