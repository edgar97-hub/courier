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
} from 'rxjs/operators';

import { PackageCalculatorComponent } from '../package-calculator/package-calculator.component';
import { OrderService } from '../../services/order.service';
import { DistrictOption, NewOrderData } from '../../models/order.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { User } from '../../../users/models/user.model';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-order-creation-form',
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
  templateUrl: './order-creation-form.component.html',
  styleUrls: ['./order-creation-form.component.scss'],
})
export class OrderCreationFormComponent implements OnInit, OnDestroy {
  @Output() orderSubmit = new EventEmitter<NewOrderData>();
  @Output() formValidityChanged = new EventEmitter<boolean>();

  orderForm!: FormGroup;
  minDeliveryDate: Date;

  shipmentTypes: string[] = [
    'CONTRAENTREGA',
    'SOLO ENTREGAR',
    'CAMBIO',
    'RECOJO',
  ];
  paymentMethodsForCollection: string[] = [
    'NO COBRAR',
    'EFECTIVO',
    'YAPE',
    'PLIN',
    'TRANSFERENCIA',
  ];

  calculatedShippingCost: WritableSignal<number> = signal(0);
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

  drivers$: Observable<User[]> = of([]);
  isLoadingDrivers = false;
  driverSearchCtrl = new FormControl('');
  filteredDrivers$: Observable<User[]>;

  ditricts$: Observable<User[]> = of([]);
  isLoadingDistricts = false;
  districSearchCtrl = new FormControl('');
  filteredDistricts$: Observable<DistrictOption[]>;

  constructor() {
    this.minDeliveryDate = new Date();
    this.orderService.getDeliveryDistricts().subscribe((allDistricts) => {
      this.districtsCache = allDistricts;
    });

    this.buildForm();

    this.filteredDrivers$ = this.driverSearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoadingDrivers = true;
        console.log('searchTerm', searchTerm);
        return this.orderService.getCompanies(searchTerm || '').pipe(
          tap(() => (this.isLoadingDrivers = false)),
          catchError(() => {
            this.isLoadingDrivers = false;
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
        console.log('searchTerm', searchTerm);
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
    this.driverSearchCtrl.setValue('');
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

  ngOnInit(): void {
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
        console.log('District changed to:', newDistrictId);
        if (newDistrictId) {
          let isStandard =
            this.packageDetailsFormGroup.get('package_size_type')?.value ===
            'standard';
          if (isStandard) {
            let districtStandard = this.districtsCache.find(
              (item) => item.id === newDistrictId
            );
            if (districtStandard) {
              this.calculatedShippingCost.set(
                parseFloat(districtStandard.price)
              );
            }
          } else {
            this.calculatedShippingCost.set(0);
          }
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
            this.calculatedShippingCost.set(parseFloat(districtStandard.price));
          }
        } else {
          this.calculatedShippingCost.set(0);
        }
      });
  }

  get packageDetailsFormGroup(): FormGroup {
    return this.orderForm.get('package_details') as FormGroup;
  }

  private buildForm(): void {
    let company_id = null;
    if (this.isCompany()) {
      company_id = this.appStore.currentUser()?.id;
    }

    this.orderForm = this.fb.group({
      shipment_type: [this.shipmentTypes[0], Validators.required],
      recipient_name: ['', Validators.required],
      recipient_phone: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9}$')],
      ],
      company_id: [company_id, Validators.required],
      delivery_district_id: [null, Validators.required],
      delivery_address: ['', [Validators.required, Validators.minLength(6)]],
      delivery_coordinates: [''],
      delivery_date: [null, Validators.required], // String en formato YYYY-MM-DD
      package_details: this.fb.group({
        package_size_type: ['standard', Validators.required],
        package_width_cm: [{ value: 0, disabled: true }],
        package_length_cm: [{ value: 0, disabled: true }],
        package_height_cm: [{ value: 0, disabled: true }],
        package_weight_kg: [{ value: 0, disabled: true }],
      }),
      item_description: ['', Validators.required],
      amount_to_collect_at_delivery: [
        0,
        [Validators.required, Validators.min(0)],
      ],
      payment_method_for_collection: [
        this.paymentMethodsForCollection[0],
        Validators.required,
      ],
      observations: [''],
    });
  }

  // Método llamado por el evento del PackageCalculatorComponent
  onShippingCostCalculated(cost: number): void {
    this.calculatedShippingCost.set(cost);
    console.log('Shipping cost updated in OrderCreationForm:', cost);
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

    if (this.calculatedShippingCost() === 0) {
      alert('El costo de envío no puede ser 0.');
      return;
    }
    const formValue = this.orderForm.getRawValue(); // getRawValue para incluir campos deshabilitados (como los de paquete estándar)
    const newOrderData: NewOrderData = {
      ...formValue, // Todos los campos del formulario principal
      ...formValue.package_details, // Desestructurar los detalles del paquete
      shipping_cost: this.calculatedShippingCost(),
      delivery_district_name: this.selectedDistrictName(), // Añadir nombre del distrito
      temp_id: `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}`, // ID temporal único
    };

    console.log('Submitting New Order Data:', newOrderData);
    this.orderSubmit.emit(newOrderData);
  }

  resetFormForNextOrder(): void {
    this.driverSearchCtrl.setValue('');
    this.districSearchCtrl.setValue('');

    let company_id = null;
    if (this.isCompany()) {
      company_id = this.orderForm.get('company_id')?.value;
    }

    const defaultShipmentType =
      this.orderForm.get('shipment_type')?.value || this.shipmentTypes[0];
    const defaultPaymentMethod = this.paymentMethodsForCollection[0];

    this.orderForm.reset({
      company_id: company_id,
      shipment_type: defaultShipmentType,
      delivery_date: null,
      package_details: { package_size_type: 'standard' },
      amount_to_collect_at_delivery: 0,
      payment_method_for_collection: defaultPaymentMethod,
    });
    this.calculatedShippingCost.set(0); // Resetear costo de envío
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
}
