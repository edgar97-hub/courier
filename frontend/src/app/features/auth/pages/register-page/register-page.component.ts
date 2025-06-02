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
          <div class="logo-wrapper">
            <!-- <img
              src="{{ logoImageUrl }}"
              style="max-width: 100px; border: 0px solid black"
            /> -->
            <mat-card-title
              style="margin-top: 10px;
            color: #012147;
            font-family: Montserrat, sans-serif !important;
            "
              >Regístrate gratis</mat-card-title
            >
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="username" required />
              <mat-error *ngIf="name?.hasError('required')"
                >El nombre es obligatorio</mat-error
              >
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo</mat-label>
              <input
                matInput
                formControlName="userEmail"
                type="email"
                required
                autocomplete="off"
              />
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
                formControlName="userPass"
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
              class="full-width btn-corp-primary"
              type="submit"
              [disabled]="isLoading || registerForm.invalid"
            >
              {{ isLoading ? 'Registrarse...' : 'Registrarse' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="auth-card-actions">
          <p>
            ¿Ya tienes una cuenta?<a style="color: #012147" routerLink="/login">
              Iniciar sesión</a
            >
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['../../../login/pages/login-page/login-page.component.scss'],
})
export class RegisterPageComponent {
  imageUrl: string = environment.apiUrl + '/settings/company/background-image';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  isLoading = false;
  logoImageUrl: string = environment.apiUrl + '/settings/company/logo-image';

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userPass: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get name() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('userEmail');
  }
  get password() {
    return this.registerForm.get('userPass');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const { username, userEmail, userPass } = this.registerForm.value;

    fetch(environment.apiUrl + '/users/register-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: userEmail,
        password: userPass,
      }),
    })
      .then(async (response) => {
        let res = await response.json();
        this.isLoading = false;
        if (res.message) {
          this.snackBar.open('Ya existe un usuario con ese correo', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        } else {
          this.snackBar.open(
            '¡Registro exitoso! Por favor, inicia sesión.',
            'OK',
            {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.router.navigate(['/login']);
        }
      })
      .catch((error) => {
        this.isLoading = false;
        this.snackBar.open('No se pudo registrar su informacion.', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      });
  }
}
