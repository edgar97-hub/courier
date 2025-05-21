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
  DistrictOption,
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
  @Input() listaDeDistritos: DistrictOption[] | null = []; // Recibe la lista del padre
  // @Input() districts: Observable<DistrictOption[]>;
  // @Input() _districtsCache: DistrictOption[] = [];

  // private _districtsCache: DistrictOption[] = [];

  @Output() shippingCostCalculated = new EventEmitter<number>();
  @Output() calculationLoading = new EventEmitter<boolean>(); // Para notificar al padre

  maxDimensions$: Observable<MaxPackageDimensions>;
  standardPackageLabel: WritableSignal<string> = signal('Estándar'); // Para mostrar info del paquete estándar
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
        // Podríamos usar estas dimensiones para validadores dinámicos en los campos custom
      })
    );
    // this.districts = new Observable<DistrictOption[]>();
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
        // console.log('type', type);
        // console.log('this.districts', this._districtsCache);

        // if (type === 'standard') {
        //   if (!this.deliveryDistrictId) {
        //     this.shippingCostCalculated.emit(0);
        //   }
        //   // this.calculateStandardShippingCost(); // Calcular costo si se selecciona estándar
        // } else {
        //   this.shippingCostCalculated.emit(0);

        //   // Si se cambia a custom y ya había un costo, podría resetearse o esperar al botón "Calcular"
        //   // Por ahora, lo dejamos que el usuario presione "Calcular"
        // }
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
          // control.setValue(0, { emitEvent: false }); // Usar setValue para establecerlo en 0
          control.updateValueAndValidity({ emitEvent: false }); // Evitar re-trigger innecesario de valueChanges si no es necesario
          // control.reset(); // Limpiar valores si se cambia a estándar
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

    this.maxDimensions$;

    // console.log('listaDeDistritos', this.listaDeDistritos);
    // console.log('customData', customData);
    // console.log('this.volumetric_factor', this.volumetric_factor());

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
        let districtFound = this.listaDeDistritos?.find(
          (item) => item.id === customData.delivery_district_id
        );
        if (districtFound) {
          let filtrados = this.listaDeDistritos?.filter(
            (item) => item.name === districtFound?.name
          );
          interface Tarifa {
            id: number | string; // Identificador único de la tarifa
            weight_from: number; // Límite inferior del rango de peso (inclusivo)
            weight_to: number; // Límite superior del rango de peso (inclusivo)
            precio: number; // Precio para esta tarifa
          }
          function getTarifa(
            peso_cobrado: number,
            filtrados: any[] = []
          ): any | undefined {
            for (const tarifa of filtrados) {
              if (
                peso_cobrado >= tarifa.weight_from &&
                peso_cobrado <= tarifa.weight_to
              ) {
                console.log('tarifa', tarifa);
                return tarifa;
              }
            }
            return 0;
          }

          if (filtrados) {
            let tarifa = getTarifa(peso_cobrado, filtrados);
            precio = tarifa.price || 0;
          }
        }
      }
      // console.log('peso_volumetrico', peso_volumetrico);
      // console.log('customData.package_weight_kg', customData.package_weight_kg);
      console.log('peso_cobrado', peso_cobrado);
      console.log('precio', precio);
      this.shippingCostCalculated.emit(precio);
      this.isCalculating.set(false);
      this.calculationLoading.emit(false);
    } else {
      alert('las entradas no son validas');
    }

    return;
    // this.orderService
    //   .calculateShippingCost(customData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response: ShippingCostResponse) => {
    //       this.shippingCostCalculated.emit(response.shipping_cost);
    //       this.isCalculating.set(false);
    //       this.calculationLoading.emit(false);
    //     },
    //     error: (err) => {
    //       console.error('Error calculating custom shipping cost:', err);
    //       // Podrías emitir un valor de error o null para indicar fallo
    //       this.shippingCostCalculated.emit(0); // O un valor que indique error
    //       this.isCalculating.set(false);
    //       this.calculationLoading.emit(false);
    //     },
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
