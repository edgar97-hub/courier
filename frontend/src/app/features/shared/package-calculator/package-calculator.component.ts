import {
  Component,
  Input,
  signal,
  WritableSignal,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
// MatDialogModule y MatDialog no se usan en este componente, considera quitarlos si no son necesarios
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsService } from '../../settings/services/settings.service'; // Ajusta la ruta
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize, tap, startWith, map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <--- IMPORTAR DomSanitizer
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DistrictOption,
  MaxPackageDimensions,
} from '../../orders/models/order.model';
import { OrderService } from '../../orders/services/order.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio'; // O MatCheckboxModule si prefieres checkboxes
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-terms-conditions-display',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    // MatDialogModule, // Quitar si no se usa
  ],
  templateUrl: './package-calculator.component.html', // Usaremos un template externo por claridad
  styleUrls: ['./package-calculator.component.scss'], // Usaremos SCSS externo
})
export class PackageCalculatorComponent implements OnInit, OnDestroy {
  packageFormGroup!: FormGroup; // Recibe el FormGroup para 'package_details'
  deliveryDistrictId: string | number | null = null; // Necesario para el cálculo de costo
  listaDeDistritos: DistrictOption[] | null = []; // Recibe la lista del padre

  maxDimensions$: Observable<MaxPackageDimensions>;
  standardPackageLabel: WritableSignal<string> = signal('');
  volumetric_factor: WritableSignal<number> = signal(0);
  shippingCostCalculated: WritableSignal<number> = signal(0);
  isCalculating: WritableSignal<boolean> = signal(false);

  private orderService = inject(OrderService);
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  deliveryDistricts$: Observable<DistrictOption[]>;
  constructor() {
    this.deliveryDistricts$ = this.orderService.getDeliveryDistricts().pipe(
      map((allDistricts: DistrictOption[]) => {
        this.listaDeDistritos = allDistricts;
        return allDistricts.filter((district) => district.isStandard);
      })
    );
    this.packageFormGroup = this.fb.group({
      package_size_type: ['custom', Validators.required],
      package_width_cm: [0, Validators.required],
      package_length_cm: [0, Validators.required],
      package_height_cm: [0, Validators.required],
      package_weight_kg: [0, Validators.required],
      delivery_district_id: [null, Validators.required],
    });
    this.maxDimensions$ = this.orderService.getMaxPackageDimensions().pipe(
      tap((data: MaxPackageDimensions) => {
        if (data.standard_package_info && data.volumetric_factor) {
          let standard_package_info =
            'La medida estándar es ' +
            data.sta_length_cm +
            'cmx' +
            data.sta_width_cm +
            'cmx' +
            data.sta_height_cm +
            'cm ' +
            data.sta_weight_kg +
            'kg';

          this.standardPackageLabel.set(standard_package_info);
          this.volumetric_factor.set(data.volumetric_factor);
        }
      })
    );
  }

  ngOnInit(): void {}

  onCalculateCustomCost(): void {
    console.log(
      'this.packageFormGroup.get',
      this.packageFormGroup.get('delivery_district_id')?.value
    );
    if (!this.packageFormGroup.get('delivery_district_id')?.value) {
      alert('Por favor, seleccione un distrito de entrega primero.');
      return;
    }

    const customControls = [
      'package_width_cm',
      'package_length_cm',
      'package_height_cm',
      'package_weight_kg',
    ];
    customControls.forEach((name) => {
      const control = this.packageFormGroup.get(name);
      control?.markAsTouched();
      if (control?.invalid) {
        console.log('Custom dimensions form is invalid');
        return;
      }
    });

    const customData = {
      delivery_district_id: this.packageFormGroup.get('delivery_district_id')
        ?.value,
      package_size_type: 'custom',
      package_width_cm: this.packageFormGroup.get('package_width_cm')?.value,
      package_length_cm: this.packageFormGroup.get('package_length_cm')?.value,
      package_height_cm: this.packageFormGroup.get('package_height_cm')?.value,
      package_weight_kg: this.packageFormGroup.get('package_weight_kg')?.value,
    };

    function getTarifa(
      peso_cobrado: number,
      filtrados: any[]
    ): any | undefined {
      for (const tarifa of filtrados) {
        if (
          peso_cobrado >= tarifa.weight_from &&
          peso_cobrado <= tarifa.weight_to
        ) {
          return tarifa;
        }
      }
      return;
    }

    if (
      customData.package_width_cm &&
      customData.package_length_cm &&
      customData.package_height_cm &&
      customData.package_weight_kg &&
      this.volumetric_factor()
    ) {
      this.isCalculating.set(true);
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

      let tarifa = this.listaDeDistritos?.find(
        (item) => item.id === customData.delivery_district_id
      );
      if (tarifa) {
        let tarifasDistrito = this.listaDeDistritos?.filter(
          (item) => item.name === tarifa?.name
        );

        if (tarifasDistrito) {
          let tarifa = getTarifa(peso_cobrado, tarifasDistrito);
          precio = tarifa?.price || 0;
        }
      }
      console.log('peso_cobrado', peso_cobrado);
      console.log('precio', precio);
      this.shippingCostCalculated.set(precio);
      this.isCalculating.set(false);
    } else {
      alert('las entradas no son validas');
    }

    return;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
