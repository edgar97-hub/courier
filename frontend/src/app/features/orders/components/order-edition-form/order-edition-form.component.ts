import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  inject,
  signal,
  WritableSignal,
  computed,
  Input, // Import Input
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Subject, Observable, Subscription, of } from 'rxjs';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  map,
  startWith,
  debounceTime,
  switchMap,
  catchError,
  skip, // Import skip
} from 'rxjs/operators';

import { PackageCalculatorComponent } from '../package-calculator/package-calculator.component';
import { OrderService } from '../../services/order.service';
import {
  DistrictOption,
  NewOrderData,
  Order,
  Order_,
  UpdateOrderRequestDto,
} from '../../models/order.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { User } from '../../../users/models/user.model';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-order-edition-form',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PackageCalculatorComponent,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './order-edition-form.component.html',
  styleUrls: ['./order-edition-form.component.scss'],
})
export class OrderEditionFormComponent implements OnInit, OnDestroy {
  @Input() order: Order_ | null = null;
  @Output() orderSubmit = new EventEmitter<Order_>();
  @Output() formValidityChanged = new EventEmitter<boolean>();

  orderForm!: FormGroup;
  minDeliveryDate: Date;
  private originalShippingCost: number = -1; // To store the initial shipping cost
  private originalDistrict: string = '';

  // calculatedShippingCost: WritableSignal<number> = signal(0);
  isCalculatingShipping: WritableSignal<boolean> = signal(false);
  appStore = inject(AppStore);

  selectedDistrictName = () => {
    const districtId = this.orderForm?.get('delivery_district_id')?.value;
    if (!districtId || !this.districtsCache) return '';
    return this.districtsCache.find((d) => d.id === districtId)?.name || '';
  };

  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  districtsCache: DistrictOption[] = [];

  isLoadingCompanies = false;
  companySearchCtrl = new FormControl();
  filteredCompanies$: Observable<User[]>;

  isLoadingDistricts = false;
  districSearchCtrl = new FormControl();
  filteredDistricts$: Observable<DistrictOption[]>;

  constructor() {
    this.buildForm();
    this.minDeliveryDate = new Date();

    this.filteredCompanies$ = this.companySearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoadingCompanies = true;
        return this.orderService.getCompanies(searchTerm || '').pipe(
          tap(() => (this.isLoadingCompanies = false)),
          catchError(() => {
            this.isLoadingCompanies = false;
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    );

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
  }

  ngOnInit(): void {
    this.orderService.getDeliveryDistricts().subscribe((allDistricts) => {
      this.districtsCache = allDistricts;

      if (this.order) {
        this.populateForm(this.order, this.districtsCache);
      }
    });

    // Emitir validez del formulario cuando cambie
    this.orderForm.statusChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((status) => {
        this.formValidityChanged.emit(status === 'VALID');
      });

    this.orderForm
      .get('delivery_district_id')
      ?.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((newDistrictId) => {
        if (newDistrictId) {
          let isStandard =
            this.packageDetailsFormGroup.get('package_size_type')?.value ===
            'standard';
          if (isStandard) {
            let districtStandard = this.districtsCache.find(
              (item) => item.id === newDistrictId
            );
            if (districtStandard) {
              this.orderForm
                .get('shipping_cost')
                ?.setValue(parseFloat(districtStandard.price));
            }
          } else {
            this.orderForm.get('shipping_cost')?.setValue(0);
          }
          this.checkShippingCostDifference();
        }
      });

    this.packageDetailsFormGroup
      .get('package_size_type')
      ?.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((type) => {
        console.log('type', type);
        let deliveryDistrictId = this.orderForm.get(
          'delivery_district_id'
        )?.value;
        if (deliveryDistrictId && type === 'standard') {
          let districtStandard = this.districtsCache.find(
            (item) => item.id === deliveryDistrictId
          );
          if (districtStandard) {
            this.orderForm
              .get('shipping_cost')
              ?.setValue(parseFloat(districtStandard.price));
          }
        } else {
          this.orderForm.get('shipping_cost')?.setValue(0);
        }
        if (this.originalShippingCost !== -1) {
          this.checkShippingCostDifference();
        }
      });
  }

  isCompany(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'EMPRESA';
  }
  displayDriverName(driver: User | null): string {
    return driver && driver.username ? driver.username : '';
  }
  onDriverSelected(event: MatAutocompleteSelectedEvent): void {
    this.orderForm.get('company_id')?.setValue(event.option.value.id);
    this.orderForm.markAllAsTouched();
  }

  clearDriverSelection(): void {
    this.companySearchCtrl.setValue('');
    this.orderForm.markAllAsTouched();
    this.orderForm.get('company_id')?.setValue(null);
  }

  displayDistricName(driver: DistrictOption | null): string {
    return driver && driver.name_and_price ? driver.name_and_price : '';
  }
  onDistrictSelected(event: MatAutocompleteSelectedEvent): void {
    this.orderForm.get('delivery_district_id')?.setValue(event.option.value.id);
    this.orderForm.markAllAsTouched();
  }

  clearDistrictSelection(): void {
    this.districSearchCtrl.setValue('');
    this.orderForm.markAllAsTouched();
    this.orderForm.get('delivery_district_id')?.setValue(null);
  }

  get packageDetailsFormGroup(): FormGroup {
    return this.orderForm.get('package_details') as FormGroup;
  }

  private buildForm(): void {
    this.orderForm = this.fb.group({
      recipient_name: ['', Validators.required],
      recipient_phone: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9}$')],
      ],
      company_id: [null, Validators.required],
      delivery_district_id: [null, Validators.required],
      delivery_address: ['', [Validators.required, Validators.minLength(6)]],
      package_details: this.fb.group({
        package_size_type: ['standard'],
        package_width_cm: [{ value: 0 }],
        package_length_cm: [{ value: 0 }],
        package_height_cm: [{ value: 0 }],
        package_weight_kg: [{ value: 0 }],
      }),
      item_description: ['', Validators.required],
      observations: [''],
      shipping_cost: [this.originalShippingCost],
      observation_shipping_cost_modification: [{ value: '', disabled: true }], // Initially disabled
    });
  }

  // Método llamado por el evento del PackageCalculatorComponent
  onShippingCostCalculated(cost: number): void {
    this.orderForm.get('shipping_cost')?.setValue(cost);
    this.checkShippingCostDifference();
  }

  // Método llamado por el evento del PackageCalculatorComponent
  onPackageCalculationLoading(isLoading: boolean): void {
    this.isCalculatingShipping.set(isLoading);
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      console.log('Order form is invalid:', this.getFormErrors(this.orderForm));
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    if (!this.order) {
      console.error('No order to update.');
      return;
    }

    if (this.orderForm.get('shipping_cost')?.value === 0) {
      alert('El costo de envío no puede ser 0.');
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const updatedOrderData: UpdateOrderRequestDto = {
      recipient_name: formValue.recipient_name,
      recipient_phone: formValue.recipient_phone,
      delivery_district_name: this.selectedDistrictName(),
      delivery_address: formValue.delivery_address,
      package_size_type: formValue.package_details.package_size_type,
      package_width_cm: formValue.package_details.package_width_cm,
      package_length_cm: formValue.package_details.package_length_cm,
      package_height_cm: formValue.package_details.package_height_cm,
      package_weight_kg: formValue.package_details.package_weight_kg,
      shipping_cost: formValue.shipping_cost,
      item_description: formValue.item_description,
      observations: formValue.observations,
      company_id: formValue.company_id,
      observation_shipping_cost_modification:
        formValue.observation_shipping_cost_modification,
    };

    console.log('Submitting Updated Order Data:', updatedOrderData);

    this.orderService
      .updateOrder(this.order.id, updatedOrderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Order updated successfully', response);
          this.orderSubmit.emit(response);
        },
        error: (error) => {
          console.error('Error updating order', error);
          alert('Error al actualizar el pedido.');
        },
      });
  }

  resetFormForNextOrder(): void {
    this.companySearchCtrl.setValue('');
    this.districSearchCtrl.setValue('');

    let company_id = null;
    if (this.isCompany()) {
      company_id = this.orderForm.get('company_id')?.value;
    }

    this.orderForm.reset({
      company_id: company_id,
      delivery_date: null,
      package_details: { package_size_type: 'standard' },
    });
    // this.calculatedShippingCost.set(0); // Resetear costo de envío
    this.orderForm.get('shipping_cost')?.setValue(0); // Update form control

    // Forzar la re-evaluación del estado de los controles de paquete
    this.packageDetailsFormGroup
      .get('package_size_type')
      ?.setValue('standard', { emitEvent: true });
    this.formValidityChanged.emit(this.orderForm.valid); // Emitir nuevo estado de validez
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateForm(order: Order_, districts: DistrictOption[]): void {
    let district = districts.find(
      (item) => item.name === order.delivery_district_name
    );

    this.orderForm.patchValue(
      {
        recipient_name: order.recipient_name,
        recipient_phone: order.recipient_phone,
        company_id: order.company?.id,
        delivery_district_id: district?.id,
        delivery_address: order.delivery_address,
        delivery_coordinates: order.delivery_coordinates,
        item_description: order.item_description,
        observations: order.observations,
        shipping_cost: order.shipping_cost,
        observation_shipping_cost_modification: '',
      },
      { emitEvent: false }
    );

    if (district) {
      district.name_and_price =
        district.name + ' - S/ ' + parseFloat(district.price).toFixed(2);
      this.originalDistrict = district.name;
    }
    this.originalShippingCost = order.shipping_cost || -1; // Store original shipping cost
    this.packageDetailsFormGroup.patchValue(
      {
        package_size_type: order.package_size_type,
        package_width_cm: order.package_width_cm,
        package_length_cm: order.package_length_cm,
        package_height_cm: order.package_height_cm,
        package_weight_kg: order.package_weight_kg,
      },
      { emitEvent: false }
    );

    if (order.company && order.company) {
      this.companySearchCtrl.setValue(order.company);
    }
    if (district) {
      this.districSearchCtrl.setValue({
        ...district,
      });
    }

    this.orderForm.get('shipping_cost')?.setValue(order.shipping_cost); // Update form control
  }

  // Utilidad para depurar errores de formulario
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

  private checkShippingCostDifference(): void {
    const currentShippingCost = this.orderForm.get('shipping_cost')?.value;
    const observationControl = this.orderForm.get(
      'observation_shipping_cost_modification'
    );

    if (
      currentShippingCost !== this.originalShippingCost ||
      this.selectedDistrictName() !== this.originalDistrict
    ) {
      observationControl?.enable();
      observationControl?.setValidators(Validators.required);
    } else {
      observationControl?.disable();
      observationControl?.clearValidators();
      observationControl?.setValue('');
    }
    observationControl?.updateValueAndValidity();
  }
}
