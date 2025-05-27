import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { takeUntil, tap, filter, finalize, first } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { SettingsService } from '../../services/settings.service';
import {
  AppSettings,
  initialAppSettings,
} from '../../models/app-settings.interface';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  settingsForm!: FormGroup;
  isLoadingInitialData = true;
  isSaving = false;

  // Para el logo
  currentLogoUrl: string | null = null;
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;

  currentBackgroundImageUrl: string | null = null;
  selectedBackgroundImageFile: File | null = null;
  backgroundImagePreviewUrl: string | null = null;

  currentRatesImageUrl: string | null = null;
  selectedRatesImageFile: File | null = null;
  ratesImagePreviewUrl: string | null = null;

  currentExcelImportTemplateUrl: string | null = null;
  selectedExcelImportTemplateFile: File | null = null;

  // --- NUEVO PARA TÉRMINOS Y CONDICIONES PDF ---
  currentTermsUrl: string | null = null;
  selectedTermsFile: File | null = null;
  // No necesitamos una preview visual para el PDF, solo el nombre del archivo.

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.buildForm(initialAppSettings);
    this.loadCurrentSettings();
  }

  private buildForm(settings: AppSettings): void {
    this.settingsForm = this.fb.group({
      id: [settings.id],
      business_name: [settings.business_name, Validators.required],
      address: [settings.address],
      phone_number: [settings.phone_number],
      logo_url: [settings.logo_url],
      terms_conditions_url: [settings.terms_conditions_url],

      background_image_url: [settings.background_image_url],
      rates_image_url: [settings.rates_image_url],
      coverage_map_url: [settings.coverage_map_url],
    });
    this.currentLogoUrl = settings.logo_url;
    this.logoPreviewUrl = settings.logo_url;

    this.currentBackgroundImageUrl = settings.background_image_url;
    this.backgroundImagePreviewUrl = settings.background_image_url;

    this.currentRatesImageUrl = settings.rates_image_url;
    this.ratesImagePreviewUrl = settings.rates_image_url;

    this.currentExcelImportTemplateUrl = settings.excel_import_template_url;

    this.currentTermsUrl = settings.terms_conditions_url;
  }

  private loadCurrentSettings(): void {
    this.isLoadingInitialData = true;
    this.settingsService
      .loadSettings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingInitialData = false))
      )
      .subscribe({
        next: (loadedSettings: any) => {
          if (loadedSettings.length) {
            this.settingsForm.patchValue({
              ...loadedSettings,
              id: loadedSettings[0].id,
              business_name: loadedSettings[0].business_name,
              address: loadedSettings[0].address,
              phone_number: loadedSettings[0].phone_number,

              logo_url: loadedSettings[0].logo_url,
              terms_conditions_url: loadedSettings[0].terms_conditions_url,
              background_image_url: loadedSettings[0].background_image_url,
              rates_image_url: loadedSettings[0].rates_image_url,
              coverage_map_url: loadedSettings[0].coverage_map_url,
            });
            this.currentLogoUrl = loadedSettings[0].logo_url;
            this.logoPreviewUrl = loadedSettings[0].logo_url;

            this.currentBackgroundImageUrl =
              loadedSettings[0].background_image_url;
            this.backgroundImagePreviewUrl =
              loadedSettings[0].background_image_url;

            this.currentRatesImageUrl = loadedSettings[0].rates_image_url;
            this.ratesImagePreviewUrl = loadedSettings[0].rates_image_url;

            this.currentExcelImportTemplateUrl =
              loadedSettings[0].excel_import_template_url;

            this.currentTermsUrl = loadedSettings[0].terms_conditions_url;
          }
        },
        error: (err) => {
          this.snackBar.open(
            'No se pudo cargar la configuración actual. Inténtalo de nuevo.',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
            }
          );
        },
      });
  }

  onLogoFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedLogoFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedLogoFile);
      this.settingsForm.get('logo_url')?.markAsDirty();
    } else {
      this.selectedLogoFile = null;
      this.logoPreviewUrl = this.currentLogoUrl;
    }
  }

  onLogoFileSelected3(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedBackgroundImageFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.backgroundImagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedBackgroundImageFile);
      this.settingsForm.get('background_image_url')?.markAsDirty();
    } else {
      this.selectedBackgroundImageFile = null;
      this.backgroundImagePreviewUrl = this.currentBackgroundImageUrl;
    }
  }

  onLogoFileSelected4(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedRatesImageFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.ratesImagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedRatesImageFile);
      this.settingsForm.get('rates_image_url')?.markAsDirty();
    } else {
      this.selectedRatesImageFile = null;
      this.ratesImagePreviewUrl = this.currentRatesImageUrl;
    }
  }

  onLogoFileSelected5(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedExcelImportTemplateFile = fileList[0];
      this.settingsForm.get('terms_conditions_url')?.markAsDirty(); // Indicar cambio
    } else {
      this.selectedExcelImportTemplateFile = null;
    }
  }

  onTermsFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedTermsFile = fileList[0];
      this.settingsForm.get('terms_conditions_url')?.markAsDirty(); // Indicar cambio
      console.log('Terms PDF selected:', this.selectedTermsFile.name);
    } else {
      this.selectedTermsFile = null;
    }
  }

  async onSaveSettings(): Promise<void> {
    if (this.settingsForm.invalid) {
      this.snackBar.open(
        'Por favor corrija cualquier error en el formulario.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    let formValues = { ...this.settingsForm.value } as AppSettings;
    if (this.selectedLogoFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedLogoFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          formValues.logo_url = uploadResponse.file_url;
        } else {
          throw new Error('Logo URL not returned from upload.');
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        this.snackBar.open(
          'Error al cargar el logotipo. No se guardaron los ajustes.',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          }
        );
        this.isSaving = false;
        return;
      }
    }

    if (this.selectedBackgroundImageFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedBackgroundImageFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          formValues.background_image_url = uploadResponse.file_url;
        } else {
          throw new Error('Logo URL not returned from upload.');
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        this.snackBar.open(
          'Error al cargar el logotipo. No se guardaron los ajustes.',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          }
        );
        this.isSaving = false;
        return;
      }
    }

    if (this.selectedRatesImageFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedRatesImageFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          formValues.rates_image_url = uploadResponse.file_url;
        } else {
          throw new Error('Logo URL not returned from upload.');
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        this.snackBar.open(
          'Error al cargar el logotipo. No se guardaron los ajustes.',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          }
        );
        this.isSaving = false;
        return;
      }
    }

    if (this.selectedExcelImportTemplateFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedExcelImportTemplateFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          formValues.excel_import_template_url = uploadResponse.file_url;
        } else {
          throw new Error('Logo URL not returned from upload.');
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        this.snackBar.open(
          'Error al cargar el logotipo. No se guardaron los ajustes.',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          }
        );
        this.isSaving = false;
        return;
      }
    }

    if (this.selectedTermsFile) {
      try {
        const uploadTermsResponse = await this.settingsService
          .uploadFile(this.selectedTermsFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadTermsResponse?.file_url) {
          formValues.terms_conditions_url = uploadTermsResponse.file_url;
        } else {
          throw new Error(
            'Terms & Conditions URL not returned from PDF upload.'
          );
        }
      } catch (error) {
        console.error('Terms PDF upload failed:', error);
        this.snackBar.open(
          'Terms & Conditions PDF upload failed. Settings not saved.',
          'Close',
          {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          }
        );
        this.isSaving = false;
        return;
      }
    }
    this.settingsService
      .saveSettings(formValues)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: (savedSettings) => {
          this.snackBar.open('¡Configuración guardada exitosamente!', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.settingsForm.patchValue(savedSettings);
          this.settingsForm.markAsPristine();
          this.currentLogoUrl = savedSettings.logo_url;
          this.logoPreviewUrl = savedSettings.logo_url;
          this.selectedLogoFile = null;

          this.currentBackgroundImageUrl = savedSettings.background_image_url;
          this.backgroundImagePreviewUrl = savedSettings.background_image_url;
          this.selectedBackgroundImageFile = null;

          this.currentRatesImageUrl = savedSettings.rates_image_url;
          this.ratesImagePreviewUrl = savedSettings.rates_image_url;
          this.selectedRatesImageFile = null;

          this.currentExcelImportTemplateUrl =
            savedSettings.excel_import_template_url;
          this.selectedExcelImportTemplateFile = null;

          this.currentTermsUrl = savedSettings.terms_conditions_url;
          this.selectedTermsFile = null;
        },
        error: (err) => {
          this.snackBar.open(
            'No se pudo guardar la configuración. Inténtalo de nuevo.',
            'Retry',
            {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
  }

  onDiscardChanges(): void {
    this.loadCurrentSettings();
    this.selectedLogoFile = null;
    this.selectedTermsFile = null;
    this.settingsForm.markAsPristine();
    this.snackBar.open('Changes discarded.', 'OK', {
      duration: 2000,
      verticalPosition: 'top',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
