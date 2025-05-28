import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core'; // Añadir inject
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
} from '@angular/forms'; // Añadir ReactiveFormsModule, FormBuilder, FormGroup, Validators
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon'; // Para iconos
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para feedback de carga
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar'; // Asegúrate de inyectarlo si lo usas para errores de cámara
import { Order, Order_, OrderStatus } from '../../models/order.model';
import { ImageUploadService } from '../../../shared/file-upload/image-upload.service'; // Asume que tienes este servicio
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';

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
    FormsModule, // Para ngModel en el select de estado y reason
    ReactiveFormsModule, // Para el formulario de los campos adicionales
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
  // Para el estado principal y motivo (usando ngModel por simplicidad aquí, podrías migrar a Reactive Forms todo)
  selectedStatus!: OrderStatus;
  reason: string = '';
  showReasonField: boolean = false;

  // Formulario reactivo para los campos adicionales
  deliveryDetailsForm: FormGroup;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  imagePreviewUrl: string | ArrayBuffer | null = null; // Se usará para la foto tomada o subida
  selectedImageFile: File | null = null; // Para el caso de subir archivo (fallback o alternativa)
  isUploadingImage: boolean = false;
  uploadedImageUrl: string | null = null;

  showCamera = false;
  stream: MediaStream | null = null;
  photoTaken = false;
  cameraError: string | null = null;

  formSubmitted: boolean = false;
  // imagePreviewUrl: string | ArrayBuffer | null = null;
  // selectedImageFile: File | null = null;
  // isUploadingImage: boolean = false;
  // uploadedImageUrl: string | null = null; // URL de la imagen después de subirla

  readonly paymentMethods: string[] = ['Efectivo', 'Pago directo', 'POS'];
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
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusDialogData
  ) {
    this.deliveryDetailsForm = this.fb.group({
      shippingCostPaymentMethod: [null], // Opcional, solo si se cobra en entrega
      collectionPaymentMethod: [null], // Opcional, solo si hay monto a cobrar
      // proofOfDeliveryImage: [null] // El input de archivo se maneja por separado
    });
  }

  ngOnInit(): void {
    // Pre-seleccionar el estado actual si está en la lista de disponibles
    if (
      this.data.availableStatuses.includes(
        this.data.order.status as OrderStatus
      )
    ) {
      // this.selectedStatus = this.data.order.status; // Podría no ser lo ideal si siempre quieres que elija
      // this.onStatusChange({ value: this.selectedStatus } as MatSelectChange);
    }
  }

  async startCamera(): Promise<void> {
    this.cameraError = null;
    this.removeImage(); // Limpiar cualquier imagen previa
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Preferir cámara trasera
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
    this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar showCamera
  }

  takePhoto(): void {
    if (!this.stream || !this.videoPlayer || !this.canvasElement) return;

    const video = this.videoPlayer.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      // Ajustar tamaño del canvas a las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir el canvas a Data URL (imagen base64) para la vista previa
      this.imagePreviewUrl = canvas.toDataURL('image/jpeg'); // O 'image/png'
      this.photoTaken = true;
      this.selectedImageFile = null; // Resetear archivo seleccionado si se toma foto
      this.uploadedImageUrl = null;
      this.stopCamera(); // Detener la cámara después de tomar la foto
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.showCamera = false;
  }

  // takePhoto(): void {
  //   if (
  //     !this.stream ||
  //     !this.videoPlayer?.nativeElement ||
  //     !this.canvasElement?.nativeElement
  //   ) {
  //     console.error('takePhoto: Stream o elementos no listos.');
  //     return;
  //   }
  //   const video = this.videoPlayer.nativeElement;
  //   const canvas = this.canvasElement.nativeElement;
  //   const context = canvas.getContext('2d');

  //   if (context) {
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //     this.imagePreviewUrl.set(canvas.toDataURL('image/jpeg'));
  //     this.photoTaken.set(true);
  //     this.showCamera.set(false); // Ocultar video, mostrar preview
  //     this.selectedImageFile.set(null);
  //     this.uploadedImageUrl.set(null);
  //     this.stopCameraStream();
  //     this.cdr.detectChanges();
  //   }
  // }

  // stopCameraStream(): void {
  //   if (this.stream) {
  //     this.stream.getTracks().forEach((track) => track.stop());
  //     this.stream = null;
  //     console.log('Camera stream stopped.');
  //   }
  // }

  // closeCameraView(): void {
  //   this.stopCameraStream();
  //   this.showCamera.set(false);
  //   // No resetear photoTaken aquí necesariamente
  //   this.cdr.detectChanges();
  // }

  onFileSelected(event: Event): void {
    this.stopCamera(); // Detener cámara si estaba activa
    this.photoTaken = false;
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList[0]) {
      this.selectedImageFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
        this.uploadedImageUrl = null;
        this.cdr.detectChanges(); // Forzar detección si la imagen no se actualiza en la UI
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
      'proofOfDeliveryImageUpload'
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
      'proofOfDeliveryImageUpload'
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
      OrderStatus.CANCELADO,
      OrderStatus.REPROGRAMADO,
      OrderStatus.RECHAZADO,
    ];
    return statusesRequiringReason.includes(currentStatus);
  }

  checkIfDeliveryDetailsNeeded(status: OrderStatus | undefined): void {
    if (status === OrderStatus.ENTREGADO) {
      this.showDeliveryDetails = true;
      // Habilitar y poner validadores si es necesario (ej. si el monto a cobrar es > 0)
      if (this.data.order.shipping_cost && this.data.order.shipping_cost > 0) {
        this.deliveryDetailsForm
          .get('shippingCostPaymentMethod')
          ?.setValidators([Validators.required]);
      } else {
        this.deliveryDetailsForm
          .get('shippingCostPaymentMethod')
          ?.clearValidators();
      }
      if (
        this.data.order.amount_to_collect_at_delivery &&
        this.data.order.amount_to_collect_at_delivery > 0
      ) {
        this.deliveryDetailsForm
          .get('collectionPaymentMethod')
          ?.setValidators([Validators.required]);
      } else {
        this.deliveryDetailsForm
          .get('collectionPaymentMethod')
          ?.clearValidators();
      }
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
      // Resetear valores e imagen si se cambia de ENTREGADO a otro estado
      this.deliveryDetailsForm.reset();
      this.imagePreviewUrl = null;
      this.selectedImageFile = null;
      this.uploadedImageUrl = null;
    }
  }

  isConfirmDisabled(): boolean {
    if (!this.selectedStatus) return true; // Siempre se necesita un estado
    if (
      this.isReasonMandatory(this.selectedStatus) &&
      (!this.reason || this.reason.trim() === '')
    ) {
      return true; // Motivo obligatorio no provisto
    }
    if (this.selectedStatus === OrderStatus.ENTREGADO) {
      // Si es ENTREGADO, el formulario de detalles de entrega debe ser válido
      // y se requiere una imagen si la política del negocio lo exige.
      // Para este ejemplo, haremos que la imagen sea opcional, pero los selects de pago sí deben ser válidos si los montos son > 0
      // if (!this.deliveryDetailsForm.valid) return true;
      if (!this.selectedImageFile) return true; // Si la imagen es obligatoria
    }
    return false; // Si pasa todas las validaciones, no está deshabilitado
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
              : new File([imageBlob], 'proof_of_delivery.jpg', {
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
            'No image data to upload, but proceeding as ENTREGADO without image proof.'
          );
        }
      } catch (error) {
        console.error('Error uploading/processing image:', error);
        this.snackBar.open('Error al procesar la imagen de prueba.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.isUploadingImage = false;
        return; // No continuar si la subida falla
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
    console.log('`status-${formattedStatus}`', `status-${formattedStatus}`);
    return `status-${formattedStatus}`;
  }
}
