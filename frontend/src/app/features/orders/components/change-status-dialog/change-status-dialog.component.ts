import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Order, Order_, OrderStatus } from '../../models/order.model';
import { ImageUploadService } from '../../../shared/file-upload/image-upload.service';
import { firstValueFrom } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ChangeStatusDialogData {
  order: Order_;
  availableStatuses: OrderStatus[];
}

export interface ChangeStatusDialogResult {
  newStatus: OrderStatus;
  reason?: string;
  proofOfDeliveryImageUrls?: string[] | null; // Array de URLs
  shippingCostPaymentMethod?: string | null;
  collectionPaymentMethod?: string | null;
}

// Interfaz interna para manejar la galería visualmente antes de subir
interface EvidencePhoto {
  file?: File; // El archivo físico (si es nuevo)
  previewUrl: string; // URL para mostrar (Base64 o URL remota)
  uploadedUrl?: string; // La URL final si ya existía o se subió
}

@Component({
  selector: 'app-change-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    TitleCasePipe,
    TextFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './change-status-dialog.component.html',
  styleUrls: ['./change-status-dialog.component.scss'],
})
export class ChangeStatusDialogComponent implements OnInit {
  selectedStatus!: OrderStatus;
  reason: string = '';
  showReasonField: boolean = false;

  deliveryDetailsForm: FormGroup;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // --- CONFIGURACIÓN DE GALERÍA ---
  evidencePhotos: EvidencePhoto[] = [];
  readonly MAX_PHOTOS = 5;
  isUploadingImage: boolean = false;
  // -------------------------------

  showCamera = false;
  stream: MediaStream | null = null;
  cameraError: string | null = null;

  formSubmitted: boolean = false;

  readonly paymentMethods: string[] = ['Efectivo', 'Pago directo'];
  readonly paymentMethodsCostoEnvio: string[] = [
    'Efectivo (Pago a COURIER)',
    'Pago directo (Pago a COURIER)',
    'Pago directo (Pago a EMPRESA)',
  ];
  showDeliveryDetails: boolean = false;

  public OrderStatusEnum = OrderStatus;

  private fb = inject(FormBuilder);
  private imageUploadService = inject(ImageUploadService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    public dialogRef: MatDialogRef<
      ChangeStatusDialogComponent,
      ChangeStatusDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusDialogData,
  ) {
    this.deliveryDetailsForm = this.fb.group({
      shippingCostPaymentMethod: [null],
      collectionPaymentMethod: [null],
    });
  }

  ngOnInit(): void {}

  // ============================================================
  // === LÓGICA DE CÁMARA (CORREGIDA) ===
  // ============================================================

  async startCamera(): Promise<void> {
    if (this.evidencePhotos.length >= this.MAX_PHOTOS) {
      this.snackBar.open(
        `Límite de ${this.MAX_PHOTOS} fotos alcanzado.`,
        'Cerrar',
        { duration: 3000 },
      );
      return;
    }

    this.cameraError = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // 1. Activamos la bandera. Al usar [style.display] en el HTML, el elemento ya existe, solo se hace visible.
        this.showCamera = true;

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Intenta usar cámara trasera
          audio: false,
        });

        // 2. Vinculamos el stream al elemento de video
        if (this.videoPlayer && this.videoPlayer.nativeElement) {
          this.videoPlayer.nativeElement.srcObject = this.stream;
          this.videoPlayer.nativeElement
            .play()
            .catch((err) => console.error('Error playing video:', err));
        }
      } else {
        this.cameraError = 'Tu navegador no soporta el acceso a la cámara.';
        this.snackBar.open(this.cameraError, 'Cerrar', { duration: 5000 });
      }
    } catch (err: any) {
      console.error('Error cámara:', err);
      this.cameraError = 'Error al iniciar cámara. Verifica permisos.';
      this.snackBar.open(this.cameraError, 'Cerrar', { duration: 5000 });
      this.showCamera = false;
    }
    this.cdr.detectChanges();
  }

  takePhoto(): void {
    if (!this.stream || !this.videoPlayer || !this.canvasElement) return;

    if (this.evidencePhotos.length >= this.MAX_PHOTOS) {
      this.snackBar.open(`Límite alcanzado.`, 'Cerrar', { duration: 2000 });
      this.stopCamera();
      return;
    }

    const video = this.videoPlayer.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Calidad 0.8

      // Convertir DataURL a File Blob para tratarlo igual que un upload normal
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const filename = `camara_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg' });
          this.addPhotoToGallery(file, dataUrl);
        });

      // Opcional: Detener cámara tras tomar foto si prefieres flujo de 1 en 1
      // this.stopCamera();
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.showCamera = false;
    this.cdr.detectChanges();
  }

  // ============================================================
  // === LÓGICA DE ARCHIVOS (Galería y Multi-Selección) ===
  // ============================================================

  triggerFileUpload(): void {
    if (this.evidencePhotos.length >= this.MAX_PHOTOS) {
      this.snackBar.open(
        `Máximo ${this.MAX_PHOTOS} fotos permitidas.`,
        'Cerrar',
        { duration: 3000 },
      );
      return;
    }
    this.stopCamera();
    const fileUpload = document.getElementById(
      'proofOfDeliveryImageUpload',
    ) as HTMLInputElement;
    fileUpload.value = ''; // Reset
    fileUpload?.click();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      // 1. Calcular espacios disponibles
      const slotsRemaining = this.MAX_PHOTOS - this.evidencePhotos.length;

      if (slotsRemaining <= 0) {
        this.snackBar.open(`Límite de fotos alcanzado.`, 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      // 2. Cortar la lista si seleccionó demasiados (SOLUCIÓN AL BUG DE EXCESO)
      const filesToProcess = Array.from(fileList).slice(0, slotsRemaining);

      if (fileList.length > slotsRemaining) {
        this.snackBar.open(
          `Solo se agregaron ${slotsRemaining} fotos para respetar el límite.`,
          'OK',
          { duration: 4000 },
        );
      }

      // 3. Procesar y agregar
      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.evidencePhotos.length < this.MAX_PHOTOS) {
            this.addPhotoToGallery(file, e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // ============================================================
  // === GESTIÓN DE GALERÍA ===
  // ============================================================

  addPhotoToGallery(file: File, previewUrl: string) {
    this.evidencePhotos.push({
      file: file,
      previewUrl: previewUrl,
    });
    this.cdr.detectChanges();
  }

  removePhoto(index: number): void {
    this.evidencePhotos.splice(index, 1);
    this.cdr.detectChanges();
  }

  // ============================================================
  // === VALIDACIONES Y CONFIRMACIÓN ===
  // ============================================================

  onStatusChange(event: MatSelectChange | { value: OrderStatus }): void {
    this.selectedStatus = event.value;
    this.checkIfReasonIsNeeded(this.selectedStatus);
    this.checkIfDeliveryDetailsNeeded(this.selectedStatus);
  }

  checkIfReasonIsNeeded(status: OrderStatus | undefined): void {
    if (!status) {
      this.showReasonField = false;
      return;
    }
    this.showReasonField = this.isReasonMandatory(status);
  }

  isReasonMandatory(status?: OrderStatus | undefined): boolean {
    const currentStatus = status || this.selectedStatus;
    if (!currentStatus) return false;
    const statusesRequiringReason: OrderStatus[] = [
      OrderStatus.REPROGRAMADO,
      OrderStatus.RECHAZADO,
      OrderStatus.ANULADO,
    ];
    return statusesRequiringReason.includes(currentStatus);
  }

  checkIfDeliveryDetailsNeeded(status: OrderStatus | undefined): void {
    if (status === OrderStatus.ENTREGADO) {
      this.showDeliveryDetails = true;
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.setValidators([Validators.required]);
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.updateValueAndValidity();
    } else {
      this.showDeliveryDetails = false;
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.clearValidators();
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.updateValueAndValidity();
      this.deliveryDetailsForm.reset();
      this.evidencePhotos = []; // Limpiar fotos si cambia de estado
    }
  }

  isConfirmDisabled(): boolean {
    if (!this.selectedStatus) return true;
    if (
      this.isReasonMandatory(this.selectedStatus) &&
      (!this.reason || this.reason.trim() === '')
    ) {
      return true;
    }
    if (this.selectedStatus === OrderStatus.ENTREGADO) {
      if (!this.deliveryDetailsForm.valid) return true;
      // VALIDACIÓN: Al menos 1 foto
      if (this.evidencePhotos.length === 0) return true;
    }
    return false;
  }

  async onConfirm(): Promise<void> {
    this.formSubmitted = true;
    if (this.isConfirmDisabled()) {
      if (this.selectedStatus === OrderStatus.ENTREGADO)
        this.deliveryDetailsForm.markAllAsTouched();
      return;
    }

    const uploadedUrls: string[] = [];

    // Lógica de subida masiva
    if (
      this.selectedStatus === OrderStatus.ENTREGADO &&
      this.evidencePhotos.length > 0
    ) {
      this.isUploadingImage = true;

      try {
        // Subimos todas las fotos en paralelo
        const uploadPromises = this.evidencePhotos.map(async (photo) => {
          if (photo.uploadedUrl) {
            return photo.uploadedUrl; // Ya estaba en la nube
          } else if (photo.file) {
            // Subir archivo nuevo
            const response = await firstValueFrom(
              this.imageUploadService.uploadFile(photo.file),
            );
            return response.file_url;
          }
          return null;
        });

        const results = await Promise.all(uploadPromises);

        results.forEach((url) => {
          if (url) uploadedUrls.push(url);
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        this.snackBar.open(
          'Error al subir las imágenes. Verifique su conexión.',
          'Cerrar',
          { duration: 3000 },
        );
        this.isUploadingImage = false;
        return;
      } finally {
        this.isUploadingImage = false;
      }
    }

    this.dialogRef.close({
      newStatus: this.selectedStatus,
      reason:
        this.showReasonField && this.reason ? this.reason.trim() : undefined,
      // Enviamos el array de URLs
      proofOfDeliveryImageUrls: uploadedUrls.length > 0 ? uploadedUrls : null,
      shippingCostPaymentMethod: this.showDeliveryDetails
        ? this.deliveryDetailsForm.value.shippingCostPaymentMethod
        : null,
      collectionPaymentMethod: this.showDeliveryDetails
        ? this.deliveryDetailsForm.value.collectionPaymentMethod
        : null,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get scpmCtrl() {
    return this.deliveryDetailsForm.get('shippingCostPaymentMethod');
  }
  get cpmCtrl() {
    return this.deliveryDetailsForm.get('collectionPaymentMethod');
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) return 'status-desconocido';
    return `status-${status.toLowerCase().replace(/[\s_]+/g, '-')}`;
  }
}
