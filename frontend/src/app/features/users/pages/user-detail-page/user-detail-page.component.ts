import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AppStore } from '../../../../app.store';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrls: ['./user-detail-page.component.scss'],
})
export class UserDetailPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly appStore = inject(AppStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  user: User | null = null;
  isLoading = true;
  isSaving = false;

  readonly userForm = this.fb.group({
    username: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
    business_type: [''],
    business_name: [''],
    business_district: [''],
    business_address: [''],
    business_phone_number: [''],
    business_sector: [''],
    business_document_type: [''],
    business_email: [''],
    business_document_number: [''],
    assumes_5_percent_pos: [{ value: false, disabled: true }],
    owner_name: [{ value: '', disabled: true }],
    owner_phone_number: [{ value: '', disabled: true }],
    owner_document_type: [{ value: '', disabled: true }],
    owner_document_number: [{ value: '', disabled: true }],
    owner_email_address: [{ value: '', disabled: true }],
    owner_bank_account: [{ value: '', disabled: true }],
    name_account_number_owner: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    const currentUserId = this.appStore.currentUser()?.id;
    if (!currentUserId) {
      this.isLoading = false;
      this.snackBar.open('No se pudo identificar el usuario actual.', 'OK', {
        duration: 4000,
        panelClass: ['error-snackbar'],
      });
      this.router.navigate(['/dashboard']);
      return;
    }

    this.userService.getUserById(currentUserId).subscribe({
      next: (user) => {
        this.user = user;
        this.userForm.patchValue(user);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar los datos del negocio.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || this.isSaving) {
      return;
    }

    const currentUserId = this.appStore.currentUser()?.id;
    if (!currentUserId || !this.user) {
      return;
    }

    const formValue = this.userForm.getRawValue();
    this.isSaving = true;

    this.userService
      .updateUserCompany(currentUserId, {
        business_type: formValue.business_type ?? undefined,
        business_name: formValue.business_name ?? undefined,
        business_district: formValue.business_district ?? undefined,
        business_address: formValue.business_address ?? undefined,
        business_phone_number: formValue.business_phone_number ?? undefined,
        business_sector: formValue.business_sector ?? undefined,
        business_document_type: formValue.business_document_type ?? undefined,
        business_email: formValue.business_email ?? undefined,
        business_document_number:
          formValue.business_document_number ?? undefined,
        assumes_5_percent_pos: formValue.assumes_5_percent_pos ?? false,
        owner_name: formValue.owner_name ?? undefined,
        owner_phone_number: formValue.owner_phone_number ?? undefined,
        owner_document_type: formValue.owner_document_type ?? undefined,
        owner_document_number: formValue.owner_document_number ?? undefined,
        owner_email_address: formValue.owner_email_address ?? undefined,
        owner_bank_account: formValue.owner_bank_account ?? undefined,
        name_account_number_owner:
          formValue.name_account_number_owner ?? undefined,
      })
      .subscribe({
        next: (savedUser) => {
          this.isSaving = false;
          this.user = savedUser;
          this.userForm.patchValue(savedUser);
          this.snackBar.open(
            'Datos del negocio guardados exitosamente.',
            'OK',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        },
        error: () => {
          this.isSaving = false;
          this.snackBar.open(
            'Error al guardar los datos del negocio. Inténtalo de nuevo.',
            'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
