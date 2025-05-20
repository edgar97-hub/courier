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
import { FieldErrorDirective } from '../../../shared/directives/field-error.directive';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { DistrictService } from '../../shared/services/district.service';

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
    MatCheckboxModule,
    FieldErrorDirective,
  ],
  template: `
    <h2 mat-dialog-title>Formulario Distrito</h2>
    <mat-dialog-content>
      <form
        [formGroup]="myForm"
        class="flex mb-10"
        (ngSubmit)="onSubmit(myForm)"
      >
        <div
          class="max-w-3xl p-2 rounded-lg mat-elevation-z3 mb-6 bg-surface-container"
        >
          <div class="grid grid-cols-1 md:grid-cols-1 gap-3 mb-0">
            <mat-form-field>
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" />
              <mat-error appFieldError></mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Desde (kg)</mat-label>
              <input matInput formControlName="weight_from" />
              <mat-error appFieldError></mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Hasta (kg)</mat-label>
              <input matInput formControlName="weight_to" />
              <mat-error appFieldError></mat-error>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Precio (S/)</mat-label>
              <input matInput formControlName="price" />
              <mat-error appFieldError></mat-error>
            </mat-form-field>

            <div class="form-group">
              <label>¿Es estándar?</label>
              <mat-checkbox formControlName="isStandard">Sí</mat-checkbox>
            </div>
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
  userService = inject(DistrictService);
  getDistritcs: any;
  dataSource: any;

  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogRef = this.data.dialog;
    this.action = data.obj.action;
    this.getDistritcs = data.getDistritcs;
    this.dataSource = data.dataSource;

    if (data.obj.action === 'update') {
      this.myForm = this.fb.group({
        id: [data.obj.id, []],
        name: [data.obj.name, [Validators.required]],
        weight_from: [data.obj.weight_from, [Validators.required]],
        weight_to: [data.obj.weight_to, [Validators.required]],
        price: [data.obj.price, [Validators.required]],
        isStandard: [data.obj.isStandard, []],
      });
    } else {
      this.myForm = this.fb.group({
        name: ['', [Validators.required]],
        weight_from: ['', [Validators.required]],
        weight_to: ['', [Validators.required]],
        price: ['', [Validators.required]],
        isStandard: ['', []],
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
            name: form.value.name,
            weight_from: form.value.weight_from,
            weight_to: form.value.weight_to,
            price: form.value.price,
            isStandard: form.value.isStandard,
            token: user.token,
          })
          .subscribe({
            next: (data) => {
              console.log(data);
              const myObservable = of('Data received');
              const subscriptionDelay = timer(1000); // Delay subscription by 3 seconds

              myObservable
                .pipe(delayWhen(() => subscriptionDelay))
                .subscribe((data) => {
                  console.log(data); // Executes after the 3-second delay

                  this.userService.getRows(user).subscribe({
                    next: (data) => {
                      console.log('data', data);
                      this.dataSource.data = data;
                    },
                    error: (e) => {
                      console.log(e);
                    },
                  });
                });
            },
            error: (e) => {
              console.log(e);
            },
          });
      } else {
        this.userService
          .insert({
            name: form.value.name,
            weight_from: form.value.weight_from,
            weight_to: form.value.weight_to,
            price: form.value.price,
            isStandard: form.value.isStandard,
            token: user.token,
          })
          .subscribe({
            next: (data) => {
              console.log(data);
              const myObservable = of('Data received');
              const subscriptionDelay = timer(1000); // Delay subscription by 3 seconds

              myObservable
                .pipe(delayWhen(() => subscriptionDelay))
                .subscribe((data) => {
                  console.log(data); // Executes after the 3-second delay
                  // this.getDistritcs(this.dataSource);

                  this.userService.getRows(user).subscribe({
                    next: (data) => {
                      console.log('data', data);
                      this.dataSource.data = data;
                    },
                    error: (e) => {
                      console.log(e);
                    },
                  });
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
}
