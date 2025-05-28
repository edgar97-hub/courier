import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-dialog',
  template: `
    <img
      [src]="data.imageUrl"
      [alt]="data.altText"
      style="width: 100%; height: auto;"
    />
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Close</button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 80vw; /* Adjust as needed */
        max-height: 80vh; /* Adjust as needed */
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class ImageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; altText: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
