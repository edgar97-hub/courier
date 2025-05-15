import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../../shared/services/user.service';
import { patchState } from '@ngrx/signals';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  Validators,
  NonNullableFormBuilder,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../shared/services/auth.service';
import { MatTable } from '@angular/material/table';
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { SettingService } from '../../shared/services/setting.service';

export interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-table',
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInput,
    MatSortModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title> Configuración </mat-card-title>
        <mat-card-subtitle></mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="flex gap-3 mt-3">
        <form
          [formGroup]="myForm"
          class="flex mb-10"
          (ngSubmit)="onSubmit(myForm)"
        >
          <div
            class="max-w-3xl p-2 rounded-lg mat-elevation-z3 mb-6 bg-surface-container"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">
              <mat-form-field>
                <mat-label>Nombre de la empresa</mat-label>
                <input matInput formControlName="business_name" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Dirección</mat-label>
                <input matInput formControlName="address" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Número de teléfono</mat-label>
                <input matInput formControlName="phone_number" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>logo</mat-label>
                <input matInput formControlName="logo_url" />
              </mat-form-field>
            </div>

            <button type="submit" class="mb-3 mt-5" mat-flat-button>
              Guardar
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
})
export default class TableComponent {
  userService = inject(SettingService);
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      id: ['', []],
      business_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone_number: ['', []],
      logo_url: ['', []],
    });
    this.getUsers();
  }

  async getUsers() {
    const local = localStorage.getItem('user');
    const user = local ? JSON.parse(local) : null;
    if (!user) {
      return;
    }

    this.userService.getUsers(user).subscribe({
      next: (data) => {
        console.log('data', data);
        this.myForm = this.fb.group({
          id: [data[0].id, []],
          business_name: [data[0].business_name, [Validators.required]],
          address: [data[0].address, [Validators.required]],
          phone_number: [data[0].phone_number, []],
          logo_url: [data[0].logo_url, []],
        });
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  remove(id: string) {}

  async onSubmit(form: FormGroup) {
    console.log('Valid?', form.valid);
    if (form.valid) {
      const local = localStorage.getItem('user');
      const user = local ? JSON.parse(local) : null;
      console.log('user', user);

      if (!user) {
        return;
      }

      this.userService
        .update({
          id: form.value.id,
          business_name: form.value.business_name,
          address: form.value.address,
          phone_number: form.value.phone_number,
          logo_url: form.value.logo_url,
          token: user.token,
        })
        .subscribe({
          next: (data) => {
            console.log(data);
            const myObservable = of('Data received');
            const subscriptionDelay = timer(1000);
            myObservable
              .pipe(delayWhen(() => subscriptionDelay))
              .subscribe((data) => {
                console.log(data);
                window.location.reload();
              });
          },
          error: (e) => {
            console.log(e);
          },
        });
    }
  }
}
