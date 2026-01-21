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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order, Order_, OrderStatus } from '../../models/order.model';
import { ImageUploadService } from '../../../shared/file-upload/image-upload.service';
import { Observable, of, Subject } from 'rxjs';

export interface ChangeStatusDialogData {
  order: Order_;
  availableStatuses: OrderStatus[];
}

export interface ChangeStatusDialogResult {
  newStatus: OrderStatus;
  reason?: string;
  proofOfDeliveryImageUrl?: string | null;
  shippingCostPaymentMethod?: string | null; // Método de pago para el costo de envío (si se cobra en entrega)
  collectionPaymentMethod?: string | null; // Método de pago para el monto a cobrar en entrega
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

  imagePreviewUrl: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;
  isUploadingImage: boolean = false;
  uploadedImageUrl: string | null = null;

  showCamera = false;
  stream: MediaStream | null = null;
  photoTaken = false;
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
  private destroy$ = new Subject<void>();

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
      // proofOfDeliveryImage: [null]
    });
  }

  ngOnInit(): void {}

  async startCamera(): Promise<void> {
    this.cameraError = null;
    this.removeImage();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (this.videoPlayer && this.videoPlayer.nativeElement) {
          this.videoPlayer.nativeElement.srcObject = this.stream;
          this.videoPlayer.nativeElement
            .play()
            .catch((err) => console.error('Error playing video:', alert(err)));
          this.showCamera = true;
          this.photoTaken = false;
        }
        this.showCamera = true;
        this.photoTaken = false;
      } else {
        this.cameraError = 'Tu navegador no soporta el acceso a la cámara.';
        this.snackBar.open(this.cameraError, 'Cerrar', { duration: 5000 });
      }
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err);
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        this.cameraError =
          'Permiso de cámara denegado. Por favor, habilita el acceso en tu navegador.';
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        this.cameraError = 'No se encontró una cámara compatible.';
      } else {
        this.cameraError =
          'Error al iniciar la cámara. Intenta de nuevo o sube un archivo.';
      }
      this.snackBar.open(this.cameraError, 'Cerrar', { duration: 7000 });
      this.showCamera = false;
    }
    this.cdr.detectChanges();
  }

  takePhoto(): void {
    if (!this.stream || !this.videoPlayer || !this.canvasElement) return;

    const video = this.videoPlayer.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.imagePreviewUrl = canvas.toDataURL('image/jpeg');
      this.photoTaken = true;
      this.selectedImageFile = null;
      this.uploadedImageUrl = null;
      this.stopCamera();
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

  onFileSelected(event: Event): void {
    this.stopCamera();
    this.photoTaken = false;
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList[0]) {
      this.selectedImageFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
        this.uploadedImageUrl = null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedImageFile);
    } else {
      this.selectedImageFile = null;
      this.imagePreviewUrl = null;
    }
  }

  triggerFileUpload(): void {
    this.stopCamera();
    const fileUpload = document.getElementById(
      'proofOfDeliveryImageUpload',
    ) as HTMLInputElement;
    fileUpload?.click();
  }
  removeImage(): void {
    this.stopCamera();
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.uploadedImageUrl = null;
    this.photoTaken = false;
    const fileInput = document.getElementById(
      'proofOfDeliveryImageUpload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

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
      this.deliveryDetailsForm
        .get('collectionPaymentMethod')
        ?.updateValueAndValidity();
    } else {
      this.showDeliveryDetails = false;
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.clearValidators();
      this.deliveryDetailsForm
        .get('shippingCostPaymentMethod')
        ?.updateValueAndValidity();
      this.deliveryDetailsForm
        .get('collectionPaymentMethod')
        ?.clearValidators();
      this.deliveryDetailsForm
        .get('collectionPaymentMethod')
        ?.updateValueAndValidity();
      this.deliveryDetailsForm.reset();
      this.imagePreviewUrl = null;
      this.selectedImageFile = null;
      this.uploadedImageUrl = null;
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
      if (!this.imagePreviewUrl) return true;
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

    let proofImageUrlToSubmit: string | null = this.uploadedImageUrl;

    // Si se tomó una foto y aún no se ha subido, o si se seleccionó un archivo y no se ha subido
    if (
      this.selectedStatus === OrderStatus.ENTREGADO &&
      (this.photoTaken || this.selectedImageFile) &&
      !this.uploadedImageUrl
    ) {
      this.isUploadingImage = true;
      try {
        let imageBlob: Blob | null = null;
        if (
          this.photoTaken &&
          this.imagePreviewUrl &&
          typeof this.imagePreviewUrl === 'string'
        ) {
          // Convertir Data URL de la foto tomada a Blob
          const res = await fetch(this.imagePreviewUrl);
          imageBlob = await res.blob();
        } else if (this.selectedImageFile) {
          imageBlob = this.selectedImageFile;
        }

        if (imageBlob) {
          const imageFileToUpload =
            imageBlob instanceof File
              ? imageBlob
              : new File([imageBlob], 'prueba_de_entrega.jpg', {
                  type: imageBlob.type,
                });
          const uploadResponse = await this.imageUploadService
            .uploadFile(imageFileToUpload)
            .toPromise();
          proofImageUrlToSubmit = uploadResponse?.file_url || null;
          console.log('uploadResponse', uploadResponse);
          this.uploadedImageUrl = proofImageUrlToSubmit;
        } else if (!this.uploadedImageUrl) {
          // Si no hay imagen y no se pudo crear blob, y no había una subida previa
          // Decide si la imagen es estrictamente obligatoria para ENTREGADO
          // this.snackBar.open('Se requiere una prueba de entrega.', 'Cerrar', { duration: 3000 });
          // this.isUploadingImage = false;
          // return;
          console.warn(
            'No image data to upload, but proceeding as ENTREGADO without image proof.',
          );
        }
      } catch (error) {
        console.error('Error uploading/processing image:', error);
        this.snackBar.open('Error al procesar la imagen de prueba.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
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
      proofOfDeliveryImageUrl: proofImageUrlToSubmit,
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

  // Para que el template pueda acceder a los controles del formGroup anidado
  get scpmCtrl() {
    return this.deliveryDetailsForm.get('shippingCostPaymentMethod');
  }
  get cpmCtrl() {
    return this.deliveryDetailsForm.get('collectionPaymentMethod');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) {
      return 'status-desconocido';
    }
    const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }
}
