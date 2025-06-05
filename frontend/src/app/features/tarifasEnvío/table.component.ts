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
import { MatTable } from '@angular/material/table';
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { SettingService } from './setting.service';
import { FieldErrorDirective } from '../../shared/directives/field-error.directive';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PesoVolumetricoComponent } from './peso-volumetrico.component';
import { DistrictService } from './district.service';

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
    FieldErrorDirective,
    MatListModule,
    MatDividerModule,
    PesoVolumetricoComponent,
  ],
  template: `
    <div class="@apply flex   flex-col  gap-3">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> 1. Configuración de medida Estándar </mat-card-title>
          <!-- <mat-card-subtitle></mat-card-subtitle> -->
        </mat-card-header>

        <mat-card-content class="flex gap-3 " style="padding:25px">
          <form
            [formGroup]="form_sta_mea"
            (ngSubmit)="onSubmitStandardMeasurement(form_sta_mea)"
            class="@apply flex justify-between  flex-col items-start gap-3"
          >
            <div class="@apply flex justify-between items-center gap-3">
              <mat-form-field appearance="outline">
                <mat-label>Ancho (cm)</mat-label>
                <input matInput formControlName="standard_measurements_width" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Largo (cm)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_length"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Alto (cm)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_height"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Peso real (kg)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_weight"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>
            </div>

            <button
              type="submit"
              class="mb-3 mt-5 btn-corp-primary"
              mat-flat-button
              [disabled]="isLoading"
            >
              {{ isLoading ? 'Guardando...' : 'Guardar' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header class="@apply mb-[10px]">
          <mat-card-title-group>
            <mat-card-title style="margin:5px;margin-bottom:20px"
              >2. Configuración de cálculo para medida
              personalizada</mat-card-title
            >
          </mat-card-title-group>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="form_max_mea"
            (ngSubmit)="onSubmitMaximumMeasurement(form_max_mea)"
            class="@apply flex justify-between  flex-col items-start gap-3"
          >
            <div
              class="@apply flex justify-between items-center gap-3 flex-wrap"
            >
              <mat-card appearance="outlined">
                <mat-card-header
                  class="@apply mb-[5px] "
                  style="margin-left: 20px;"
                >
                  <mat-card-title>Medidas máximas (cm):</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div
                    class="@apply flex justify-between items-center gap-3"
                    style="padding:20px;"
                  >
                    <mat-form-field appearance="outline">
                      <mat-label>Ancho (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_width"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Largo (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_length"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Alto (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_height"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Peso máximo permitido (kg)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_weight"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-form-field appearance="outline" style="margin-top: 20px;">
                <mat-label>Factor volumétrico</mat-label>
                <input matInput formControlName="volumetric_factor" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>
            </div>

            <app-peso-volumetrico></app-peso-volumetrico>

            <button
              type="submit"
              class="mb-3 mt-5 btn-corp-primary"
              style="margin-top: 10px;"
              mat-flat-button
              [disabled]="isLoading2"
            >
              {{ isLoading2 ? 'Guardando...' : 'Guardar' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: ``,
})
export default class TableComponent {
  userService = inject(SettingService);
  myForm: FormGroup;
  displayedColumns: string[] = [
    'id',
    'name',
    'rango_peso',
    'price',
    'isStandard',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  isLoading = false;
  isLoading2 = false;

  districtService = inject(DistrictService);
  settingService = inject(SettingService);
  dialog = inject(MatDialog);

  form_sta_mea: FormGroup;
  form_max_mea: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      id: ['', []],
      business_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone_number: ['', []],
      logo_url: ['', []],
    });

    this.form_sta_mea = this.fb.group({
      id: ['', []],
      standard_measurements_width: ['', [Validators.required]],
      standard_measurements_length: ['', [Validators.required]],
      standard_measurements_height: ['', [Validators.required]],
      standard_measurements_weight: ['', [Validators.required]],
    });

    this.form_max_mea = this.fb.group({
      id: ['', []],
      maximum_measurements_width: ['', [Validators.required]],
      maximum_measurements_length: ['', [Validators.required]],
      maximum_measurements_height: ['', [Validators.required]],
      maximum_measurements_weight: ['', [Validators.required]],
      volumetric_factor: ['', [Validators.required]],
    });
    this.getSetting();
  }

  async getSetting() {
    this.settingService.getRows().subscribe({
      next: (data) => {
        // console.log('data', data);
        this.form_sta_mea = this.fb.group({
          id: [data[0].id, []],

          standard_measurements_width: [
            data[0].standard_measurements_width,
            [Validators.required],
          ],
          standard_measurements_length: [
            data[0].standard_measurements_length,
            [Validators.required],
          ],
          standard_measurements_height: [
            data[0].standard_measurements_height,
            [],
          ],
          standard_measurements_weight: [
            data[0].standard_measurements_weight,
            [],
          ],
        });

        this.form_max_mea = this.fb.group({
          id: [data[0].id, []],
          maximum_measurements_width: [
            data[0].maximum_measurements_width,
            [Validators.required],
          ],
          maximum_measurements_length: [
            data[0].maximum_measurements_length,
            [],
          ],
          maximum_measurements_height: [
            data[0].maximum_measurements_height,
            [Validators.required],
          ],

          maximum_measurements_weight: [
            data[0].maximum_measurements_weight,
            [],
          ],
          volumetric_factor: [data[0].volumetric_factor, []],
        });
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  async onSubmitStandardMeasurement(form: FormGroup) {
    if (form.valid) {
      this.isLoading = true;

      this.settingService
        .updateSubmitStandardMeasurement({
          id: form.value.id,
          standard_measurements_width: form.value.standard_measurements_width,
          standard_measurements_length: form.value.standard_measurements_length,
          standard_measurements_height: form.value.standard_measurements_height,
          standard_measurements_weight: form.value.standard_measurements_weight,
        })
        .subscribe({
          next: (data) => {
            console.log(data);
            const myObservable = of('Data received');
            const subscriptionDelay = timer(2000);
            myObservable
              .pipe(delayWhen(() => subscriptionDelay))
              .subscribe((data) => {
                console.log(data);
                this.isLoading = false;
                window.location.reload();
              });
          },
          error: (e) => {
            this.isLoading = false;
            console.log(e);
          },
        });
    }
  }

  async onSubmitMaximumMeasurement(form: FormGroup) {
    if (form.valid) {
      this.isLoading2 = true;

      this.settingService
        .updateSubmitMaximumMeasurement({
          id: form.value.id,
          maximum_measurements_width: form.value.maximum_measurements_width,
          maximum_measurements_length: form.value.maximum_measurements_length,
          maximum_measurements_height: form.value.maximum_measurements_height,
          maximum_measurements_weight: form.value.maximum_measurements_weight,
          volumetric_factor: form.value.volumetric_factor,
        })
        .subscribe({
          next: (data) => {
            console.log(data);
            const myObservable = of('Data received');
            const subscriptionDelay = timer(1500);
            myObservable
              .pipe(delayWhen(() => subscriptionDelay))
              .subscribe((data) => {
                console.log(data);
                this.isLoading2 = false;
                window.location.reload();
              });
          },
          error: (e) => {
            console.log(e);
            this.isLoading2 = false;
          },
        });
    }
  }
}
