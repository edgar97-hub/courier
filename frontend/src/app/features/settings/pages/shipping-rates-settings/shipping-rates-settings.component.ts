import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../services/settings.service';
import { AppSettings } from '../../models/app-settings.interface';
import { FieldErrorDirective } from '../../../../shared/directives/field-error.directive';

@Component({
  selector: 'app-shipping-rates-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FieldErrorDirective,
  ],
  templateUrl: './shipping-rates-settings.component.html',
  styleUrls: ['./shipping-rates-settings.component.scss'],
})
export class ShippingRatesSettingsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  standardForm!: FormGroup;
  maximumForm!: FormGroup;

  isLoading = true;
  isSavingStandard = false;
  isSavingMaximum = false;

  private currentSettings: AppSettings | null = null;

  ngOnInit(): void {
    this.buildForms();
    this.loadSettings();
  }

  private buildForms(): void {
    this.standardForm = this.fb.group({
      standard_measurements_width: [null, [Validators.required, Validators.min(0)]],
      standard_measurements_length: [null, [Validators.required, Validators.min(0)]],
      standard_measurements_height: [null, [Validators.required, Validators.min(0)]],
      standard_measurements_weight: [null, [Validators.required, Validators.min(0)]],
    });

    this.maximumForm = this.fb.group({
      maximum_measurements_width: [null, [Validators.required, Validators.min(0)]],
      maximum_measurements_length: [null, [Validators.required, Validators.min(0)]],
      maximum_measurements_height: [null, [Validators.required, Validators.min(0)]],
      maximum_measurements_weight: [null, [Validators.required, Validators.min(0)]],
      volumetric_factor: [null, [Validators.required, Validators.min(0)]],
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    this.settingsService
      .loadSettings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response: any) => {
          const settings: AppSettings | null = Array.isArray(response) && response.length ? response[0] : null;
          if (!settings) {
            return;
          }
          this.currentSettings = settings;
          this.standardForm.patchValue(settings);
          this.maximumForm.patchValue(settings);
        },
        error: () => {
          this.snackBar.open(
            'No se pudieron cargar las tarifas de envío. Inténtalo de nuevo.',
            'OK',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }

  onSubmitStandard(): void {
    if (!this.validate(this.standardForm)) {
      return;
    }
    this.isSavingStandard = true;
    this.save(this.standardForm, () => (this.isSavingStandard = false));
  }

  onSubmitMaximum(): void {
    if (!this.validate(this.maximumForm)) {
      return;
    }
    this.isSavingMaximum = true;
    this.save(this.maximumForm, () => (this.isSavingMaximum = false));
  }

  private validate(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    }
    form.markAllAsTouched();
    this.snackBar.open('Por favor corrige los campos marcados.', 'OK', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
    return false;
  }

  private save(form: FormGroup, resetLoading: () => void): void {
    const payload = this.buildPayload(form);
    this.settingsService
      .saveSettings(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(resetLoading),
      )
      .subscribe({
        next: (saved) => {
          this.currentSettings = saved;
          this.snackBar.open('Tarifas guardadas exitosamente.', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: () => {
          this.snackBar.open(
            'No se pudieron guardar las tarifas. Inténtalo de nuevo.',
            'OK',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }

  private buildPayload(form: FormGroup): AppSettings {
    const payload: AppSettings = {
      ...(this.currentSettings ?? ({} as AppSettings)),
    };
    const values = form.getRawValue();
    for (const key of Object.keys(values)) {
      const raw = values[key];
      const normalized =
        raw === '' || raw === null || raw === undefined ? null : Number(raw);
      Object.assign(payload, { [key]: normalized });
    }
    return payload;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
