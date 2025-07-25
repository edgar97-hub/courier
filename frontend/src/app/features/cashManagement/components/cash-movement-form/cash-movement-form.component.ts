import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  CreateCashMovement,
  CashMovement,
} from '../../models/cash-movement.model';
import { CashManagementService } from '../../services/cash-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-cash-movement-form',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cash-movement-form.component.html',
  styleUrls: ['./cash-movement-form.component.scss'],
})
export class CashMovementFormComponent implements OnInit {
  movementForm: FormGroup;
  isLoading: boolean = false;
  minDate: Date | null = null;
  paymentMethods: string[] = [
    'Efectivo',
    'Yape/Transferencia BCP',
    'Plin/Transferencia INTERBANK',
    'POS',
  ];
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CashMovementFormComponent>,
    private cashManagementService: CashManagementService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: CashMovement
  ) {
    this.movementForm = this.fb.group({
      date: [new Date(), Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      typeMovement: ['', Validators.required],
      paymentsMethod: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.data) {
      // Parse the date string as a local date to avoid timezone issues
      let parsedDate: Date | null = null;
      if (this.data.date) {
        const dateParts = this.data.date.split('-'); // Assuming YYYY-MM-DD format
        parsedDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2])
        );
      }

      this.movementForm.patchValue({
        ...this.data,
        date: parsedDate, // Use the locally parsed date
      });
    }
  }

  onSave(): void {
    if (this.movementForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue: CreateCashMovement = {
        ...this.movementForm.value,
      };

      const saveObservable =
        this.data && this.data.id
          ? this.cashManagementService.updateCashMovement(
              this.data.id,
              formValue
            )
          : this.cashManagementService.createManualMovement(formValue);

      saveObservable.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: (response) => {
          this.snackBar.open('Movimiento registrado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(
            'Error al registrar movimiento: ' + error.message,
            'Cerrar',
            { duration: 3000 }
          );
          console.error('Error creating cash movement:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
