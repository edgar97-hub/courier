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
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';

export interface ChangeStatusDialogData {
  order: Order_;
  availableStatuses: OrderStatus[];
}

export interface ChangePayementTypeDialogResult {
  // newStatus: OrderStatus;
  // reason?: string;
  // proofOfDeliveryImageUrl?: string | null;
  shippingCostPaymentMethod?: string | null;
  collectionPaymentMethod?: string | null;
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
  templateUrl: './change-payment-type-dialog.component.html',
  styleUrls: ['./change-payment-type-dialog.component.scss'],
})
export class ChangePaymentTypeDialogComponent implements OnInit {
  // selectedStatus!: OrderStatus;
  // reason: string = '';
  // showReasonField: boolean = false;

  deliveryDetailsForm: FormGroup;

  // @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  // @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // imagePreviewUrl: string | ArrayBuffer | null = null;
  // selectedImageFile: File | null = null;
  // isUploadingImage: boolean = false;
  // uploadedImageUrl: string | null = null;

  // showCamera = false;
  // stream: MediaStream | null = null;
  // photoTaken = false;
  // cameraError: string | null = null;

  formSubmitted: boolean = false;

  readonly paymentMethods: string[] = ['Efectivo', 'Pago directo'];
  readonly paymentMethodsCostoEnvio: string[] = [
    'Efectivo (Pago a COURIER)',
    'Pago directo (Pago a COURIER)',
    'Pago directo (Pago a EMPRESA)',
  ];

  public OrderStatusEnum = OrderStatus;

  private fb = inject(FormBuilder);
  // private imageUploadService = inject(ImageUploadService);
  // private snackBar = inject(MatSnackBar);
  // private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<
      ChangePaymentTypeDialogComponent,
      ChangePayementTypeDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusDialogData
  ) {
    this.deliveryDetailsForm = this.fb.group({
      shippingCostPaymentMethod: [null],
      collectionPaymentMethod: [null],
    });
  }

  ngOnInit(): void {}

  async onConfirm(): Promise<void> {
    this.formSubmitted = true;

    this.dialogRef.close({
      // newStatus: this.selectedStatus,
      // reason:
      // this.showReasonField && this.reason ? this.reason.trim() : undefined,
      shippingCostPaymentMethod:
        this.deliveryDetailsForm.value.shippingCostPaymentMethod,
      collectionPaymentMethod:
        this.deliveryDetailsForm.value.collectionPaymentMethod,
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
}
