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
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../models/user.model'; // Ajusta la ruta
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatDividerModule,
    MatCheckboxModule,
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

  ngOnInit(): void {
    this.initForm();
    if (this.userToEdit) {
      this.userForm.patchValue(this.userToEdit);
    }

    this.userForm.get('role')?.valueChanges.subscribe((roleValue) => {
      this.handleRoleChange(roleValue);
    });
  }
  get roleControl(): FormControl {
    return this.userForm.get('role') as FormControl;
  }
  handleRoleChange(role: string): void {}

  private initForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      role: ['COMPANY'],

      business_type: ['', []],
      business_name: ['', []],
      business_district: ['', []],
      business_address: ['', []],
      business_phone_number: ['', []],
      business_sector: ['', []],
      business_document_type: ['', []],
      business_email: ['', []],
      assumes_5_percent_pos: [false, []],
      business_document_number: ['', []],

      owner_name: ['', []],
      owner_phone_number: ['', []],
      owner_document_type: ['', []],
      owner_document_number: ['', []],
      owner_email_address: ['', []],

      owner_bank_account: ['', []],
      name_account_number_owner: ['', []],
    });

    this.userForm.get('username')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('assumes_5_percent_pos')?.disable();

    this.userForm.get('owner_name')?.disable();
    this.userForm.get('owner_phone_number')?.disable();
    this.userForm.get('owner_document_type')?.disable();
    this.userForm.get('owner_document_number')?.disable();
    this.userForm.get('owner_email_address')?.disable();
    this.userForm.get('owner_bank_account')?.disable();
    this.userForm.get('name_account_number_owner')?.disable();
  }

  get username() {
    return this.userForm.get('username');
  }
  get email() {
    return this.userForm.get('email');
  }

  onSubmit(): void {
    if (this.userToEdit && this.userToEdit.id) {
      const formData: User = {
        ...(this.userToEdit as User),
        ...this.userForm.value,
        id: this.userToEdit.id,
      };
      console.log('formData', formData);
      this.formSubmit.emit(formData);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
