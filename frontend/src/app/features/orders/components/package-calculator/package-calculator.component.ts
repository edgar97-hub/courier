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
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';
import { DistrictOption, MaxPackageDimensions } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { AutoSelectDirective } from '../../../../shared/directives/auto-select.directive';

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
    AutoSelectDirective,
  ],
  templateUrl: './package-calculator.component.html',
  styleUrls: ['./package-calculator.component.scss'],
})
export class PackageCalculatorComponent implements OnInit, OnDestroy {
  @Input() packageFormGroup!: FormGroup;
  @Input() deliveryDistrictId: string | number | null = null;
  @Input() districtsCache: DistrictOption[] | null = [];

  @Output() shippingCostCalculated = new EventEmitter<number>();
  @Output() calculationLoading = new EventEmitter<boolean>();

  maxDimensions$: Observable<MaxPackageDimensions>;
  standardPackageLabel: WritableSignal<string> = signal('Estándar');
  volumetric_factor: WritableSignal<number> = signal(0);

  isCalculating: WritableSignal<boolean> = signal(false);

  private orderService = inject(OrderService);
  private destroy$ = new Subject<void>();

  constructor() {
    this.maxDimensions$ = this.orderService.getMaxPackageDimensions().pipe(
      tap((dims) => {
        if (dims.standard_package_info && dims.volumetric_factor) {
          this.standardPackageLabel.set(dims.standard_package_info);
          this.volumetric_factor.set(dims.volumetric_factor);
        }
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
  }

  onCalculateCustomCost(): void {
    if (this.packageFormGroup.get('package_size_type')?.value !== 'custom')
      return;
    if (!this.deliveryDistrictId) {
      alert('Por favor, seleccione un distrito de entrega primero.');
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
      package_size_type: 'custom' as 'custom',
      package_width_cm: this.packageFormGroup.get('package_width_cm')?.value,
      package_length_cm: this.packageFormGroup.get('package_length_cm')?.value,
      package_height_cm: this.packageFormGroup.get('package_height_cm')?.value,
      package_weight_kg: this.packageFormGroup.get('package_weight_kg')?.value,
    };

    if (
      customData.package_width_cm &&
      customData.package_length_cm &&
      customData.package_height_cm &&
      customData.package_weight_kg &&
      this.volumetric_factor()
    ) {
      let peso_volumetrico =
        (customData.package_length_cm *
          customData.package_width_cm *
          customData.package_height_cm) /
        this.volumetric_factor();

      let precio = 0;
      let peso_cobrado = customData.package_weight_kg;
      if (peso_volumetrico > customData.package_weight_kg) {
        peso_cobrado = peso_volumetrico;
      }

      if (customData.delivery_district_id) {
        let districtFound = this.districtsCache?.find(
          (item) => item.id === customData.delivery_district_id
        );
        if (districtFound) {
          let filtrados = this.districtsCache?.filter(
            (item) => item.name == districtFound?.name
          );
          function getTarifa(
            peso_cobrado: number,
            filtrados: any[] = []
          ): any | undefined {
            for (const tarifa of filtrados) {
              if (
                peso_cobrado >= tarifa.weight_from &&
                peso_cobrado <= tarifa.weight_to
              ) {
                return tarifa;
              }
            }
            return 0;
          }

          if (filtrados) {
            let tarifa = getTarifa(peso_cobrado, filtrados);
            precio = tarifa?.price || 0;
          }
        }
      }
      console.log('peso_cobrado', peso_cobrado);
      console.log('precio', precio);

      if (precio === 0) {
        alert(
          'No hay ninguna tarifa asociada con el peso (' +
            peso_cobrado +
            ') del distrito seleccionado.'
        );
      }
      this.shippingCostCalculated.emit(precio);
    } else {
      alert('las entradas no son validas');
    }
    this.isCalculating.set(false);
    this.calculationLoading.emit(false);
    return;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
