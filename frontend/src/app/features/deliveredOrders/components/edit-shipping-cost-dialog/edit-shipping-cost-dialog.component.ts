import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { MatIconModule } from '@angular/material/icon'; // Opcional, para el título
import { Order } from '../../models/order.model'; // Ajusta la ruta

export interface EditShippingCostDialogData {
  orderCode: string | number; // Para mostrar en el título
  currentShippingCost: number;
}

export interface EditShippingCostDialogResult {
  newShippingCost: number;
  observation: string;
}

@Component({
  selector: 'app-edit-shipping-cost-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe,
  ],
  templateUrl: './edit-shipping-cost-dialog.component.html',
  styleUrls: ['./edit-shipping-cost-dialog.component.scss'],
})
export class EditShippingCostDialogComponent implements OnInit {
  editCostForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<
      EditShippingCostDialogComponent,
      EditShippingCostDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: EditShippingCostDialogData
  ) {}

  ngOnInit(): void {
    this.editCostForm = this.fb.group({
      shipping_cost: [
        this.data.currentShippingCost,
        [Validators.required, Validators.min(0)],
      ],
      observation_shipping_cost_modification: [
        '',
        [Validators.required, Validators.minLength(5)], // Hacemos la observación obligatoria
      ],
    });
  }

  get shippingCostCtrl() {
    return this.editCostForm.get('shipping_cost');
  }
  get observationCtrl() {
    return this.editCostForm.get('observation_shipping_cost_modification');
  }

  onConfirm(): void {
    if (this.editCostForm.valid) {
      this.dialogRef.close({
        newShippingCost: parseFloat(this.shippingCostCtrl?.value),
        observation: this.observationCtrl?.value.trim(),
      });
    } else {
      this.editCostForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // No devuelve nada o devuelve undefined
  }
}
