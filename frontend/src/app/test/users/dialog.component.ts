import {
  Component,
  inject,
  OnInit,
  Input,
  Inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FieldErrorDirective } from '../../shared/directives/field-error.directive';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sample-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInput,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIcon,
  ],
  template: `
    <h2 mat-dialog-title>Formulario Usuario</h2>
    <mat-dialog-content>
      <form [formGroup]="myForm" class="mb-6" (ngSubmit)="onSubmit(myForm)">
        <div
          class="max-w-3xl p-2 rounded-lg mat-elevation-z3 mb-6 bg-surface-container"
        >
          <div class="grid grid-cols-1 md:grid-cols-1 gap-3 mb-0">
            <mat-form-field>
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="username" />
              <mat-error appFieldError></mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Correo</mat-label>
              <input matInput formControlName="email" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                placeholder="Ingrese su contraseña"
                formControlName="password"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword.set(!hidePassword())"
                type="button"
                class="mr-1"
              >
                <mat-icon>{{
                  hidePassword() ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Rol</mat-label>
              <mat-select formControlName="role">
                <mat-option value="ADMIN">Administrador</mat-option>
                <mat-option value="MOTORIZED">Motorizado</mat-option>
                <mat-option value="CUSTOMER">Cliente</mat-option>
              </mat-select>
              <mat-error appFieldError></mat-error>
            </mat-form-field>
          </div>

          <mat-dialog-actions>
            <button class="mb-3 mt-2" mat-stroked-button matDialogClose>
              Cerrar
            </button>
            <button type="submit" class="mb-3 mt-2" mat-flat-button>
              Guardar
            </button>
          </mat-dialog-actions>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styles: ``,
})
export class DialogComponent {
  myForm: FormGroup;
  dialogRef: any;
  action: any;
  userService = inject(UserService);
  getUsers: any;
  dataSource: any;

  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogRef = this.data.dialog;
    this.action = data.obj.action;
    this.getUsers = data.getUsers;
    this.dataSource = data.dataSource;

    if (data.obj.action === 'update') {
      this.myForm = this.fb.group({
        id: [data.obj.id, []],
        username: [data.obj.username, [Validators.required]],
        email: [data.obj.email, [Validators.required]],
        password: ['', []],
        role: [data.obj.role, Validators.required],
      });
    } else {
      this.myForm = this.fb.group({
        username: ['', [Validators.required]],
        email: ['', [Validators.required]],
        password: ['', [Validators.required]],
        role: ['CUSTOMER', Validators.required],
      });
    }
  }

  async onSubmit(form: FormGroup) {
    console.log('Valid?', form.valid);
    if (form.valid) {
      const local = localStorage.getItem('user');
      const user = local ? JSON.parse(local) : null;
      console.log('user', user);
      if (!user) {
        return;
      }
      if (this.action === 'update') {
        this.userService
          .update({
            id: form.value.id,
            username: form.value.username,
            email: form.value.email,
            password: form.value.password,
            role: form.value.role,
            token: user.token,
          })
          .subscribe({
            next: (data) => {
              console.log(data);
              const myObservable = of('Data received');
              const subscriptionDelay = timer(2000); // Delay subscription by 3 seconds

              myObservable
                .pipe(delayWhen(() => subscriptionDelay))
                .subscribe((data) => {
                  console.log(data); // Executes after the 3-second delay
                  this.getUsers(this.dataSource);
                });
            },
            error: (e) => {
              console.log(e);
            },
          });
      } else {
        this.userService
          .insert({
            username: form.value.username,
            email: form.value.email,
            password: form.value.password,
            role: form.value.role,
            token: user.token,
          })
          .subscribe({
            next: (data) => {
              console.log(data);
              const myObservable = of('Data received');
              const subscriptionDelay = timer(2000); // Delay subscription by 3 seconds

              myObservable
                .pipe(delayWhen(() => subscriptionDelay))
                .subscribe((data) => {
                  console.log(data); // Executes after the 3-second delay
                  this.getUsers(this.dataSource);
                });
            },
            error: (e) => {
              console.log(e);
            },
          });
      }
      this.dialogRef.closeAll();
    }
  }
  // fb = inject(NonNullableFormBuilder);

  // userForm = this.fb.group({
  //   username: [
  //     '',
  //     [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
  //   ],
  //   email: ['', [Validators.required]],
  //   role: ['CUSTOMER', Validators.required],

  //   // middleName: [''],
  //   // lastName: [
  //   //   '',
  //   //   [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
  //   // ],
  //   // dateOfBirth: [new Date(), Validators.required],
  //   // phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
  //   // language: ['english'],

  //   // // Address Information
  //   // streetAddress: [
  //   //   '',
  //   //   [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
  //   // ],
  //   // apartmentUnit: [''],
  //   // city: [
  //   //   '',
  //   //   [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
  //   // ],
  //   // stateProvince: [
  //   //   '',
  //   //   [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
  //   // ],
  //   // postalCode: ['', [Validators.required, Validators.minLength(5)]],
  //   // country: ['us', Validators.required],
  //   // timeZone: ['utc-5'],
  //   // currency: ['usd'],
  // });

  // // onSubmit() {
  // //   // this.userForm.markAllAsTouched();
  // //   console.log('this.userForm', this.userForm.get('email'));
  // //   // console.log('Valid?', form.valid); // true or false
  // //   // console.log('Name', form.value.name);
  // //   // console.log('Email', form.value.email);
  // //   // console.log('Message', form.value.message);
  // // }
  // onSubmit(): void {
  //   if (this.userForm.valid) {
  //     console.log('Form Data:', this.userForm.value); // Form values on submission
  //   } else {
  //     console.log('Form is invalid.');
  //   }
  // }
}
