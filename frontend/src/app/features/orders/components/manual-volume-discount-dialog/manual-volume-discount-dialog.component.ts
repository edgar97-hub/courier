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
import { MatIconModule } from '@angular/material/icon';

export interface ManualVolumeDiscountDialogData {
  mode: 'apply' | 'remove';
  orderCode: string | number;
  shippingCost: number;
  volumeDiscountAmount: number;
  currentPercentage?: number | null;
}

export interface ManualVolumeDiscountDialogResult {
  percentage?: number;
}

@Component({
  selector: 'app-manual-volume-discount-dialog',
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
  templateUrl: './manual-volume-discount-dialog.component.html',
  styleUrls: ['./manual-volume-discount-dialog.component.scss'],
})
export class ManualVolumeDiscountDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<
      ManualVolumeDiscountDialogComponent,
      ManualVolumeDiscountDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ManualVolumeDiscountDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      percentage: [
        this.data.currentPercentage ?? 10,
        this.data.mode === 'apply'
          ? [Validators.required, Validators.min(0.01), Validators.max(100)]
          : [],
      ],
    });
  }

  get isApply(): boolean {
    return this.data.mode === 'apply';
  }

  get percentageCtrl() {
    return this.form.get('percentage');
  }

  get basePrice(): number {
    return (
      Number(this.data.shippingCost || 0) +
      Number(this.data.volumeDiscountAmount || 0)
    );
  }

  get discountAmount(): number {
    if (!this.isApply) {
      return 0;
    }
    const percentage = Number(this.percentageCtrl?.value || 0);
    return Math.round(this.basePrice * percentage) / 100;
  }

  get newShippingCost(): number {
    return Math.round((this.basePrice - this.discountAmount) * 100) / 100;
  }

  onConfirm(): void {
    if (this.isApply && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      percentage: this.isApply
        ? Number(this.percentageCtrl?.value)
        : undefined,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
