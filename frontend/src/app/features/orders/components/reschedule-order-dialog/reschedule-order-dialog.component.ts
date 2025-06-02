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
import {
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  DateAdapter,
} from '@angular/material/core'; // MAT_DATE_LOCALE y DateAdapter para localización
// Para localización de fecha si es necesario:
// import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDividerModule } from '@angular/material/divider';

import { Order } from '../../models/order.model'; // Ajusta la ruta

export interface RescheduleOrderDialogData {
  order: Order;
  minDate?: Date; // Fecha mínima para reprogramar (ej. mañana)
}

export interface RescheduleOrderDialogResult {
  newDeliveryDate: Date; // Enviar como objeto Date
  reason?: string;
  // Podrías añadir timeSlot si tienes esa lógica
  // newTimeSlot?: string;
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
    MatNativeDateModule, // O MatMomentDateModule si usas Moment.js
    // TitleCasePipe,
    MatDividerModule,
  ],
  templateUrl: './reschedule-order-dialog.component.html',
  styleUrls: ['./reschedule-order-dialog.component.scss'],
  providers: [
    // Opcional: Configurar el locale para el datepicker
    // { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    // { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    // { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ],
})
export class RescheduleOrderDialogComponent implements OnInit {
  rescheduleForm: FormGroup;
  minDateForReschedule: Date; // Fecha mínima para el datepicker
  formSubmitted: boolean = false; // <--- ESTA ES LA BANDERA
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
      reason: ['', Validators.maxLength(250)], // Motivo opcional pero con límite
      // timeSlot: [''], // Si tienes franjas horarias
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
    this.formSubmitted = true; // <--- SE ESTABLECE AQUÍ AL INTENTAR CONFIRMAR
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
