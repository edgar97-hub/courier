import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// import { CreateDistributorRegistrationDto } from '../../models/distributor-registration.model';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
})
export class RegistrationFormComponent {
  @Input() initialData: any | null = null;
  @Input() isEditMode: boolean = false;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      clientDni: ['', [Validators.required, Validators.minLength(8)]],
      clientPhone: ['', [Validators.required, Validators.minLength(9)]],
      observation: [''],
      destinationAddress: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    // Si recibimos datos iniciales, llenamos el formulario
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  /**
   * Se llama cuando el usuario hace clic en el botón de "Añadir Registro".
   * Si el formulario es válido, emite los datos y lo resetea.
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
      // Reseteamos el formulario para que el usuario pueda añadir otro registro.
      this.form.reset();
      // Marcamos los campos como 'untouched' para que no muestren errores de validación.
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.setErrors(null);
        this.form.get(key)?.markAsUntouched();
      });
    }
  }

  onCancelClick(): void {
    this.formCancel.emit();
  }
}
