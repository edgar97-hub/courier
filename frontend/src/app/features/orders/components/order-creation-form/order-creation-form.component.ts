import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  inject,
  WritableSignal,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Subject, Observable, of, merge } from 'rxjs';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  map,
  startWith,
  debounceTime,
  switchMap,
  catchError,
  take,
} from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import {
  DistrictOption,
  NewOrderData,
  PackageType,
  OrderItem,
} from '../../models/order.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { User } from '../../../users/models/user.model';
import { AppStore } from '../../../../app.store';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from '../../../../common/roles.enum';
import { SettingsService } from '../../../settings/services/settings.service';
import { AutoSelectDirective } from '../../../../shared/directives/auto-select.directive';

// Interfaces for internal use
interface CustomPackageData {
  delivery_district_id: string | number;
  package_length_cm: number;
  package_width_cm: number;
  package_height_cm: number;
  package_weight_kg: number;
}

interface Tariff extends DistrictOption {
  weight_from: number;
  weight_to: number;
}

interface FormErrors {
  [key: string]: ValidationErrors | FormErrors;
}

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
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatSnackBarModule,
    AutoSelectDirective,
  ],
  templateUrl: './order-creation-form.component.html',
  styleUrls: ['./order-creation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCreationFormComponent implements OnInit, OnDestroy {
  itemsDataSource = new MatTableDataSource<AbstractControl>();

  @Output() orderSubmit = new EventEmitter<NewOrderData>();
  @Output() formValidityChanged = new EventEmitter<boolean>();

  orderForm!: FormGroup;
  minDeliveryDate: Date;

  newItemForm!: FormGroup;
  itemsDisplayedColumns: string[] = [
    'description',
    'medidas',
    'basePrice',
    'tipo',
    'finalPrice',
    'eliminar',
  ];
  private settingsService = inject(SettingsService);
  multiPackageDiscountPercentage: WritableSignal<number> = signal(0);
  standardPackageLabel: WritableSignal<string> = signal('');
  maxDimensionsInfo: WritableSignal<string> = signal('');
  volumetricFactor: WritableSignal<number> = signal(0);
  shippingCostPackage: WritableSignal<number> = signal(0);

  staLengthCm: WritableSignal<number> = signal(0);
  staWidthCm: WritableSignal<number> = signal(0);
  staHeightCm: WritableSignal<number> = signal(0);
  staWeightKg: WritableSignal<number> = signal(0);

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

  appStore = inject(AppStore);

  selectedDistrictName = () => {
    const districtId = this.orderForm?.get('delivery_district_id')?.value;
    if (!districtId || !this.districtsCache) return '';
    return this.districtsCache.find((d) => d.id === districtId)?.name || '';
  };

  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();
  districtsCache: DistrictOption[] = [];

  drivers$: Observable<User[]> = of([]);
  isLoadingDrivers = false;
  driverSearchCtrl = new FormControl('');
  filteredDrivers$: Observable<User[]>;

  districts$: Observable<User[]> = of([]);
  isLoadingDistricts = false;
  districtSearchCtrl = new FormControl('');
  filteredDistricts$: Observable<DistrictOption[]>;

  constructor() {
    this.orderService.getMaxPackageDimensions().subscribe((dims) => {
      if (
        dims &&
        dims.standard_package_info &&
        dims.volumetric_factor &&
        dims.info_text &&
        dims.sta_length_cm &&
        dims.sta_width_cm &&
        dims.sta_height_cm &&
        dims.sta_weight_kg
      ) {
        this.standardPackageLabel.set(dims.standard_package_info);
        this.volumetricFactor.set(dims.volumetric_factor);
        this.maxDimensionsInfo.set(dims.info_text);

        this.staLengthCm.set(dims.sta_length_cm);
        this.staWidthCm.set(dims.sta_width_cm);
        this.staHeightCm.set(dims.sta_height_cm);
        this.staWeightKg.set(dims.sta_weight_kg);
      }
    });
    this.minDeliveryDate = new Date();
    this.buildForm();

    this.orderService.getDeliveryDistricts().subscribe((allDistricts) => {
      this.districtsCache = allDistricts;
    });

    this.filteredDrivers$ = this.driverSearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(900),
      distinctUntilChanged(),
      switchMap((searchTerm) => {
        this.isLoadingDrivers = true;
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

    this.filteredDistricts$ = this.districtSearchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(900),
      switchMap((searchTerm) => {
        this.isLoadingDistricts = true;
        return this.orderService
          .getDistricts(
            searchTerm || '',
            this.orderForm.get('isExpress')?.value
          )
          .pipe(
            tap(() => (this.isLoadingDistricts = false)),
            catchError(() => {
              this.isLoadingDistricts = false;
              return of([]);
            })
          );
      }),
      takeUntil(this.destroy$)
    );

    effect(() => {
      this.multiPackageDiscountPercentage();
      if (this.newItemForm.get('package_type')?.value === PackageType.CUSTOM) {
        this.recalculateTotalCost(this.itemsFormArray.value);
      }
    });
  }

  private calculateBasePrice(customData: CustomPackageData): number {
    if (!customData.delivery_district_id) {
      this.snackBar.open(
        'Por favor, seleccione un distrito de entrega primero.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return 0;
    }

    if (this.newItemForm.get('package_type')?.value === PackageType.CUSTOM) {
      let customDimensionsValid = true;
      const customControls = [
        'length_cm',
        'width_cm',
        'height_cm',
        'weight_kg',
      ];

      customControls.forEach((name) => {
        const control = this.newItemForm.get(name);
        control?.markAsTouched();
        if (control?.invalid) {
          customDimensionsValid = false;
        }
      });

      if (!customDimensionsValid) {
        console.log('Custom dimensions form is invalid');
        return 0;
      }
    }

    if (
      !customData.package_width_cm ||
      !customData.package_length_cm ||
      !customData.package_height_cm ||
      !customData.package_weight_kg ||
      !this.volumetricFactor()
    ) {
      this.snackBar.open('Las entradas no son válidas', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return 0;
    }

    const pesoVolumetrico =
      (customData.package_length_cm *
        customData.package_width_cm *
        customData.package_height_cm) /
      this.volumetricFactor();

    const pesoCobrado =
      pesoVolumetrico > customData.package_weight_kg
        ? pesoVolumetrico
        : customData.package_weight_kg;

    const districtFound = this.districtsCache.find(
      (item) => item.id === customData.delivery_district_id
    );
    if (!districtFound) {
      this.shippingCostPackage.set(0);
      return 0;
    }

    const filtrados = this.districtsCache.filter(
      (item) => item.name === districtFound.name
    );
    const tarifa = this.findTariffForWeight(pesoCobrado, filtrados);
    const precio = tarifa?.price ? parseFloat(tarifa.price) : 0;

    if (precio === 0) {
      this.snackBar.open(
        `No hay ninguna tarifa asociada con el peso (${pesoCobrado}) del distrito seleccionado.`,
        'Cerrar',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }
    this.shippingCostPackage.set(precio);
    return precio;
  }

  private findTariffForWeight(
    weight: number,
    tariffs: DistrictOption[]
  ): DistrictOption | undefined {
    const tariffList = tariffs as any[];
    for (const tariff of tariffList) {
      if (
        tariff.weight_from !== undefined &&
        tariff.weight_to !== undefined &&
        weight >= tariff.weight_from &&
        weight <= tariff.weight_to
      ) {
        return tariff as DistrictOption;
      }
    }
    return undefined;
  }

  private getDistrictPrice(districtId: string | number): number {
    const district = this.districtsCache.find((d) => d.id === districtId);
    return district ? parseFloat(district.price) : 0;
  }

  getCheckboxValue(): void {
    this.districtSearchCtrl.setValue('', { emitEvent: true });
    this.orderForm.markAllAsTouched();
    this.orderForm
      .get('delivery_district_id')
      ?.setValue(null, { emitEvent: true });

    this.orderService
      .getDeliveryDistricts(this.orderForm.get('isExpress')?.value)
      .subscribe((allDistricts) => {
        this.districtsCache = allDistricts;
      });
  }

  isCompany(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return (
      userRole === UserRole.EMPRESA_DISTRIBUIDOR ||
      userRole === UserRole.COMPANY
    );
  }

  hasPermissionToEditPercentage(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === UserRole.RECEPTIONIST || userRole === UserRole.ADMIN;
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

  displayDistrictName(driver: DistrictOption | null): string {
    return driver && driver.name_and_price ? driver.name_and_price : '';
  }
  onDistrictSelected(event: MatAutocompleteSelectedEvent): void {
    this.orderForm.get('delivery_district_id')?.setValue(event.option.value.id);
    this.orderForm.markAllAsTouched();
  }

  clearDistrictSelection(): void {
    this.districtSearchCtrl.setValue('');
    this.orderForm.markAllAsTouched();
    this.orderForm.get('delivery_district_id')?.setValue(null);
  }

  get itemsFormArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  loadSettings() {
    this.settingsService
      .loadSettings()
      .pipe(take(1))
      .subscribe((settings: unknown) => {
        const currentSettings = Array.isArray(settings)
          ? settings[0]
          : settings;
        const discount =
          this.orderService.getEffectiveDiscount(currentSettings);
        this.multiPackageDiscountPercentage.set(discount);
      });
  }

  ngOnInit(): void {
    this.itemsDataSource.data = this.itemsFormArray.controls;
    this.loadSettings();
    this.orderForm.statusChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((status) => {
        console.log(
          'Order form is invalid:',
          this.getFormErrors(this.orderForm)
        );

        this.formValidityChanged.emit(status === 'VALID');
      });

    this.orderForm
      .get('delivery_district_id')
      ?.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((newDistrictId) => {
        this.itemsFormArray.clear();
        this.itemsDataSource.data = this.itemsFormArray.controls;
        this.orderForm.get('shipping_cost')?.setValue(0);

        if (newDistrictId) {
          if (
            this.newItemForm.get('package_type')?.value === PackageType.STANDARD
          ) {
            const price = this.getDistrictPrice(newDistrictId);
            this.orderForm.get('shipping_cost')?.setValue(price);
          }
        }
      });
  }

  private buildForm(): void {
    const company_id = this.isCompany()
      ? this.appStore.currentUser()?.id ?? null
      : null;
    this.createNewItemForm();
    this.setupPackageTypeSubscription();
    this.createOrderForm(company_id);
    this.setupRealtimePriceCalculation();
  }

  private createNewItemForm(): void {
    this.newItemForm = this.fb.group({
      package_type: [PackageType.STANDARD, Validators.required],
      description: [''],
      length_cm: [0, [Validators.required, Validators.min(1)]],
      width_cm: [0, [Validators.required, Validators.min(1)]],
      height_cm: [0, [Validators.required, Validators.min(1)]],
      weight_kg: [0, [Validators.required, Validators.min(0.1)]],
    });
  }

  private setupPackageTypeSubscription(): void {
    this.newItemForm
      .get('package_type')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        const deliveryDistrictId = this.orderForm.get(
          'delivery_district_id'
        )?.value;
        if (!deliveryDistrictId) {
          this.itemsFormArray.clear();
          this.itemsDataSource.data = this.itemsFormArray.controls;
          this.orderForm.get('shipping_cost')?.setValue(0);
        }
        if (type === PackageType.STANDARD) {
          this.itemsFormArray.clear();
          this.itemsDataSource.data = this.itemsFormArray.controls;
          const price = this.getDistrictPrice(deliveryDistrictId);
          this.orderForm.get('shipping_cost')?.setValue(price);
        } else {
          this.recalculateTotalCost(this.itemsFormArray.value);
          const fields = ['length_cm', 'width_cm', 'height_cm', 'weight_kg'];
          if (type === PackageType.CUSTOM) {
            fields.forEach((field) =>
              this.newItemForm
                .get(field)
                ?.setValidators([Validators.required, Validators.min(0.1)])
            );
          } else {
            fields.forEach((field) =>
              this.newItemForm.get(field)?.clearValidators()
            );
          }
          this.newItemForm.updateValueAndValidity();
        }
      });
  }

  private createOrderForm(company_id: string | null): void {
    this.orderForm = this.fb.group({
      isExpress: [false],
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
      items: this.fb.array([]),

      shipping_cost: [0],
      item_description: [''],
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

  private setupRealtimePriceCalculation(): void {
    merge(
      this.newItemForm.valueChanges,
      this.orderForm.get('delivery_district_id')!.valueChanges
    )
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        const newItemValues = this.newItemForm.getRawValue();
        if (newItemValues.package_type === PackageType.CUSTOM) {
          if (this.newItemForm.invalid) {
            this.shippingCostPackage.set(0);
            return;
          }
          const newItemData = this.newItemForm.getRawValue();
          const customData = {
            delivery_district_id: this.orderForm.get('delivery_district_id')
              ?.value,
            package_length_cm: newItemData.length_cm,
            package_width_cm: newItemData.width_cm,
            package_height_cm: newItemData.height_cm,
            package_weight_kg: newItemData.weight_kg,
          };
          const price = this.calculateBasePrice(customData);
          this.shippingCostPackage.set(price);
        }
      });
  }

  addItemToList(): void {
    if (this.newItemForm.invalid) {
      this.newItemForm.markAllAsTouched();
      return;
    }
    const districtId = this.orderForm.get('delivery_district_id')?.value;
    if (!districtId) {
      this.snackBar.open(
        'Por favor, seleccione un distrito de entrega primero.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }

    const newItemData = this.newItemForm.getRawValue();
    if (!newItemData.description) {
      alert('Complete el campo de descripción del paquete');
      return;
    }
    const customData = {
      delivery_district_id: this.orderForm.get('delivery_district_id')?.value,
      package_length_cm: newItemData.length_cm,
      package_width_cm: newItemData.width_cm,
      package_height_cm: newItemData.height_cm,
      package_weight_kg: newItemData.weight_kg,
    };
    // Simulación del cálculo de precio base (debes ajustarlo a tu lógica real)
    const basePrice = this.calculateBasePrice(customData);
    if (basePrice === 0) {
      this.snackBar.open(
        'No se pudo calcular una tarifa para el paquete. Verifique el distrito y las medidas.',
        'Cerrar',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    const items = this.orderForm.get('items') as FormArray;

    items.push(
      this.fb.group({
        package_type: [newItemData.package_type],
        description: [newItemData.description],
        length_cm: [newItemData.length_cm],
        width_cm: [newItemData.width_cm],
        height_cm: [newItemData.height_cm],
        weight_kg: [newItemData.weight_kg],
        basePrice: [basePrice],
        finalPrice: [0],
        isPrincipal: [false],
      })
    );
    this.recalculateTotalCost(this.itemsFormArray.value);

    this.itemsDataSource.data = this.itemsFormArray.controls;
    this.newItemForm.reset({
      package_type: this.newItemForm.get('package_type')?.value,
      description: '',
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      weight_kg: 0,
    });
  }

  private recalculateTotalCost(items: OrderItem[]): void {
    if (items.length === 0) {
      this.orderForm.get('shipping_cost')?.setValue(0);
      return;
    }

    // Encontrar el principal
    const principalItem = items.reduce(
      (max, item) => (item.basePrice > max.basePrice ? item : max),
      items[0]
    );

    let totalCost = 0;
    const updatedItems = items.map((item) => {
      const isPrincipal = item === principalItem;
      let finalPrice = item.basePrice;

      if (!isPrincipal) {
        finalPrice =
          item.basePrice * (1 - this.multiPackageDiscountPercentage() / 100);
      }

      totalCost += finalPrice;

      return { ...item, finalPrice, isPrincipal };
    });

    this.itemsFormArray.patchValue(updatedItems, { emitEvent: false });
    this.orderForm.get('shipping_cost')?.setValue(totalCost);
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.itemsDataSource.data = this.itemsFormArray.controls;
    this.recalculateTotalCost(this.itemsFormArray.value);
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      console.log('Order form is invalid:', this.getFormErrors(this.orderForm));
      this.snackBar.open(
        'Por favor complete todos los campos requeridos.',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const packageType = this.newItemForm.get('package_type')?.value;
    if (packageType === PackageType.STANDARD && formValue.items.length === 0) {
      const districtId = this.orderForm.get('delivery_district_id')?.value;
      if (!districtId) {
        this.snackBar.open('Por favor, seleccione un distrito.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      if (
        this.newItemForm.get('package_type')?.value === PackageType.STANDARD
      ) {
        const price = this.getDistrictPrice(districtId);
        this.orderForm.get('shipping_cost')?.setValue(price);
      }
      const standardItem: OrderItem = {
        package_type: PackageType.STANDARD,
        description: 'Paquete Estándar',
        length_cm: this.staLengthCm(),
        width_cm: this.staWidthCm(),
        height_cm: this.staHeightCm(),
        weight_kg: this.staWeightKg(),
        basePrice: this.orderForm.get('shipping_cost')?.value,
        finalPrice: this.orderForm.get('shipping_cost')?.value,
        isPrincipal: true,
      };

      formValue.items.push(standardItem);
      formValue.shipping_cost = this.orderForm.get('shipping_cost')?.value;
    }

    if (formValue.items.length === 0) {
      this.snackBar.open('Debe agregar al menos un paquete.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (formValue.shipping_cost === 0) {
      this.snackBar.open('El costo de envío no puede ser 0.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    formValue.item_description =
      (formValue.items.length === 1
        ? '1 Bulto: '
        : formValue.items.length + ' Bultos: ') +
      formValue.items
        .map((item: OrderItem) => {
          let str =
            item.description +
            ' Medidas L:' +
            item.length_cm +
            ' x An:' +
            item.width_cm +
            ' x Al:  ' +
            item.height_cm +
            ' (' +
            item.weight_kg +
            'kg)';

          return str;
        })
        .join(', ') +
      (formValue.item_description ? ' | ' + formValue.item_description : '');

    const newOrderData: NewOrderData = {
      ...formValue,
      delivery_district_name: this.selectedDistrictName(),
      temp_id: `temp-${Date.now()}`,
    };
    console.log('Submitting New Order Data:', newOrderData);
    this.orderSubmit.emit(newOrderData);
  }

  resetFormForNextOrder(): void {
    this.driverSearchCtrl.setValue('');
    this.districtSearchCtrl.setValue('');

    let company_id = null;
    if (this.isCompany()) {
      company_id = this.orderForm.get('company_id')?.value;
    }

    const defaultShipmentType =
      this.orderForm.get('shipment_type')?.value || this.shipmentTypes[0];
    const defaultPaymentMethod = this.paymentMethodsForCollection[0];

    this.orderForm.reset({
      isExpress: false,
      company_id: company_id,
      shipment_type: defaultShipmentType,
      delivery_date: null,
      items: this.fb.array([], Validators.required),
      shipping_cost: 0,
      amount_to_collect_at_delivery: 0,
      payment_method_for_collection: defaultPaymentMethod,
    });
    this.newItemForm.reset({
      package_type: PackageType.STANDARD,
      description: '',
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      weight_kg: 0,
    });
    this.loadSettings();
    this.formValidityChanged.emit(this.orderForm.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Utilidad para depurar errores de formulario
  private getFormErrors(formGroup: FormGroup): FormErrors {
    const errors: FormErrors = {};
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
