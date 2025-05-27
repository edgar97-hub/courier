import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, startWith, map, switchMap } from 'rxjs';

import { District } from '../../models/district.model';
import { DistrictService } from '../../services/district.service'; // Para el autocompletado
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-district-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './district-form.component.html',
  styleUrls: ['./district-form.component.scss'],
})
export class DistrictFormComponent implements OnInit, OnChanges {
  @Input() districtToEdit: District | null = null;
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<
    Omit<District, 'id' | 'createdAt' | 'updatedAt'>
  >();
  @Output() formCancel = new EventEmitter<void>();

  districtForm!: FormGroup;
  private districtService = inject(DistrictService);
  filteredDistrictNames$: Observable<string[]> = of([]); // Para el autocompletado

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupNameAutocomplete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['districtToEdit'] && this.districtToEdit && this.districtForm) {
      // Usar patchValue para actualizar el formulario si districtToEdit cambia después de la inicialización
      this.districtForm.patchValue({
        code: this.districtToEdit.code || null,
        name: this.districtToEdit.name,
        weight_from: this.districtToEdit.weight_from,
        weight_to: this.districtToEdit.weight_to,
        price: this.districtToEdit.price,
        isStandard: this.districtToEdit.isStandard,
      });
    } else if (
      changes['districtToEdit'] &&
      !this.districtToEdit &&
      this.districtForm
    ) {
      this.districtForm.reset({ isStandard: false }); // Resetear si se quita districtToEdit
    }
  }

  private initForm(): void {
    this.districtForm = this.fb.group({
      code: [null], // Puede ser opcional o generado por el backend
      name: ['', Validators.required],
      weight_from: [
        0,
        [
          Validators.required,
          Validators.min(0),
          this.weightRangeCrossValidator,
        ],
      ],
      weight_to: [
        0,
        [
          Validators.required,
          Validators.min(0),
          this.weightRangeCrossValidator,
        ],
      ],
      price: [0, [Validators.required, Validators.min(0)]],
      isStandard: [false, Validators.required], // Checkbox por defecto no marcado
    });

    // Si hay datos para editar, popular el formulario
    if (this.districtToEdit) {
      this.districtForm.patchValue(this.districtToEdit);
    }
  }

  // Validador personalizado para asegurar que weight_from <= weight_to
  private weightRangeCrossValidator: (
    control: AbstractControl
  ) => ValidationErrors | null = (
    formGroup: AbstractControl
  ): ValidationErrors | null => {
    const weightFromCtrl = formGroup.get('weight_from');
    const weightToCtrl = formGroup.get('weight_to');

    if (
      !weightFromCtrl ||
      !weightToCtrl ||
      !weightFromCtrl.value ||
      !weightToCtrl.value
    ) {
      return null; // No validar si los controles o sus valores no existen
    }

    const from = parseFloat(weightFromCtrl.value);
    const to = parseFloat(weightToCtrl.value);

    let errors: ValidationErrors | null = null;

    // Limpiar errores previos en ambos controles para evitar que se queden "pegados"
    if (weightFromCtrl.hasError('weightOrder')) {
      const currentErrors = { ...weightFromCtrl.errors };
      delete currentErrors['weightOrder'];
      weightFromCtrl.setErrors(
        Object.keys(currentErrors).length > 0 ? currentErrors : null,
        { emitEvent: false }
      );
    }
    if (weightToCtrl.hasError('weightOrder')) {
      const currentErrors = { ...weightToCtrl.errors };
      delete currentErrors['weightOrder'];
      weightToCtrl.setErrors(
        Object.keys(currentErrors).length > 0 ? currentErrors : null,
        { emitEvent: false }
      );
    }

    if (from > to && to !== 0) {
      // Permitir que 'to' sea 0 si 'from' también es 0 o si se está ingresando
      // Establecer el error en el control 'weight_from'
      const currentFromErrors = weightFromCtrl.errors || {};
      weightFromCtrl.setErrors({
        ...currentFromErrors,
        weightOrder: 'Desde no puede ser mayor que Hasta',
      });
      errors = { weightRangeInvalid: true }; // Error a nivel de grupo (opcional)
    }

    // Ya no necesitamos validar "to < from" aquí porque la lógica anterior lo cubre
    // si 'from' es mayor que 'to'. Si 'from' no es mayor que 'to', entonces 'to' >= 'from'
    // lo cual es generalmente válido a menos que quieras una validación estricta de 'to' > 'from'.

    // Si no hay errores de rango, pero los controles tenían errores 'weightOrder' de validaciones previas,
    // se limpiaron arriba.

    return errors; // Devuelve null si es válido, o un objeto de error para el FormGroup
  };

  private setupNameAutocomplete(): void {
    if (this.districtForm.get('name')) {
      this.filteredDistrictNames$ = this.districtForm
        .get('name')!
        .valueChanges.pipe(
          startWith(''),
          // Retrasar ligeramente para no sobrecargar con cada tipeo si el servicio es lento
          // debounceTime(300),
          // distinctUntilChanged(),
          switchMap((value) => {
            if (typeof value === 'string' && value.length > 0) {
              return this.districtService.filterDistrictNames(value);
            }
            return this.districtService.districtNames$; // Mostrar todos si el campo está vacío
          })
        );
    }
  }

  // Cuando se selecciona una opción del autocompletado
  onDistrictNameSelected(event: MatAutocompleteSelectedEvent): void {
    // this.districtForm.get('name')?.setValue(event.option.viewValue);
    // No es necesario si usas [displayWith] o si el valor es el que quieres.
  }

  onSubmit(): void {
    if (this.districtForm.valid) {
      const formData = this.districtForm.value;
      // No enviar 'code' si es null o si la API no lo espera para creación
      const payload: Omit<District, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        weight_from: parseFloat(formData.weight_from),
        weight_to: parseFloat(formData.weight_to),
        price: parseFloat(formData.price),
        isStandard: formData.isStandard,
      };
      if (
        formData.code !== null &&
        formData.code !== undefined &&
        formData.code !== ''
      ) {
        payload.code = parseInt(formData.code, 10);
      }
      this.formSubmit.emit(payload);
    } else {
      this.districtForm.markAllAsTouched();
    }
  }

  onCancelClick(): void {
    this.formCancel.emit();
  }

  // Getters para acceso fácil en la plantilla
  get nameCtrl() {
    return this.districtForm.get('name');
  }
  get weightFromCtrl() {
    return this.districtForm.get('weight_from');
  }
  get weightToCtrl() {
    return this.districtForm.get('weight_to');
  }
  get priceCtrl() {
    return this.districtForm.get('price');
  }
}
