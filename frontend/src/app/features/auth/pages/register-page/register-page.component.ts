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
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register-page',
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
    <div
      class="login-page-wrapper"
      [style.background-image]="'url(' + imageUrl + ')'"
    >
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
          <mat-card-title>Crear una cuenta</mat-card-title>
          <mat-card-subtitle>¡Únase a nosotros hoy!</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" required />
              <mat-error *ngIf="name?.hasError('required')"
                >El nombre es obligatorio</mat-error
              >
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo</mat-label>
              <input matInput formControlName="email" type="email" required />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="email?.hasError('required')"
                >Se requiere correo</mat-error
              >
              <mat-error *ngIf="email?.hasError('email')"
                >Formato de correo electrónico no válido</mat-error
              >
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                type="password"
                required
              />
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="password?.hasError('required')"
                >Se requiere contraseña</mat-error
              >
              <mat-error *ngIf="password?.hasError('minlength')"
                >La contraseña debe tener al menos 6 caracteres</mat-error
              >
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              class="full-width"
              type="submit"
              [disabled]="isLoading || registerForm.invalid"
            >
              {{ isLoading ? 'Registrarse...' : 'Registrarse' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-card-actions">
          <p>¿Ya tienes una cuenta?<a routerLink="/login">Iniciar sesión</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['../../../login/pages/login-page/login-page.component.scss'],
})
export class RegisterPageComponent {
  imageUrl: string = environment.apiUrl + '/settings/company/background-image';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Asumimos que authService tendrá un método register
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get name() {
    return this.registerForm.get('name');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;
    // Simulación: this.authService.register({ name, email, password })
    console.log('Registering user:', { name, email, password });
    setTimeout(() => {
      // Simular llamada API
      this.isLoading = false;
      this.snackBar.open('Registration successful! Please log in.', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['/login']);
    }, 1500);
  }
}
