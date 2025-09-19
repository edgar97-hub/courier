import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
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
  PromotionalSetItem,
} from '../../models/app-settings.interface';

import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { v4 as uuidv4 } from 'uuid';

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
    MatDividerModule,
    MatSlideToggleModule,
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

  currentTermsUrl: string | null = null;
  selectedTermsFile: File | null = null;

  currentGlobalNoticeImageUrl: string | null = null;
  selectedGlobalNoticeImageFile: File | null = null;
  globalNoticeImagePreviewUrl: string | null = null;

  private destroy$ = new Subject<void>();

  // Getter para acceder fácilmente al FormArray de promotional_sets
  get promotionalSetsFormArray(): FormArray {
    return this.settingsForm.get('promotional_sets') as FormArray;
  }

  ngOnInit(): void {
    this.buildForm(initialAppSettings);
    this.loadCurrentSettings();
  }

  private buildForm(settings: AppSettings): void {
    this.settingsForm = this.fb.group({
      id: [settings.id],
      business_name: [settings.business_name, Validators.required],
      ruc: [settings.ruc, Validators.required],
      address: [settings.address],
      phone_number: [settings.phone_number],
      logo_url: [settings.logo_url],
      terms_conditions_url: [settings.terms_conditions_url],
      global_notice_image_url: [settings.global_notice_image_url],
      googleMapsApiKey: [settings.googleMapsApiKey],

      background_image_url: [settings.background_image_url],
      rates_image_url: [settings.rates_image_url],
      coverage_map_url: [settings.coverage_map_url],
      promotional_sets: this.fb.array(
        settings.promotional_sets?.map((set) =>
          this.createPromotionalSetGroup(set)
        )
      ),
    });
    this.currentLogoUrl = settings.logo_url;
    this.logoPreviewUrl = settings.logo_url;

    this.currentBackgroundImageUrl = settings.background_image_url;
    this.backgroundImagePreviewUrl = settings.background_image_url;

    this.currentRatesImageUrl = settings.rates_image_url;
    this.ratesImagePreviewUrl = settings.rates_image_url;

    this.currentExcelImportTemplateUrl = settings.excel_import_template_url;

    this.currentTermsUrl = settings.terms_conditions_url;

    this.currentGlobalNoticeImageUrl = settings.global_notice_image_url;
    this.globalNoticeImagePreviewUrl = settings.global_notice_image_url;

    // Inicializar previews para imágenes de promotional_sets
    this.promotionalSetsFormArray.controls.forEach((control, index) => {
      const set = settings.promotional_sets[index];
      if (set && control) {
        (control as FormGroup).addControl(
          'imagePreviewUrl',
          this.fb.control(set.imageUrl)
        );
        (control as FormGroup).addControl('imageFile', this.fb.control(null)); // Para el archivo a subir
      }
    });
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
        next: (response: any) => {
          const loadedSettings =
            response && response.length > 0 ? response[0] : initialAppSettings;
          // Limpiar el FormArray antes de poblarlo para evitar duplicados
          // while (this.promotionalSetsFormArray.length !== 0) {
          //   this.promotionalSetsFormArray.removeAt(0);
          // }
          this.promotionalSetsFormArray.clear();
          // Añadir los FormGroups para los sets cargados
          (loadedSettings.promotional_sets || []).forEach(
            (set: PromotionalSetItem) => {
              this.promotionalSetsFormArray.push(
                this.createPromotionalSetGroup(set)
              );
            }
          );
          // Luego, parchear el resto del formulario
          this.settingsForm.patchValue({
            ...loadedSettings,
            promotional_sets: [],
          });

          this.currentLogoUrl = loadedSettings.logo_url;
          this.logoPreviewUrl = loadedSettings.logo_url;
          this.currentBackgroundImageUrl = loadedSettings.background_image_url;
          this.backgroundImagePreviewUrl = loadedSettings.background_image_url;
          this.currentRatesImageUrl = loadedSettings.rates_image_url;
          this.ratesImagePreviewUrl = loadedSettings.rates_image_url;
          this.currentExcelImportTemplateUrl =
            loadedSettings.excel_import_template_url;
          this.currentTermsUrl = loadedSettings.terms_conditions_url;
          this.currentGlobalNoticeImageUrl =
            loadedSettings.global_notice_image_url;
          this.globalNoticeImagePreviewUrl =
            loadedSettings.global_notice_image_url;
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

  hasPendingFileUploads(): boolean {
    if (
      this.selectedLogoFile ||
      this.selectedBackgroundImageFile ||
      this.selectedTermsFile ||
      this.selectedGlobalNoticeImageFile ||
      this.selectedExcelImportTemplateFile
    ) {
      return true;
    }
    for (const control of this.promotionalSetsFormArray.controls) {
      if ((control as FormGroup).get('imageFile')?.value) {
        return true;
      }
    }
    return false;
  }

  private createPromotionalSetGroup(
    set: PromotionalSetItem | null = null
  ): FormGroup {
    const newId = set?.id || uuidv4(); // Genera un nuevo ID si no existe
    return this.fb.group({
      id: [newId, Validators.required], // ID es importante para el trackBy y manejo
      imageUrl: [set?.imageUrl || null], // URL de la imagen (se actualizará después de subir)
      linkUrl: [set?.linkUrl || null, [Validators.pattern('https?://.+')]], // Validación básica de URL
      buttonText: [set?.buttonText || null, [Validators.maxLength(30)]],
      isActive: [set?.isActive === undefined ? true : set.isActive], // Por defecto activo
      order: [set?.order || 0],
      // Estos son solo para el frontend, no se envían directamente al backend así
      imageFile: [null],
      imagePreviewUrl: [set?.imageUrl || null],
    });
  }

  // Añadir un nuevo conjunto promocional (hasta 3)
  addPromotionalSet(): void {
    if (this.promotionalSetsFormArray.length < 3) {
      const newSetGroup = this.createPromotionalSetGroup();
      this.promotionalSetsFormArray.push(newSetGroup);
      this.settingsForm.markAsDirty();
    } else {
      this.snackBar.open(
        'Se permite un máximo de 3 conjuntos promocionales.',
        'OK',
        { duration: 3000, verticalPosition: 'top' }
      );
    }
  }

  // Eliminar un conjunto promocional
  removePromotionalSet(index: number): void {
    this.promotionalSetsFormArray.removeAt(index);
    this.settingsForm.markAsDirty();
  }

  // Manejar selección de archivo para imagen de un conjunto promocional
  onPromotionalSetFileSelected(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    const setGroup = this.promotionalSetsFormArray.at(index) as FormGroup;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      setGroup.patchValue({ imageFile: file });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setGroup.patchValue({ imagePreviewUrl: e.target.result });
      };
      reader.readAsDataURL(file);
      this.settingsForm.markAsDirty();
    } else {
      // Si se cancela la selección, podrías revertir al imageUrl original o limpiar
      setGroup.patchValue({
        imageFile: null,
        imagePreviewUrl: setGroup.get('imageUrl')?.value || null,
      });
    }
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

  onLogoFileSelected6(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedGlobalNoticeImageFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.globalNoticeImagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedGlobalNoticeImageFile);
      this.settingsForm.get('global_notice_image_url')?.markAsDirty();
    } else {
      this.selectedGlobalNoticeImageFile = null;
      this.globalNoticeImagePreviewUrl = this.currentGlobalNoticeImageUrl;
    }
  }

  removeGlobalNoticeImage(): void {
    this.selectedGlobalNoticeImageFile = null;
    this.globalNoticeImagePreviewUrl = 'assets/images/placeholder-image.png'; // Or a default placeholder
    this.settingsForm.get('global_notice_image_url')?.setValue(null); // Clear the form control value
    this.settingsForm.get('global_notice_image_url')?.markAsDirty(); // Mark as dirty to ensure save
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
    console.log(formValues);

    // Subir imágenes de los promotional_sets una por una
    const promotionalSetsData: PromotionalSetItem[] = [];
    for (let i = 0; i < this.promotionalSetsFormArray.length; i++) {
      const setGroup = this.promotionalSetsFormArray.at(i) as FormGroup;
      const setData = { ...setGroup.value }; // Copia los valores del form group

      if (setData.imageFile) {
        // Si se seleccionó un nuevo archivo de imagen para este set
        try {
          const uploadResponse = await this.settingsService
            .uploadFile(setData.imageFile) // Asume que uploadFile devuelve { file_url: string }
            .pipe(first(), takeUntil(this.destroy$))
            .toPromise();
          setData.imageUrl = uploadResponse?.file_url || setData.imageUrl; // Actualiza con la nueva URL o mantiene la anterior si falla
        } catch (error) {
          console.error(
            `Error uploading promotional set image ${i + 1}:`,
            error
          );
          this.snackBar.open(
            `Error al cargar imagen del conjunto ${i + 1}.`,
            'OK',
            {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
          // Considera si quieres detener el guardado o continuar sin esta imagen
        }
      }
      // Eliminar las propiedades temporales del frontend antes de enviar al backend
      delete setData.imageFile;
      delete setData.imagePreviewUrl;
      promotionalSetsData.push(setData as PromotionalSetItem);
    }
    formValues.promotional_sets = promotionalSetsData;

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

    if (this.selectedGlobalNoticeImageFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedGlobalNoticeImageFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          formValues.global_notice_image_url = uploadResponse.file_url;
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
    } else {
      formValues.global_notice_image_url = '';
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
          this.buildForm(savedSettings); // Reconstruye el form con los datos guardados (incluye promotional_sets)
          this.settingsForm.markAsPristine();
          this.selectedLogoFile = null;
          this.selectedBackgroundImageFile = null;
          this.selectedRatesImageFile = null;
          this.selectedExcelImportTemplateFile = null;
          this.selectedTermsFile = null;
          this.selectedGlobalNoticeImageFile = null;
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
    // this.selectedLogoFile = null;
    // this.selectedTermsFile = null;
    // this.settingsForm.markAsPristine();
    this.snackBar.open('Cambios descartados.', 'OK', {
      duration: 2000,
      verticalPosition: 'top',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
