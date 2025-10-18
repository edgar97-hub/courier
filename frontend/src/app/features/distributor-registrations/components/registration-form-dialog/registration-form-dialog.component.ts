import { Component, inject, Inject } from '@angular/core'; // <-- AÑADIR Inject
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog'; // <-- AÑADIR MAT_DIALOG_DATA
import { MatButtonModule } from '@angular/material/button';
import { RegistrationFormComponent } from '../registration-form/registration-form.component';
import { DistributorRegistration } from '../../models/distributor-registration.model';

@Component({
  selector: 'app-registration-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    RegistrationFormComponent,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEditMode ? 'Editar' : 'Nuevo' }} Datos de Envio
    </h2>

    <mat-dialog-content>
      <app-registration-form
        [initialData]="registrationData"
        [isEditMode]="isEditMode"
        (formSubmit)="onFormSubmit($event)"
        (formCancel)="onCancel()"
      >
      </app-registration-form>
    </mat-dialog-content>
  `,
})
export class RegistrationFormDialogComponent {
  public dialogRef = inject(MatDialogRef<RegistrationFormDialogComponent>);

  isEditMode: boolean;
  registrationData: DistributorRegistration | null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { registration?: DistributorRegistration }
  ) {
    if (data && data.registration) {
      this.isEditMode = true;
      this.registrationData = data.registration;
    } else {
      this.isEditMode = false;
      this.registrationData = null;
    }
  }

  onFormSubmit(dto: any): void {
    this.dialogRef.close(dto);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
