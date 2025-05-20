// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// // Importa solo los módulos de Material que realmente necesitas
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatCardModule } from '@angular/material/card'; // Para enmarcar el formulario
// import { Subject } from 'rxjs';
// import { takeUntil, tap, filter, finalize, first } from 'rxjs/operators';

// import { SettingsService } from '../../services/settings.service';
// import {
//   AppSettings,
//   initialAppSettings,
// } from '../../models/app-settings.interface';

// @Component({
//   selector: 'app-settings-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule,
//   ],
//   templateUrl: './settings-page.component.html',
//   styleUrls: ['./settings-page.component.scss'],
// })
// export class SettingsPageComponent implements OnInit, OnDestroy {
//   private fb = inject(FormBuilder);
//   private settingsService = inject(SettingsService);
//   private snackBar = inject(MatSnackBar);

//   settingsForm!: FormGroup;
//   isLoadingInitialData = true;
//   isSaving = false;
//   currentLogoUrl: string | null = null;
//   selectedLogoFile: File | null = null;
//   logoPreviewUrl: string | null = null; // Para la previsualización del nuevo logo

//   private destroy$ = new Subject<void>();

//   ngOnInit(): void {
//     this.buildForm(initialAppSettings); // Construir el form con valores iniciales
//     this.loadCurrentSettings();
//   }

//   private buildForm(settings: AppSettings): void {
//     this.settingsForm = this.fb.group({
//       business_name: [settings.business_name, Validators.required],
//       address: [settings.address],
//       phone_number: [settings.phone_number],
//       logo_url: [settings.logo_url], // Este campo del form guardará la URL del logo
//       terms_conditions_url: [
//         settings.terms_conditions_url,
//         [Validators.pattern('https?://.+')],
//       ], // Validación básica de URL
//     });
//     this.currentLogoUrl = settings.logo_url; // Para mostrar el logo actual
//     this.logoPreviewUrl = settings.logo_url; // Inicialmente la preview es el logo actual
//   }

//   private loadCurrentSettings(): void {
//     this.isLoadingInitialData = true;
//     this.settingsService
//       .loadSettings() // Llama para asegurar que los datos se cargan/refrescan
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => (this.isLoadingInitialData = false))
//       )
//       .subscribe({
//         next: (loadedSettings) => {
//           if (loadedSettings) {
//             this.settingsForm.patchValue(loadedSettings);
//             this.currentLogoUrl = loadedSettings.logo_url;
//             this.logoPreviewUrl = loadedSettings.logo_url;
//             console.log('Settings loaded and form patched:', loadedSettings);
//           }
//         },
//         error: (err) => {
//           this.snackBar.open(
//             'Failed to load current settings. Please try again.',
//             'Close',
//             {
//               duration: 5000,
//               panelClass: ['error-snackbar'],
//               verticalPosition: 'top',
//             }
//           );
//           console.error('Error loading settings:', err);
//         },
//       });
//   }

//   onFileSelected(event: Event): void {
//     const element = event.target as HTMLInputElement;
//     const fileList: FileList | null = element.files;
//     if (fileList && fileList.length > 0) {
//       this.selectedLogoFile = fileList[0];
//       // Previsualizar nueva imagen
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         this.logoPreviewUrl = e.target.result; // Actualiza la preview con el archivo seleccionado
//       };
//       reader.readAsDataURL(this.selectedLogoFile);
//       this.settingsForm.get('logo_url')?.markAsDirty(); // Indicar que hubo un cambio
//     } else {
//       this.selectedLogoFile = null;
//       // Si no se selecciona archivo, la preview debería volver al logo actual si existe
//       this.logoPreviewUrl = this.currentLogoUrl;
//     }
//   }

//   async onSaveSettings(): Promise<void> {
//     if (this.settingsForm.invalid) {
//       this.snackBar.open('Please correct the errors in the form.', 'Close', {
//         duration: 3000,
//         panelClass: ['error-snackbar'],
//       });
//       this.settingsForm.markAllAsTouched();
//       return;
//     }

//     this.isSaving = true;
//     let formValues = { ...this.settingsForm.value } as AppSettings;

//     // 1. Subir el logo NUEVO si se seleccionó uno
//     if (this.selectedLogoFile) {
//       try {
//         // Usamos first() para convertir el Observable en algo que se pueda usar con await de forma más limpia.
//         // O puedes mantener toPromise() si prefieres esa sintaxis y tu versión de RxJS lo soporta bien.
//         const uploadResponse = await this.settingsService
//           .uploadLogo(this.selectedLogoFile)
//           .pipe(first(), takeUntil(this.destroy$))
//           .toPromise(); // first() y toPromise()
//         if (uploadResponse?.logo_url) {
//           formValues.logo_url = uploadResponse.logo_url;
//         } else {
//           throw new Error('Logo URL not returned from upload.');
//         }
//       } catch (error) {
//         console.error('Logo upload failed:', error);
//         this.snackBar.open('Logo upload failed. Settings not saved.', 'Close', {
//           duration: 4000,
//           panelClass: ['error-snackbar'],
//           verticalPosition: 'top',
//         });
//         this.isSaving = false;
//         return;
//       }
//     }
//     // Si no se seleccionó un nuevo archivo, formValues.logo_url ya tiene la URL actual o null si se borró/no había

//     // 2. Guardar todas las configuraciones (incluyendo la nueva logo_url si se subió)
//     this.settingsService
//       .saveSettings(formValues)
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => (this.isSaving = false))
//       )
//       .subscribe({
//         next: (savedSettings) => {
//           this.snackBar.open('Settings saved successfully!', 'OK', {
//             duration: 3000,
//             verticalPosition: 'top',
//             panelClass: ['success-snackbar'],
//           });
//           this.settingsForm.patchValue(savedSettings); // Actualizar el form con la respuesta (por si el backend modificó algo)
//           this.settingsForm.markAsPristine(); // Marcar como no modificado después de guardar
//           this.currentLogoUrl = savedSettings.logo_url; // Actualizar el logo actual
//           this.logoPreviewUrl = savedSettings.logo_url; // La preview vuelve a ser el logo guardado
//           this.selectedLogoFile = null; // Limpiar el archivo seleccionado
//         },
//         error: (err) => {
//           console.error('Error saving settings:', err);
//           this.snackBar.open(
//             'Failed to save settings. Please try again.',
//             'Retry',
//             {
//               duration: 5000,
//               verticalPosition: 'top',
//               panelClass: ['error-snackbar'],
//             }
//           );
//         },
//       });
//   }

//   onDiscardChanges(): void {
//     // Vuelve a cargar las configuraciones originales del servicio
//     this.loadCurrentSettings();
//     this.selectedLogoFile = null; // Limpiar cualquier archivo seleccionado
//     this.settingsForm.markAsPristine();
//     this.snackBar.open('Changes discarded.', 'OK', {
//       duration: 2000,
//       verticalPosition: 'top',
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

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

import { SettingsService } from '../../services/settings.service';
import {
  AppSettings,
  initialAppSettings,
} from '../../models/app-settings.interface';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    /* ... (igual que antes) ... */ CommonModule,
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
      logo_url: [settings.logo_url], // Almacenará la URL final del logo
      terms_conditions_url: [settings.terms_conditions_url], // Almacenará la URL final del PDF
    });
    this.currentLogoUrl = settings.logo_url;
    this.logoPreviewUrl = settings.logo_url;
    this.currentTermsUrl = settings.terms_conditions_url; // Guardar URL actual de términos
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
            });
            this.currentLogoUrl = loadedSettings[0].logo_url;
            this.logoPreviewUrl = loadedSettings[0].logo_url;
            this.currentTermsUrl = loadedSettings[0].terms_conditions_url;
            console.log('this.settingsForm', this.settingsForm);
          }
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to load current settings. Please try again.',
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
      this.snackBar.open('Please correct the errors in the form.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    let formValues = { ...this.settingsForm.value } as AppSettings;

    if (this.selectedLogoFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadLogo(this.selectedLogoFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.logo_url) {
          formValues.logo_url = uploadResponse.logo_url;
        } else {
          throw new Error('Logo URL not returned from upload.');
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        this.snackBar.open('Logo upload failed. Settings not saved.', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
        });
        this.isSaving = false;
        return;
      }
    }

    if (this.selectedTermsFile) {
      try {
        const uploadTermsResponse = await this.settingsService
          .uploadTermsPdf(this.selectedTermsFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadTermsResponse?.terms_conditions_url) {
          formValues.terms_conditions_url =
            uploadTermsResponse.terms_conditions_url;
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
          this.snackBar.open('Settings saved successfully!', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.settingsForm.patchValue(savedSettings);
          this.settingsForm.markAsPristine();
          this.currentLogoUrl = savedSettings.logo_url;
          this.logoPreviewUrl = savedSettings.logo_url;
          this.selectedLogoFile = null;
          this.currentTermsUrl = savedSettings.terms_conditions_url; // Actualizar URL de términos
          this.selectedTermsFile = null; // Limpiar archivo de términos seleccionado
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to save settings. Please try again.',
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
