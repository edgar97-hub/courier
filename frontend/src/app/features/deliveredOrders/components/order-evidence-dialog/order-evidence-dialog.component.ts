import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageUploadService } from '../../../shared/file-upload/image-upload.service';
import { Order_ } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-evidence-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './order-evidence-dialog.component.html',
})
export class OrderEvidenceDialogComponent {
  readonly order = inject<Pick<Order_, 'id' | 'code'>>(MAT_DIALOG_DATA);
  readonly maxPhotos = 5;
  readonly acceptedImages = '.jpg,.jpeg,.png,.webp,.heic,.heif,.avif';

  photos: File[] = [];
  saving = false;
  errorMessage = '';

  private readonly orderService = inject(OrderService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly dialogRef = inject(
    MatDialogRef<OrderEvidenceDialogComponent, boolean>,
  );
  private readonly destroyRef = inject(DestroyRef);

  addPhotos(input: HTMLInputElement): void {
    const selected = Array.from(input.files ?? []);
    input.value = '';
    if (this.saving || selected.length === 0) return;

    if (this.photos.length + selected.length > this.maxPhotos) {
      this.errorMessage = `Puede adjuntar hasta ${this.maxPhotos} fotos.`;
      return;
    }
    if (selected.some((photo) => photo.size === 0 || photo.size > 10 * 1024 * 1024)) {
      this.errorMessage = 'Las fotos no pueden estar vacías ni superar los 10 MB.';
      return;
    }

    this.errorMessage = '';
    this.photos.push(...selected);
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
    this.errorMessage = '';
  }

  saveEvidence(): void {
    if (this.saving || this.photos.length === 0) return;

    this.saving = true;
    this.dialogRef.disableClose = true;
    this.errorMessage = '';
    forkJoin(
      this.photos.map((photo) =>
        this.imageUploadService
          .uploadFile(photo)
          .pipe(map(({ file_url }) => file_url)),
      ),
    )
      .pipe(
        switchMap((photoUrls) =>
          this.orderService.addMissingEvidence(this.order.id, photoUrls),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (error: HttpErrorResponse | Error) => {
          this.saving = false;
          this.dialogRef.disableClose = false;
          const message =
            error instanceof HttpErrorResponse ? error.error?.message : error.message;
          this.errorMessage =
            typeof message === 'string' && message
              ? message
              : 'No se pudieron guardar las fotos. Intente nuevamente.';
        },
      });
  }
}
