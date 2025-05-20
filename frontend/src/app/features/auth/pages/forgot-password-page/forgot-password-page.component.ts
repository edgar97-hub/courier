import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service'; // Ajusta la ruta

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-page-wrapper">
      <mat-card class="login-card">
        <mat-card-header class="login-card-header">
          <button
            mat-icon-button
            routerLink="/login"
            class="back-button"
            aria-label="Back to login"
          >
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title>Has olvidado tu contraseña</mat-card-title>
          <mat-card-subtitle
            >Ingresa tu correo electrónico para restablecer tu
            contraseña</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="email?.hasError('required')"
                >Se requiere correo
              </mat-error>
              <mat-error *ngIf="email?.hasError('email')"
                >Formato de correo no válido</mat-error
              >
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              class="full-width"
              type="submit"
              [disabled]="isLoading || forgotPasswordForm.invalid"
            >
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['../../../login/pages/login-page/login-page.component.scss'],
})
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Asumimos que authService tendrá un método para esto
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    // Simulación: this.authService.sendPasswordResetEmail(this.email?.value)
    console.log('Password reset requested for:', this.email?.value);
    setTimeout(() => {
      // Simular llamada API
      this.isLoading = false;
      this.snackBar.open(
        'If an account exists for this email, a reset link has been sent.',
        'OK',
        {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        }
      );
      this.router.navigate(['/login']);
    }, 1500);
  }
}
