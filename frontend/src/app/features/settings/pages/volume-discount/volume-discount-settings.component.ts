import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsService } from '../../services/settings.service';
import {
  AppSettings,
  VolumeDiscountRule,
} from '../../models/app-settings.interface';
import { v4 as uuidv4 } from 'uuid';
import { AutoSelectDirective } from '../../../../shared/directives/auto-select.directive';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-volume-discount-settings',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    AutoSelectDirective,
  ],
  templateUrl: './volume-discount-settings.component.html',
  styleUrls: ['./volume-discount-settings.component.scss'],
})
export class VolumeDiscountSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);

  isLoading = signal(false);
  isSaving = signal(false);
  currentSettings: AppSettings | null = null;

  displayedColumns: string[] = [
    'range',
    'discount',
    'validity',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<VolumeDiscountRule>([]);

  newRuleForm: FormGroup;

  constructor() {
    this.newRuleForm = this.fb.group({
      minOrders: [10, [Validators.required, Validators.min(1)]],
      maxOrders: [19, [Validators.required, Validators.min(1)]],
      discountPercentage: [
        5,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      startDate: [new Date(), [Validators.required]],
      endDate: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading.set(true);
    this.settingsService.loadSettings().subscribe({
      next: (settings: any) => {
        this.currentSettings =
          settings && settings.length > 0 ? settings[0] : this.currentSettings;

        if (this.currentSettings) {
          const rules = this.currentSettings.volumeDiscountRules || [];
          this.dataSource.data = rules;
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al cargar configuración', 'Cerrar', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }

  addRule() {
    if (this.newRuleForm.invalid) {
      this.newRuleForm.markAllAsTouched();
      this.snackBar.open('Ambas fechas son obligatorias.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const formVal = this.newRuleForm.getRawValue();
    const nStart = this.datePipe.transform(formVal.startDate, 'yyyy-MM-dd')!;
    const nEnd = this.datePipe.transform(formVal.endDate, 'yyyy-MM-dd')!;

    // VALIDACIÓN 1: Cronología de la regla
    if (nEnd <= nStart) {
      this.snackBar.open(
        'La fecha de fin debe ser posterior a la de inicio.',
        'Cerrar',
        { duration: 3000 },
      );
      return;
    }

    // VALIDACIÓN 2: Lógica de Volumen
    if (Number(formVal.maxOrders) <= Number(formVal.minOrders)) {
      this.snackBar.open(
        'El rango "Hasta" debe ser mayor al "Desde".',
        'Cerrar',
        { duration: 3000 },
      );
      return;
    }

    // VALIDACIÓN 3: Cruce con reglas existentes
    if (this.hasOverlap(formVal, this.dataSource.data)) {
      this.snackBar.open(
        '⚠️ Error: Las fechas seleccionadas ya están ocupadas o coinciden con otra regla.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] },
      );
      return;
    }

    // Si pasa todo, agregar a la lista
    const newRule: VolumeDiscountRule = {
      id: uuidv4(),
      minOrders: formVal.minOrders,
      maxOrders: formVal.maxOrders,
      discountPercentage: formVal.discountPercentage,
      startDate: nStart,
      endDate: nEnd,
      isActive: true,
    };

    this.dataSource.data = [...this.dataSource.data, newRule];
    this.newRuleForm.reset({
      minOrders: 10,
      maxOrders: 19,
      discountPercentage: 5,
      startDate: null,
      endDate: null,
    });
  }

  removeRule(index: number) {
    const currentRules = this.dataSource.data;
    currentRules.splice(index, 1);
    this.dataSource.data = [...currentRules];
  }

  saveChanges() {
    if (!this.currentSettings) return;

    this.isSaving.set(true);

    // Actualizamos el objeto settings con las nuevas reglas
    const settingsToSave: AppSettings = {
      ...this.currentSettings,
      volumeDiscountRules: this.dataSource.data,
    };

    this.settingsService.saveSettings(settingsToSave).subscribe({
      next: (saved) => {
        this.snackBar.open('Reglas guardadas correctamente', 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.currentSettings = saved;
        this.dataSource.data = saved.volumeDiscountRules || [];
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al guardar cambios', 'Cerrar', {
          duration: 3000,
        });
        this.isSaving.set(false);
      },
    });
  }

  // Helper para mostrar estado en la tabla
  getRuleStatus(rule: VolumeDiscountRule): { label: string; class: string } {
    const now = new Date();
    const start = rule.startDate ? new Date(rule.startDate) : null;
    const end = rule.endDate ? new Date(rule.endDate) : null;

    if (start && now < start)
      return { label: 'PROGRAMADO', class: 'badge-warning' };
    if (end && now > end) return { label: 'VENCIDO', class: 'badge-error' };

    return { label: 'ACTIVO', class: 'badge-success' };
  }

  private hasOverlap(
    newRule: any,
    existingRules: VolumeDiscountRule[],
  ): boolean {
    // Convertimos las fechas del formulario a strings YYYY-MM-DD
    const nStart = this.datePipe.transform(newRule.startDate, 'yyyy-MM-dd')!;
    const nEnd = this.datePipe.transform(newRule.endDate, 'yyyy-MM-dd')!;

    return existingRules.some((ex) => {
      const exStart = ex.startDate!;
      const exEnd = ex.endDate!;

      // 1. Validar si las fechas son exactamente iguales
      const isSameStart = nStart === exStart;
      const isSameEnd = nEnd === exEnd;

      // 2. Validar solapamiento de rangos (Algoritmo estándar)
      // Se cruzan si: (Inicio_A <= Fin_B) Y (Fin_A >= Inicio_B)
      const isOverlapping = nStart <= exEnd && nEnd >= exStart;

      return isSameStart || isSameEnd || isOverlapping;
    });
  }
}
