import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Order } from '../../models/order.model';

export interface RescheduleOrderDialogData {
  order: Order;
  minDate?: Date;
}

export interface RescheduleOrderDialogResult {
  newDeliveryDate: Date;
  reason?: string;
}

@Component({
  selector: 'app-reschedule-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
  ],
  templateUrl: './reschedule-order-dialog.component.html',
  styleUrls: ['./reschedule-order-dialog.component.scss'],
  providers: [],
})
export class RescheduleOrderDialogComponent implements OnInit {
  rescheduleForm: FormGroup;
  minDateForReschedule: Date;
  formSubmitted: boolean = false;
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<
      RescheduleOrderDialogComponent,
      RescheduleOrderDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: RescheduleOrderDialogData
  ) {
    // Establecer la fecha mínima para reprogramar (ej. mañana)

    this.minDateForReschedule = this.data.minDate || new Date();
    if (!this.data.minDate) {
      // Si no se provee, por defecto mañana
      this.minDateForReschedule.setDate(
        this.minDateForReschedule.getDate() + 1
      );
    }

    this.rescheduleForm = this.fb.group({
      newDeliveryDate: [
        this.data.order.delivery_date
          ? new Date(this.data.order.delivery_date)
          : null, // Pre-llenar si existe
        Validators.required,
      ],
      reason: ['', Validators.maxLength(250)],
    });
  }

  ngOnInit(): void {}

  get newDeliveryDateCtrl() {
    return this.rescheduleForm.get('newDeliveryDate');
  }
  get reasonCtrl() {
    return this.rescheduleForm.get('reason');
  }

  onConfirm(): void {
    this.formSubmitted = true;
    if (this.rescheduleForm.valid) {
      this.dialogRef.close({
        newDeliveryDate: this.newDeliveryDateCtrl?.value as Date,
        reason: this.reasonCtrl?.value?.trim() || undefined,
      });
    } else {
      this.rescheduleForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
