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
import { DialogComponent } from './dialog.component';
import { NgFor } from '@angular/common';

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

        <mat-card-content class="flex gap-3 mt-3">
          <form
            [formGroup]="form_sta_mea"
            (ngSubmit)="onSubmitStandardMeasurement(form_sta_mea)"
            class="@apply flex justify-between  flex-col items-start gap-3"
          >
            <div class="@apply flex justify-between items-center gap-3">
              <mat-form-field>
                <mat-label>Ancho (cm)</mat-label>
                <input matInput formControlName="standard_measurements_width" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Largo (cm)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_length"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Alto (cm)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_height"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Peso real (kg)</mat-label>
                <input
                  matInput
                  formControlName="standard_measurements_weight"
                />
                <mat-error appFieldError></mat-error>
              </mat-form-field>
            </div>

            <button type="submit" class="mb-3 mt-5" mat-flat-button>
              Guardar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header class="@apply mb-[10px]">
          <mat-card-title-group>
            <mat-card-title
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
                <mat-card-header class="@apply mb-[5px]">
                  <mat-card-title>Medidas máximas (cm):</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="@apply flex justify-between items-center gap-3">
                    <mat-form-field>
                      <mat-label>Ancho (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_width"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Largo (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_length"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>

                    <mat-form-field>
                      <mat-label>Alto (cm)</mat-label>
                      <input
                        matInput
                        formControlName="maximum_measurements_height"
                      />
                      <mat-error appFieldError></mat-error>
                    </mat-form-field>

                    <mat-form-field>
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

              <mat-form-field>
                <mat-label>Factor volumétrico</mat-label>
                <input matInput formControlName="volumetric_factor" />
                <mat-error appFieldError></mat-error>
              </mat-form-field>
            </div>

            <app-peso-volumetrico></app-peso-volumetrico>

            <button type="submit" class="mb-3 mt-5" mat-flat-button>
              Guardar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            3. Tarifas por Distrito y Rango de Peso
          </mat-card-title>
          <!-- <mat-card-subtitle></mat-card-subtitle> -->
        </mat-card-header>

        <mat-card-content class="flex gap-3 mt-3">
          <button
            class="mb-3 mt-2"
            mat-button
            (click)="openDialog('Add', {})"
            mat-flat-button
          >
            Nuevo Distrito
          </button>
          <mat-form-field>
            <mat-label>Filter</mat-label>
            <input
              matInput
              (keyup)="applyFilter($event)"
              placeholder="Ex. Mia"
              #input
            />
          </mat-form-field>

          <div class="mat-elevation-z8">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>N°</th>
                <td mat-cell *matCellDef="let row">{{ row.code }}</td>
              </ng-container>

              <!-- Progress Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Nombre
                </th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="rango_peso">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Rango de Peso (kg)
                </th>
                <td mat-cell *matCellDef="let row">
                  {{ row.weight_from }} - {{ row.weight_to }} kg
                </td>
              </ng-container>

              <!-- Name Column -->
              <!-- <ng-container matColumnDef="weight_to">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Precio
                </th>
                <td mat-cell *matCellDef="let row">{{ row.weight_to }}</td>
              </ng-container> -->

              <!-- Name Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Precio (S/)
                </th>
                <td mat-cell *matCellDef="let row">{{ row.price }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="isStandard">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  ¿Estándar?
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-icon>{{ row.isStandard ? 'check' : 'cancel' }}</mat-icon>
                </td>
              </ng-container>

              <!-- Fruit Column -->

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button
                    mat-mini-fab
                    matTooltip="Click to Edit"
                    (click)="openDialog('update', row)"
                  >
                    <mat-icon aria-label="Edit">edit</mat-icon>
                  </button>
                  <button
                    mat-mini-fab
                    matTooltip="Click to Delete"
                    class="iconbutton"
                    color="error"
                  >
                    <mat-icon aria-label="Delete" (click)="remove(row.id)"
                      >delete</mat-icon
                    >
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

              <!-- Row shown when there is no matching data. -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="4">
                  No hay datos que coincidan con el filtro "{{ input.value }}"
                </td>
              </tr>
            </table>

            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 100]"
              aria-label="Select page"
            ></mat-paginator>
          </div>
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

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

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

    this.dataSource = new MatTableDataSource<any>();
    this.getDistritcs(this.dataSource);
    this.table = this.table;
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

  async onSubmitMaximumMeasurement(form: FormGroup) {
    if (form.valid) {
      this.settingService
        .updateSubmitMaximumMeasurement({
          id: form.value.id,
          maximum_measurements_width: form.value.maximum_measurements_width,
          maximum_measurements_length: form.value.maximum_measurements_length,
          maximum_measurements_height: form.value.maximum_measurements_height,
          maximum_measurements_weight: form.value.volumetric_factor,
          volumetric_factor: form.value.volumetric_factor,
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
  async getDistritcs(dataSource: any) {
    this.districtService.getRows().subscribe({
      next: (data) => {
        console.log('data', data);
        dataSource.data = data;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  openDialog(action: any, obj: any) {
    obj.action = action;
    this.dialog.open(DialogComponent, {
      data: {
        dialog: this.dialog,
        obj: obj,
        getDistritcs: this.getDistritcs,
        dataSource: this.dataSource,
      },
    });
  }
  remove(id: string) {
    if (window.confirm('¿Está seguro que desea eliminar este registro?')) {
      this.districtService.remove(id).subscribe({
        next: (data) => {
          console.log('data', data);
          const myObservable = of('Data received');
          const subscriptionDelay = timer(1000); // Delay subscription by 3 seconds
          myObservable
            .pipe(delayWhen(() => subscriptionDelay))
            .subscribe((data) => {
              console.log(data); // Executes after the 3-second delay
              this.getDistritcs(this.dataSource);
            });
        },
        error: (e) => {
          console.log(e);
        },
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async onSubmit(form: FormGroup) {}
}
