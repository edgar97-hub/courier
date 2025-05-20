import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../models/user.model'; // Ajusta la ruta
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() userToEdit: User | null = null;
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<User>();
  @Output() formCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  hidePassword = signal(true);

  constructor(private fb: FormBuilder) {}

  //  @Input() userToEdit: User | null = null;
  // @Input() isLoading: boolean | null = false; // Acepta null por el pipe async
  // @Output() formSubmit = new EventEmitter<User | Omit<User, 'id'>>(); // Puede emitir User completo o sin ID
  // @Output() formCancel = new EventEmitter<void>();

  ngOnInit(): void {
    this.initForm();
    if (this.userToEdit) {
      this.userForm.patchValue(this.userToEdit);
    }
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      id: [null], // Se manejará en el servicio o backend
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      role: ['CUSTOMER'],
    });
  }

  get username() {
    return this.userForm.get('username');
  }
  get email() {
    return this.userForm.get('email');
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.userToEdit && this.userToEdit.id) {
        // Es edición
        // Incluye el ID original y los valores del formulario
        const formData: User = {
          ...(this.userToEdit as User), // Mantener propiedades no editables si las hay
          ...this.userForm.value,
          id: this.userToEdit.id, // Asegurar que el ID no se pierda
        };
        this.formSubmit.emit(formData);
      } else {
        // Es creación
        const { id, ...formDataWithoutId } = this.userForm.value; // Excluir el ID (que sería null)
        this.formSubmit.emit(formDataWithoutId as Omit<User, 'id'>);
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
