import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio'; // O MatCheckboxModule si prefieres checkboxes
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para el spinner del botón calcular
import { Subject, Observable } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import {
  MaxPackageDimensions,
  ShippingCostResponse,
} from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-package-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './package-calculator.component.html',
  styleUrls: ['./package-calculator.component.scss'],
})
export class PackageCalculatorComponent implements OnInit, OnDestroy {
  // Este FormGroup será un subgrupo del formulario principal de la página de creación
  @Input() packageFormGroup!: FormGroup; // Recibe el FormGroup para 'package_details'
  @Input() deliveryDistrictId: string | number | null = null; // Necesario para el cálculo de costo

  @Output() shippingCostCalculated = new EventEmitter<number>();
  @Output() calculationLoading = new EventEmitter<boolean>(); // Para notificar al padre

  maxDimensions$: Observable<MaxPackageDimensions>;
  standardPackageLabel: WritableSignal<string> = signal('Estándar'); // Para mostrar info del paquete estándar

  isCalculating: WritableSignal<boolean> = signal(false);

  private orderService = inject(OrderService);
  private destroy$ = new Subject<void>();

  constructor() {
    this.maxDimensions$ = this.orderService.getMaxPackageDimensions().pipe(
      tap((dims) => {
        if (dims.standard_package_info) {
          this.standardPackageLabel.set(dims.standard_package_info);
        }
        // Podríamos usar estas dimensiones para validadores dinámicos en los campos custom
      })
    );
  }

  ngOnInit(): void {
    if (!this.packageFormGroup) {
      console.error(
        'PackageCalculatorComponent: packageFormGroup input is required.'
      );
      return;
    }

    // Escuchar cambios en el tipo de paquete para habilitar/deshabilitar campos
    this.packageFormGroup
      .get('package_size_type')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        startWith(this.packageFormGroup.get('package_size_type')?.value)
      )
      .subscribe((type) => {
        this.toggleCustomDimensionControls(type === 'custom');
        if (type === 'standard') {
          this.calculateStandardShippingCost(); // Calcular costo si se selecciona estándar
        } else {
          // Si se cambia a custom y ya había un costo, podría resetearse o esperar al botón "Calcular"
          // Por ahora, lo dejamos que el usuario presione "Calcular"
        }
      });
  }

  private toggleCustomDimensionControls(enable: boolean): void {
    const controls = [
      'package_width_cm',
      'package_length_cm',
      'package_height_cm',
      'package_weight_kg',
    ];
    controls.forEach((controlName) => {
      const control = this.packageFormGroup.get(controlName);
      if (control) {
        if (enable) {
          control.enable();
          control.setValidators([
            Validators.required,
            Validators.min(0.1),
            Validators.max(999),
          ]); // Añadir validadores
        } else {
          control.disable();
          control.clearValidators();
          control.reset(); // Limpiar valores si se cambia a estándar
        }
        control.updateValueAndValidity();
      }
    });
  }

  calculateStandardShippingCost(): void {
    if (!this.deliveryDistrictId) {
      console.warn(
        'Cannot calculate standard shipping cost: deliveryDistrictId is missing.'
      );
      this.shippingCostCalculated.emit(0); // O un valor por defecto, o manejar error
      return;
    }
    this.isCalculating.set(true);
    this.calculationLoading.emit(true);
    this.orderService
      .calculateShippingCost({
        delivery_district_id: this.deliveryDistrictId,
        package_size_type: 'standard',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ShippingCostResponse) => {
          this.shippingCostCalculated.emit(response.shipping_cost);
          this.isCalculating.set(false);
          this.calculationLoading.emit(false);
        },
        error: (err) => {
          console.error('Error calculating standard shipping cost:', err);
          this.shippingCostCalculated.emit(0); // Emitir 0 o un valor de error
          this.isCalculating.set(false);
          this.calculationLoading.emit(false);
        },
      });
  }

  onCalculateCustomCost(): void {
    if (this.packageFormGroup.get('package_size_type')?.value !== 'custom')
      return;
    if (!this.deliveryDistrictId) {
      alert('Por favor, seleccione un distrito de entrega primero.'); // O un MatSnackBar
      return;
    }

    // Validar solo los campos de dimensiones custom
    let customDimensionsValid = true;
    const customControls = [
      'package_width_cm',
      'package_length_cm',
      'package_height_cm',
      'package_weight_kg',
    ];
    customControls.forEach((name) => {
      const control = this.packageFormGroup.get(name);
      control?.markAsTouched(); // Marcar como tocado para mostrar errores
      if (control?.invalid) {
        customDimensionsValid = false;
      }
    });

    if (!customDimensionsValid) {
      console.log('Custom dimensions form is invalid');
      return;
    }

    this.isCalculating.set(true);
    this.calculationLoading.emit(true);

    const customData = {
      delivery_district_id: this.deliveryDistrictId,
      package_size_type: 'custom' as 'custom', // Asegurar el tipo literal
      package_width_cm: this.packageFormGroup.get('package_width_cm')?.value,
      package_length_cm: this.packageFormGroup.get('package_length_cm')?.value,
      package_height_cm: this.packageFormGroup.get('package_height_cm')?.value,
      package_weight_kg: this.packageFormGroup.get('package_weight_kg')?.value,
    };

    this.orderService
      .calculateShippingCost(customData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ShippingCostResponse) => {
          this.shippingCostCalculated.emit(response.shipping_cost);
          this.isCalculating.set(false);
          this.calculationLoading.emit(false);
        },
        error: (err) => {
          console.error('Error calculating custom shipping cost:', err);
          // Podrías emitir un valor de error o null para indicar fallo
          this.shippingCostCalculated.emit(0); // O un valor que indique error
          this.isCalculating.set(false);
          this.calculationLoading.emit(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
