import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface RouteNoticeDialogData {
  title: string;
  message: string;
  imageUrl: string;
  confirmButtonText?: string;
}

@Component({
  selector: 'app-route-specific-notice-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './route-specific-notice-dialog.component.html',
  styleUrls: ['./route-specific-notice-dialog.component.scss'],
})
export class RouteSpecificNoticeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RouteSpecificNoticeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RouteNoticeDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
