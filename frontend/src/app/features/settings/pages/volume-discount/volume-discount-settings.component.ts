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
  DiscountRuleType,
  VolumeDiscountRule,
} from '../../models/app-settings.interface';
import { v4 as uuidv4 } from 'uuid';
import { AutoSelectDirective } from '../../../../shared/directives/auto-select.directive';
import { DatePipe } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';

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
    MatRadioModule,
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
    const date1 = new Date();
    const date2 = new Date();
    date2.setDate(date2.getDate() + 1);
    this.newRuleForm = this.fb.group({
      type: [DiscountRuleType.RANGE, Validators.required],
      minOrders: [10, [Validators.required, Validators.min(1)]],
      maxOrders: [19, [Validators.required, Validators.min(1)]],
      discountPercentage: [
        5,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      startDate: [date1, [Validators.required]],
      endDate: [date2, [Validators.required]],
    });

    this.newRuleForm.get('type')?.valueChanges.subscribe((type) => {
      const maxOrdersCtrl = this.newRuleForm.get('maxOrders');
      if (type === DiscountRuleType.GOAL) {
        maxOrdersCtrl?.clearValidators();
        maxOrdersCtrl?.setValue(null);
      } else {
        maxOrdersCtrl?.setValidators([Validators.required, Validators.min(1)]);
      }
      maxOrdersCtrl?.updateValueAndValidity();
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
    if (formVal.type === DiscountRuleType.RANGE) {
      if (Number(formVal.maxOrders) <= Number(formVal.minOrders)) {
        this.snackBar.open(
          'El rango "Hasta" debe ser mayor al "Desde".',
          'Cerrar',
          { duration: 3000 },
        );
        return;
      }
    }

    // VALIDACIÓN 3: Cruce con reglas existentes
    // if (this.hasOverlap(formVal, this.dataSource.data)) {
    //   this.snackBar.open(
    //     `⚠️ Error: Ya existe una regla de tipo ${formVal.type === 'RANGE' ? 'Rango' : 'Meta'} para estas fechas.`,
    //     'Cerrar',
    //     { duration: 5000, panelClass: ['error-snackbar'] },
    //   );
    //   return;
    // }

    // Si pasa todo, agregar a la lista
    const newRule: VolumeDiscountRule = {
      id: uuidv4(),
      type: formVal.type,
      minOrders: formVal.minOrders,
      maxOrders:
        formVal.type === DiscountRuleType.RANGE ? formVal.maxOrders : null,
      discountPercentage: formVal.discountPercentage,
      startDate: nStart,
      endDate: nEnd,
      isActive: true,
    };

    this.dataSource.data = [newRule, ...this.dataSource.data];
    this.newRuleForm.reset({
      type: formVal.type,
      minOrders: 1,
      maxOrders: formVal.type === DiscountRuleType.RANGE ? 2 : null,
      discountPercentage: 1,
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
    // 1. Obtenemos la fecha de hoy en formato string 'YYYY-MM-DD' para anular las horas/minutos
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;

    // 2. Las fechas de la regla ya vienen del backend/formulario como strings 'YYYY-MM-DD'
    const start = rule.startDate;
    const end = rule.endDate;

    // Caso: Todavía no llega la fecha de inicio
    if (start && today < start) {
      return { label: 'PROGRAMADO', class: 'badge-warning' };
    }

    // Caso: Ya pasó la fecha de fin
    if (end && today > end) {
      return { label: 'VENCIDO', class: 'badge-error' };
    }

    // Caso: Estamos dentro del rango (today >= start && today <= end)
    return { label: 'ACTIVO', class: 'badge-success' };
  }
  private hasOverlap(
    newRule: any,
    existingRules: VolumeDiscountRule[],
  ): boolean {
    // Convertimos las fechas del formulario a strings YYYY-MM-DD
    const nStart = this.datePipe.transform(newRule.startDate, 'yyyy-MM-dd')!;
    const nEnd = this.datePipe.transform(newRule.endDate, 'yyyy-MM-dd')!;
    const nType = newRule.type;

    return existingRules.some((ex) => {
      if (nType !== ex.type) {
        return false;
      }

      const exStart = ex.startDate!;
      const exEnd = ex.endDate!;

      const isSameStart = nStart === exStart;
      const isSameEnd = nEnd === exEnd;

      const isOverlapping = nStart <= exEnd && nEnd >= exStart;

      return isSameStart || isSameEnd || isOverlapping;
    });
  }
}
