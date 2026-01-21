import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Order_ } from '../../models/order.model';
import heic2any from 'heic2any';

export interface OrderDetailDialogData {
  order: Order_;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
})
export class OrderDetailDialogComponent implements OnInit, OnDestroy {
  // Estado del Carrusel
  photos: string[] = [];
  currentIndex: WritableSignal<number> = signal(0);

  // Estado de la Imagen
  displayImageUrl: string | null = null; // URL final para el <img> (puede ser Blob o URL remota)
  isLoadingImage: WritableSignal<boolean> = signal(true);
  imageLoadFailed: WritableSignal<boolean> = signal(false);

  // Cache para Blobs HEIC convertidos (para no reconvertir al navegar atrás/adelante)
  private blobCache: Map<string, string> = new Map();

  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailDialogData,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.initializeGallery();
    this.loadCurrentImage();
  }

  private initializeGallery(): void {
    const order = this.data.order;

    // 1. Prioridad: Array de evidencias nuevo
    if (order.evidence_photos && order.evidence_photos.length > 0) {
      this.photos = order.evidence_photos;
    }
    // 2. Fallback: Campo antiguo de foto única
    else if (order.product_delivery_photo_url) {
      this.photos = [order.product_delivery_photo_url];
    }

    if (this.photos.length === 0) {
      this.isLoadingImage.set(false);
      this.imageLoadFailed.set(true);
    }
  }

  get currentOriginalUrl(): string {
    return this.photos[this.currentIndex()] || '';
  }

  // --- LÓGICA DE VISUALIZACIÓN ---

  async loadCurrentImage(): Promise<void> {
    const url = this.currentOriginalUrl;
    if (!url) return;

    this.isLoadingImage.set(true);
    this.imageLoadFailed.set(false);
    this.displayImageUrl = null;

    // Si es HEIC/HEIF, usamos tu lógica de conversión
    if (
      url.toLowerCase().endsWith('.heic') ||
      url.toLowerCase().endsWith('.heif')
    ) {
      // Revisar si ya lo convertimos antes para ahorrar proceso
      if (this.blobCache.has(url)) {
        this.displayImageUrl = this.blobCache.get(url)!;
        this.isLoadingImage.set(false);
      } else {
        await this.convertHeicToJpeg(url);
      }
    } else {
      // Si es JPG/PNG normal, usamos la URL directa
      this.displayImageUrl = url;
      // El spinner se quitará cuando el evento (load) de la imagen se dispare en el HTML
    }
  }

  private async convertHeicToJpeg(heicUrl: string): Promise<void> {
    try {
      const response = await fetch(heicUrl);
      const heicBlob = await response.blob();

      const jpegBlob = (await heic2any({
        blob: heicBlob,
        toType: 'image/jpeg',
        quality: 0.8,
      })) as Blob;

      const objectUrl = URL.createObjectURL(jpegBlob);
      this.displayImageUrl = objectUrl;

      // Guardar en caché para navegación rápida
      this.blobCache.set(heicUrl, objectUrl);

      this.isLoadingImage.set(false);
      console.log('Imagen HEIC convertida y lista para mostrar.');
    } catch (error) {
      console.error('Error al convertir la imagen HEIC:', error);
      this.imageLoadFailed.set(true);
      this.isLoadingImage.set(false);
    }
  }

  // --- LÓGICA DE DESCARGA (Tu código adaptado) ---

  async downloadCurrentPhoto(): Promise<void> {
    const url = this.currentOriginalUrl;
    if (!url) return;

    // Si ya tenemos un Blob URL generado (caso HEIC), lo usamos directo
    if (this.displayImageUrl && this.displayImageUrl.startsWith('blob:')) {
      this.triggerDownload(
        this.displayImageUrl,
        `evidencia_${this.currentIndex() + 1}.jpg`,
      );
      return;
    }

    // Si es una imagen normal, la descargamos como Blob para forzar la descarga
    this.isLoadingImage.set(true); // Feedback visual rápido
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        // Deducir extensión
        const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
        this.triggerDownload(
          objectUrl,
          `evidencia_${this.currentIndex() + 1}.${ext}`,
        );
        URL.revokeObjectURL(objectUrl); // Limpiar memoria
        this.isLoadingImage.set(false);
      },
      error: (err) => {
        console.error('Error descargando imagen', err);
        this.isLoadingImage.set(false);
      },
    });
  }

  private triggerDownload(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- NAVEGACIÓN ---

  nextPhoto(): void {
    if (this.currentIndex() < this.photos.length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.loadCurrentImage();
    }
  }

  prevPhoto(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.loadCurrentImage();
    }
  }

  // Eventos del tag <img>
  onImageLoadSuccess(): void {
    this.isLoadingImage.set(false);
  }

  onImageLoadError(): void {
    this.isLoadingImage.set(false);
    this.imageLoadFailed.set(true);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // Limpiar memoria de los Blobs creados
    this.blobCache.forEach((url) => URL.revokeObjectURL(url));
    this.blobCache.clear();
  }
}
