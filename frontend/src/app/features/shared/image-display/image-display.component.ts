import {
  Component,
  Input,
  signal,
  WritableSignal,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component'; // Import ImageDialogComponent
import { SettingsService } from '../../settings/services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-image-display',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
  ],
  templateUrl: './image-display.component.html',
  styleUrls: ['./image-display.component.scss'],
})
export class ImageDisplayComponent implements OnInit {
  @Input({ required: true }) imageUrl!: string | null | undefined; // URL de la imagen
  @Input() altText: string = 'Displayed image'; // Texto alternativo
  @Input() containerHeight: string = '100px'; // Altura por defecto del contenedor
  @Input() containerWidth: string = '100%'; // Ancho por defecto del contenedor
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' =
    'contain'; // Cómo se ajusta la imagen
  @Input() enableSpinner: boolean = true; // Mostrar spinner mientras carga
  @Input() enableErrorIcon: boolean = true; // Mostrar icono de error si falla

  // Señales para manejar estados internos
  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);
  isLoaded: WritableSignal<boolean> = signal(false); // Para aplicar estilos una vez cargada

  processedImageUrl: WritableSignal<string | null> = signal(null);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();
  private dialog = inject(MatDialog); // Inject MatDialog

  ngOnInit(): void {
    this.settingsService
      .loadSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loadedSettings: any) => {
          if (loadedSettings.length) {
            this.isLoaded.set(false);
            this.hasError.set(false);

            if (!loadedSettings[0].rates_image_url) {
              this.isLoading.set(false);
              this.hasError.set(true); // Considerar URL nula/vacía como error o manejar diferente
              this.processedImageUrl.set(null);
              console.warn(
                'ImageDisplayComponent: imageUrl is null or undefined.'
              );
              return;
            }

            console.log(
              'loadedSettings[0].rates_image_url',
              loadedSettings[0].rates_image_url
            );
            this.processedImageUrl.set(loadedSettings[0].rates_image_url); // Asigna la URL para ser usada en el template
            if (this.enableSpinner) {
              this.isLoading.set(true);
            }
            this.openImageDialog(); // Open the dialog when the image is loaded
          }
        },
        error: (err) => {
          console.log('err', err);
        },
      });
  }

  openImageDialog(): void {
    this.dialog.open(ImageDialogComponent, {
      data: {
        imageUrl: this.processedImageUrl(),
        altText: this.altText,
      },
      panelClass: 'image-dialog', // Add a custom panel class
    });
  }
}
