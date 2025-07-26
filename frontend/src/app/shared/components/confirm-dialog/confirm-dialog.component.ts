import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonColor: string;
  icon?: string; // Optional icon name (e.g., 'warning', 'info')
  iconColor?: string; // Optional icon color (e.g., 'warn', 'primary')
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule, // Add MatIconModule here
  ],
  template: `
    <div class="confirm-dialog-container">
      <mat-icon
        *ngIf="data.icon"
        [color]="data.iconColor || 'primary'"
        class="dialog-icon"
        >{{ data.icon }}</mat-icon
      >
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions
        style="display: flex; flex-direction: row;flex-wrap:nowrap; border:0px solid black"
      >
        <button
          mat-stroked-button
          [mat-dialog-close]="false"
          class="btn-corp-secondary"
        >
          {{ data.cancelButtonText }}
        </button>
        <button
          mat-raised-button
          [color]="data.confirmButtonColor"
          class="btn-corp-primary"
          [mat-dialog-close]="true"
        >
          {{ data.confirmButtonText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .confirm-dialog-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        text-align: center;
        border: 2px solid var(--mat-dialog-container-border-color, #ccc); /* Add a border */
        border-radius: 8px; /* Rounded corners for the border */
      }
      .dialog-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
      mat-dialog-title {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 16px;
        color: var(
          --mat-dialog-title-color,
          inherit
        ); /* Make title color dynamic */
      }
      mat-dialog-content {
        margin-bottom: 24px;
      }
      mat-dialog-actions {
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
