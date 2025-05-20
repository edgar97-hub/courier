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
import { Subject, Observable, Subscription } from 'rxjs';
import { takeUntil, tap, distinctUntilChanged, map } from 'rxjs/operators';

import { PackageCalculatorComponent } from '../package-calculator/package-calculator.component';
import { OrderService } from '../../services/order.service';
import { DistrictOption, NewOrderData } from '../../models/order.model';
import {
  ProgressSpinnerMode,
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

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

  shipmentTypes: string[] = ['SOLO ENTREGA NO COBRAR']; // Podría venir de una API
  paymentMethodsForCollection: string[] = [
    'NO COBRAR',
    'EFECTIVO',
    'YAPE',
    'PLIN',
    'TRANSFERENCIA',
  ];

  calculatedShippingCost: WritableSignal<number> = signal(0);
  isCalculatingShipping: WritableSignal<boolean> = signal(false);

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
  private _districtsCache: DistrictOption[] = [];

  constructor() {
    this.minDeliveryDate = new Date(); // No se puede entregar en el pasado
    this.deliveryDistricts$ = this.orderService.getDeliveryDistricts().pipe(
      map((allDistricts: DistrictOption[]) => {
        return allDistricts.filter(
          (district) => district.isStandard
        );
      }),
      tap((districts) => (this._districtsCache = districts)) // Cachear para buscar nombre
    );
    this.buildForm();
  }

  ngOnInit(): void {
    // Emitir validez del formulario cuando cambie
    this.orderForm.statusChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((status) => {
        this.formValidityChanged.emit(status === 'VALID');
      });
  }

  private buildForm(): void {
    const todayString = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.orderForm = this.fb.group({
      shipment_type: [this.shipmentTypes[0], Validators.required],
      recipient_name: ['', Validators.required],
      recipient_phone: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9}$')],
      ],
      delivery_district_id: [null, Validators.required],
      delivery_address: ['', [Validators.required, Validators.minLength(6)]],
      delivery_coordinates: [''],
      delivery_date: [todayString, Validators.required], // String en formato YYYY-MM-DD
      package_details: this.fb.group({
        // Sub-FormGroup para PackageCalculatorComponent
        package_size_type: ['standard', Validators.required],
        package_width_cm: [{ value: null, disabled: true }],
        package_length_cm: [{ value: null, disabled: true }],
        package_height_cm: [{ value: null, disabled: true }],
        package_weight_kg: [{ value: null, disabled: true }],
      }),
      // shipping_cost se maneja con la señal `calculatedShippingCost`
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
    // delete newOrderData.package_details; // Eliminar el subgrupo anidado

    console.log('Submitting New Order Data:', newOrderData);
    this.orderSubmit.emit(newOrderData);
    // El componente padre (OrderCreatePage) reseteará este formulario
  }

  resetFormForNextOrder(): void {
    const defaultShipmentType =
      this.orderForm.get('shipment_type')?.value || this.shipmentTypes[0];
    const defaultPaymentMethod =
      this.orderForm.get('payment_method_for_collection')?.value ||
      this.paymentMethodsForCollection[0];
    const todayString = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.orderForm.reset({
      shipment_type: defaultShipmentType,
      delivery_date: todayString,
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
  get packageDetailsFormGroup(): FormGroup {
    return this.orderForm.get('package_details') as FormGroup;
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
