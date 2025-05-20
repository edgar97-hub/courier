import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  WritableSignal,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field'; // Para el select de pickup
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { OrderCreationFormComponent } from '../../components/order-creation-form/order-creation-form.component';
import { TemporaryOrdersTableComponent } from '../../components/temporary-orders-table/temporary-orders-table.component';
import { OrderService } from '../../services/order.service';
import {
  NewOrderData,
  CreateBatchOrderPayload,
} from '../../models/order.model';

@Component({
  selector: 'app-order-create-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Para el breadcrumb o links de volver
    ReactiveFormsModule, // Para los controles de pickup y terms
    OrderCreationFormComponent,
    TemporaryOrdersTableComponent,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule, // Para el select de pickup_option
    MatFormFieldModule, // Para el select de pickup_option
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-create-page.component.html',
  styleUrls: ['./order-create-page.component.scss'],
})
export class OrderCreatePageComponent implements OnInit, OnDestroy {
  @ViewChild(OrderCreationFormComponent)
  orderCreationFormComponent!: OrderCreationFormComponent;

  pendingOrders: WritableSignal<NewOrderData[]> = signal([]);
  isSubmittingBatch: WritableSignal<boolean> = signal(false);
  isOrderFormValid: WritableSignal<boolean> = signal(false); // Para habilitar/deshabilitar botón global

  // Controles para la sección final
  pickupOptionControl = new FormControl(
    'RECOGER_DOMICILIO',
    Validators.required
  ); // Valor por defecto como en la imagen
  termsAcceptedControl = new FormControl(false, Validators.requiredTrue);

  pickupOptions: string[] = ['RECOGER_DOMICILIO', 'ENTREGAR_EN_ALMACEN']; // Ejemplo

  private orderService = inject(OrderService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef); // Para forzar detección de cambios si es necesario
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Podrías cargar opciones de pickup si vienen de una API
  }

  handleOrderAdded(newOrder: NewOrderData): void {
    this.pendingOrders.update((currentOrders) => [...currentOrders, newOrder]);
    this.snackBar.open('Pedido agregado al listado.', 'OK', {
      duration: 2000,
      verticalPosition: 'top',
    });
    // Resetear el formulario de creación de pedido individual
    if (this.orderCreationFormComponent) {
      this.orderCreationFormComponent.resetFormForNextOrder();
    }
    this.cdr.detectChanges(); // Forzar detección si la tabla no se actualiza inmediatamente
  }

  handleRemoveOrder(tempIdToRemove: string): void {
    this.pendingOrders.update((currentOrders) =>
      currentOrders.filter((order) => order.temp_id !== tempIdToRemove)
    );
    this.snackBar.open('Pedido quitado del listado.', 'OK', {
      duration: 2000,
      verticalPosition: 'top',
    });
  }

  // Método llamado por el evento del OrderCreationFormComponent
  onOrderFormValidityChanged(isValid: boolean): void {
    this.isOrderFormValid.set(isValid);
  }

  submitAllOrders(): void {
    if (this.pendingOrders().length === 0) {
      this.snackBar.open(
        'No hay pedidos en el listado para enviar.',
        'Cerrar',
        { duration: 3000, verticalPosition: 'top' }
      );
      return;
    }
    if (!this.pickupOptionControl.valid) {
      this.snackBar.open(
        'Por favor, seleccione cómo se hará el traslado.',
        'Cerrar',
        { duration: 3000, verticalPosition: 'top' }
      );
      this.pickupOptionControl.markAsTouched();
      return;
    }
    if (!this.termsAcceptedControl.value) {
      this.snackBar.open('Debe aceptar los términos y condiciones.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
      });
      this.termsAcceptedControl.markAsTouched(); // Para mostrar el error si lo tienes
      return;
    }

    this.isSubmittingBatch.set(true);

    const ordersToSubmit = this.pendingOrders().map((order) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { temp_id, delivery_district_name, ...orderDataForBackend } = order;
      return orderDataForBackend;
    });

    const payload: CreateBatchOrderPayload = {
      orders: ordersToSubmit,
      pickup_option: this.pickupOptionControl.value || 'RECOGER_DOMICILIO',
      terms_accepted: true, // Ya validado arriba
    };

    this.orderService
      .createBatchOrders(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmittingBatch.set(false))
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            response.message || 'Pedidos generados exitosamente!',
            'OK',
            {
              duration: 4000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.pendingOrders.set([]); // Limpiar la lista
          this.pickupOptionControl.reset('RECOGER_DOMICILIO');
          this.termsAcceptedControl.reset(false);
          this.router.navigate(['/features/orders']); // Navegar a la lista de pedidos general
        },
        error: (err) => {
          this.snackBar.open(
            err.message || 'Error al generar los pedidos. Intente nuevamente.',
            'Cerrar',
            {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
          console.error('Error submitting batch orders:', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
