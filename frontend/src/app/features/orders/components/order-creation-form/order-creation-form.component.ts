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
import {
  ProgressSpinnerMode,
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';
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
  @Output() formValidityChanged = new EventEmitter<boolean>(); // Para notificar al padre

  orderForm!: FormGroup;
  deliveryDistricts$: Observable<DistrictOption[]>;
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

  // Para mostrar el nombre del distrito seleccionado, no solo el ID
  selectedDistrictName = computed(() => {
    const districtId = this.orderForm?.get('delivery_district_id')?.value;
    if (!districtId || !this._districtsCache) return '';
    return this._districtsCache.find((d) => d.id === districtId)?.name || '';
  });

  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();
  _districtsCache: DistrictOption[] = [];

  drivers$: Observable<User[]> = of([]); // Observable para la lista de motorizados
  isLoadingDrivers = false;
  selectedDriver: User | null = null;

  driverSearchCtrl = new FormControl('');
  filteredDrivers$: Observable<User[]>;

  constructor() {
    this.minDeliveryDate = new Date(); // No se puede entregar en el pasado
    this.deliveryDistricts$ = this.orderService.getDeliveryDistricts().pipe(
      map((allDistricts: DistrictOption[]) => {
        this._districtsCache = allDistricts;
        return allDistricts.filter((district) => district.isStandard);
      })
      // tap((districts) => (this._districtsCache = districts)) // Cachear para buscar nombre
    );
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
            return of([]); // Devuelve array vacío en caso de error
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
    this.selectedDriver = event.option.value as User;
    console.log('cliente selected:', this.selectedDriver);

    this.orderForm.get('company_id')?.setValue(this.selectedDriver.id);
    this.orderForm.markAllAsTouched();
    console.log('Order form is invalid:', this.getFormErrors(this.orderForm));
    const formValue = this.orderForm.getRawValue(); // getRawValue para incluir campos deshabilitados (como los de paquete estándar)
    console.log('formValue', formValue);
  }

  clearSelection(): void {
    this.selectedDriver = null;
    this.driverSearchCtrl.setValue('');
    this.orderForm.markAllAsTouched();
    this.orderForm.get('company_id')?.setValue(null);
    console.log('Order form is invalid:', this.getFormErrors(this.orderForm));
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
          if (
            this.packageDetailsFormGroup.get('package_size_type')?.value ===
            'standard'
          ) {
            let ditrict = this._districtsCache.find(
              (item) => item.id === newDistrictId
            );
            if (ditrict) {
              this.calculatedShippingCost.set(parseFloat(ditrict.price));
            }
          } else {
            this.calculatedShippingCost.set(0);
          }

          // this.resetPackageTypeSelection();
          // También es un buen momento para recalcular el costo de envío
          // si el tipo de paquete ya estaba seleccionado como 'standard'
          // if (
          //   this.packageDetailsFormGroup.get('package_size_type')?.value ===
          //   'standard'
          // ) {
          //   // Llama al método que el PackageCalculatorComponent usa para el costo estándar
          //   // Esto es un poco indirecto. Sería mejor si PackageCalculatorComponent
          //   // también escuchara el cambio de distrito si su cálculo depende de él.
          //   // Por ahora, reseteamos el costo calculado en el formulario padre:
          //   this.calculatedShippingCost.set(0); // O null, e indicarle al usuario que recalcule
          //   // const packageCalculator = this.getChildPackageCalculator(); // Necesitarás un ViewChild
          //   // if (
          //   //   packageCalculator &&
          //   //   packageCalculator.packageFormGroup.get('package_size_type')
          //   //     ?.value === 'standard'
          //   // ) {
          //   //   packageCalculator.calculateStandardShippingCost();
          //   // }
          // } else {
          //   // Si era 'custom', simplemente limpiar el costo para que el usuario recalcule
          //   this.calculatedShippingCost.set(0); // O null
          // }
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
          let ditrict = this._districtsCache.find(
            (item) => item.id === deliveryDistrictId
          );
          if (ditrict) {
            this.calculatedShippingCost.set(parseFloat(ditrict.price));
          }
        } else {
          this.calculatedShippingCost.set(0);
        }
      });
  }

  // private resetPackageTypeSelection(): void {
  //   const packageTypeControl =
  //     this.packageDetailsFormGroup.get('package_size_type');
  //   if (packageTypeControl) {
  //     // Opción A: Desmarcar todo (si mat-radio-group lo permite sin un valor)
  //     // packageTypeControl.reset(null, { emitEvent: false }); // emitEvent: false para evitar bucles si hay otras suscripciones
  //     // Opción B: Resetear a un valor por defecto, por ejemplo 'standard'
  //     // packageTypeControl.setValue('standard', { emitEvent: true }); // emitEvent: true para que PackageCalculator reaccione
  //     // console.log('Package type reset to standard');
  //     // Si reseteas a 'standard', el PackageCalculatorComponent (si está bien implementado)
  //     // debería deshabilitar los campos custom y recalcular el costo para estándar.
  //     // Si reseteas a null, PackageCalculatorComponent debería manejar ese estado.
  //   }
  //   // También reseteamos el costo de envío calculado
  //   this.calculatedShippingCost.set(0); // O null
  //   this.isCalculatingShipping.set(false);
  // }

  get packageDetailsFormGroup(): FormGroup {
    return this.orderForm.get('package_details') as FormGroup;
  }

  private buildForm(): void {
    let company_id = null;
    if (this.isCompany()) {
      company_id = this.appStore.currentUser()?.id;
    }

    // var d = new Date();
    // let date = d.toLocaleString('en-US', { timeZone: 'America/Bogota' });
    // console.log('date', date);
    // const todayString = this.datePipe.transform(date, 'yyyy-MM-dd');
    // const todayString = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

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

    // this.orderForm = this.fb.group({
    //   shipment_type: [this.shipmentTypes[0], Validators.required],
    //   recipient_name: ['wwwwwwwww', Validators.required],
    //   recipient_phone: [
    //     951954633,
    //     [Validators.required, Validators.pattern('^[0-9]{9}$')],
    //   ],
    //   company_id: ['wwwwwwwww', Validators.required],
    //   delivery_district_id: ['wwwwwwwww', Validators.required],
    //   delivery_address: [
    //     'wwwwwwwww',
    //     [Validators.required, Validators.minLength(6)],
    //   ],
    //   delivery_coordinates: ['wwwwwwwww'],
    //   delivery_date: ['2025-06-03', Validators.required], // String en formato YYYY-MM-DD
    //   package_details: this.fb.group({
    //     // Sub-FormGroup para PackageCalculatorComponent
    //     package_size_type: ['standard', Validators.required],
    //     package_width_cm: [{ value: 0, disabled: true }],
    //     package_length_cm: [{ value: 0, disabled: true }],
    //     package_height_cm: [{ value: 0, disabled: true }],
    //     package_weight_kg: [{ value: 0, disabled: true }],
    //   }),
    //   // shipping_cost se maneja con la señal `calculatedShippingCost`
    //   item_description: ['wwwwwwwww', Validators.required],
    //   amount_to_collect_at_delivery: [
    //     0,
    //     [Validators.required, Validators.min(0)],
    //   ],
    //   payment_method_for_collection: [
    //     this.paymentMethodsForCollection[0],
    //     Validators.required,
    //   ],
    //   observations: [''],
    // });
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
    // console.log('newOrderData', newOrderData);
    // delete newOrderData.package_details; // Eliminar el subgrupo anidado

    console.log('Submitting New Order Data:', newOrderData);
    this.orderSubmit.emit(newOrderData);
    // El componente padre (OrderCreatePage) reseteará este formulario
  }

  resetFormForNextOrder(): void {
    this.selectedDriver = null;
    this.driverSearchCtrl.setValue('');
    let company_id = null;
    if (this.isCompany()) {
      company_id = this.orderForm.get('company_id')?.value;
    }

    const defaultShipmentType =
      this.orderForm.get('shipment_type')?.value || this.shipmentTypes[0];
    const defaultPaymentMethod =
      this.orderForm.get('payment_method_for_collection')?.value ||
      this.paymentMethodsForCollection[0];
    // const todayString = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.orderForm.reset({
      company_id: company_id,
      shipment_type: defaultShipmentType,
      delivery_date: null,
      package_details: { package_size_type: 'standard' }, // Resetear subformulario también
      amount_to_collect_at_delivery: 0,
      payment_method_for_collection: defaultPaymentMethod,
      // Los otros campos se resetean a null/'' por defecto
    });
    this.calculatedShippingCost.set(0); // Resetear costo de envío
    // Forzar la re-evaluación del estado de los controles de paquete
    this.packageDetailsFormGroup
      .get('package_size_type')
      ?.setValue('standard', { emitEvent: true });
    this.formValidityChanged.emit(this.orderForm.valid); // Emitir nuevo estado de validez
  }

  getDistrictCoverageInfo(districtId: string | number | null): string {
    if (
      !districtId ||
      !this._districtsCache ||
      this._districtsCache.length === 0
    ) {
      return ''; // O un mensaje por defecto si no hay distrito seleccionado o caché no cargado
    }
    const foundDistrict = this._districtsCache.find((d) => d.id === districtId);
    return foundDistrict?.name || ''; // Devuelve coverage_info o string vacío si no se encuentra
  }

  // Helper para obtener el FormGroup de package_details

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
