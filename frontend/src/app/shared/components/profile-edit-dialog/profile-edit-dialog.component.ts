import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { User } from '../../../features/users/models/user.model';
// import { AppStore } from '../../../../app.store'; // Para obtener el usuario actual
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../features/users/services/user.service';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { first, Subject, takeUntil } from 'rxjs';

export interface ProfileEditDialogData {
  user: User;
}

@Component({
  selector: 'app-profile-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-edit-dialog.component.html',
  styleUrls: ['./profile-edit-dialog.component.scss'],
})
export class ProfileEditDialogComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  hidePassword = true;

  initialPhotoUrl: string | null = null;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  // currentLogoUrl: string | null = null;
  // selectedLogoFile: File | null = null;
  // logoPreviewUrl: string | null = null;

  private fb = inject(FormBuilder);
  private userService = inject(UserService); // Servicio para la llamada API
  private snackBar = inject(MatSnackBar);
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  // private appStore = inject(AppStore); // Para actualizar el usuario en el store

  constructor(
    public dialogRef: MatDialogRef<ProfileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileEditDialogData
  ) {
    this.initialPhotoUrl = data.user.photo_url || null;
    this.imagePreviewUrl = this.initialPhotoUrl;
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [this.data.user.username, Validators.required],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      password: ['', []],
    });
  }

  get nameCtrl() {
    return this.profileForm.get('name');
  }
  get emailCtrl() {
    return this.profileForm.get('email');
  }

  // onLogoFileSelected5(event: Event): void {
  //   const element = event.target as HTMLInputElement;
  //   const fileList: FileList | null = element.files;
  //   if (fileList && fileList.length > 0) {
  //     this.selectedExcelImportTemplateFile = fileList[0];
  //     this.settingsForm.get('terms_conditions_url')?.markAsDirty(); // Indicar cambio
  //   } else {
  //     this.selectedExcelImportTemplateFile = null;
  //   }
  // }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = this.initialPhotoUrl; // Volver a la foto inicial si se deselecciona
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById(
      'profilePhotoInput'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formValue = this.profileForm.value;
    const payload: any = {
      id: this.data.user.id,
      username: formValue.name,
      email: formValue.email,
      password: formValue.password,
    };

    if (this.selectedFile) {
      try {
        const uploadResponse = await this.settingsService
          .uploadFile(this.selectedFile)
          .pipe(first(), takeUntil(this.destroy$))
          .toPromise();
        if (uploadResponse?.file_url) {
          payload.photo_url = uploadResponse.file_url;
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
        return;
      }
    }

    console.log('payload', payload);
    // this.isLoading = false;

    this.userService.updateProfile(payload).subscribe({
      next: (updatedUser: any) => {
        this.isLoading = false;
        console.log('updatedUser', updatedUser);
        this.authService.getCurrentUserFromBackend().subscribe(); // Refresca la info almacenada
        // this.appStore.updateCurrentUser(updatedUser); // Método en AppStore para actualizar el usuario
        this.snackBar.open('Perfil actualizado correctamente.', 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.dialogRef.close(updatedUser); // Devolver el usuario actualizado
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.message || 'Error al actualizar el perfil.',
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
