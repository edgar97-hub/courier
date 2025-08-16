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
import { Observable, of, Subject } from 'rxjs';
import {
  takeUntil,
  finalize,
  tap,
  startWith,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DistrictOption,
  MaxPackageDimensions,
} from '../../orders/models/order.model';
import { OrderService } from '../../orders/services/order.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

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
    MatAutocompleteModule,
  ],
  templateUrl: './package-calculator.component.html',
  styleUrls: ['./package-calculator.component.scss'],
})
export class PackageCalculatorComponent implements OnInit, OnDestroy {
  packageFormGroup!: FormGroup;
  deliveryDistrictId: string | number | null = null;
  // listaDeDistritos: DistrictOption[] | null = [];

  maxDimensions$: Observable<MaxPackageDimensions>;
  standardPackageLabel: WritableSignal<string> = signal('');
  volumetric_factor: WritableSignal<number> = signal(0);
  shippingCostCalculated: WritableSignal<number> = signal(0);
  isCalculating: WritableSignal<boolean> = signal(false);

  private orderService = inject(OrderService);
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  // deliveryDistricts$: Observable<DistrictOption[]>;

  districtsCache: DistrictOption[] = [];
  ditricts$: Observable<DistrictOption[]> = of([]);
  isLoadingDistricts = false;
  selectedDistrict: DistrictOption | null = null;
  districSearchCtrl = new FormControl('');
  filteredDistricts$: Observable<DistrictOption[]>;

  constructor() {
    // this.deliveryDistricts$ = this.orderService.getDeliveryDistricts().pipe(
    //   map((allDistricts: DistrictOption[]) => {
    //     this.listaDeDistritos = allDistricts;
    //     return allDistricts.filter((district) => district.isStandard);
    //   })
    // );

    this.orderService
      .getDeliveryDistricts()
      .pipe(
        map((allDistricts: DistrictOption[]) => {
          this.districtsCache = allDistricts;
        })
      )
      .subscribe();

    this.filteredDistricts$ = this.districSearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoadingDistricts = true;
        return this.orderService.getDistricts(searchTerm || '').pipe(
          tap(() => (this.isLoadingDistricts = false)),
          catchError(() => {
            this.isLoadingDistricts = false;
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
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
            'cm' +
            data.sta_width_cm +
            'cm' +
            data.sta_height_cm +
            'cm ' +
            data.sta_weight_kg +
            'kg';

          // let info_text =
          //   'Las entregas en motorizado permiten paquetes de hasta ' +
          //   data.sta_length_cm +
          //   ' cm x ' +
          //   data.sta_width_cm +
          //   ' cm x  ' +
          //   data.sta_height_cm +
          //   ' cm y ' +
          //   data.sta_weight_kg +
          //   ' kg. Si se exceden estas medidas o peso, se cobrará una tarifa distinta porque la entrega será en una van.';

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

      let tarifa = this.districtsCache?.find(
        (item) => item.id === customData.delivery_district_id
      );
      if (tarifa) {
        let tarifasDistrito = this.districtsCache?.filter(
          (item) => item.name === tarifa?.name
        );

        if (tarifasDistrito) {
          let tarifa = getTarifa(peso_cobrado, tarifasDistrito);
          precio = tarifa?.price || 0;
        }
      }

      if (precio === 0) {
        alert(
          'No hay ninguna tarifa asociada con el peso (' +
            peso_cobrado +
            ') del distrito seleccionado.'
        );
        // no hay un peso volumétrico asociado a una tarifa del distrito seleccionado
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

  displayDistricName(driver: DistrictOption | null): string {
    return driver && driver.name_and_price ? driver.name_and_price : '';
  }
  onDistrictSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedDistrict = event.option.value as DistrictOption;
    console.log('district selected:', this.selectedDistrict);

    this.packageFormGroup
      .get('delivery_district_id')
      ?.setValue(this.selectedDistrict.id);
    this.packageFormGroup.markAllAsTouched();
    console.log(
      'Order form is invalid:',
      this.getFormErrors(this.packageFormGroup)
    );
    const formValue = this.packageFormGroup.getRawValue();
    console.log('formValue', formValue);
  }

  clearDistrictSelection(): void {
    this.selectedDistrict = null;
    this.districSearchCtrl.setValue('');
    this.packageFormGroup.markAllAsTouched();
    this.packageFormGroup.get('delivery_district_id')?.setValue(null);
    console.log(
      'Order form is invalid:',
      this.getFormErrors(this.packageFormGroup)
    );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getFormErrors(formGroup: FormGroup): any {
    const errors: any = {};
    Object.keys(formGroup.controls).forEach((key) => {
      const controlErrors = formGroup.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
      // Si es un FormGroup anidado, recurrir
      if (formGroup.get(key) instanceof FormGroup) {
        const nestedErrors = this.getFormErrors(
          formGroup.get(key) as FormGroup
        );
        if (Object.keys(nestedErrors).length > 0) {
          errors[key] = nestedErrors;
        }
      }
    });
    return errors;
  }
}
