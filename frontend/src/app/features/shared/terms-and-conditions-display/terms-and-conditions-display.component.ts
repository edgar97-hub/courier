import {
  Component,
  Input,
  signal,
  WritableSignal,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
// MatDialogModule y MatDialog no se usan en este componente, considera quitarlos si no son necesarios
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsService } from '../../settings/services/settings.service'; // Ajusta la ruta
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <--- IMPORTAR DomSanitizer

@Component({
  selector: 'app-terms-conditions-display',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    // MatDialogModule, // Quitar si no se usa
  ],
  templateUrl: './terms-conditions-display.component.html', // Usaremos un template externo por claridad
  styleUrls: ['./terms-conditions-display.component.scss'], // Usaremos SCSS externo
})
export class TermsConditionsDisplayComponent implements OnInit, OnDestroy {
  // Si la URL siempre viene del servicio, este Input podría no ser necesario
  // @Input() pdfUrlInput!: string | null | undefined;

  @Input() containerHeight: string = '70vh'; // Altura por defecto del contenedor del PDF
  @Input() containerWidth: string = '100%';
  @Input() enableSpinner: boolean = true;
  @Input() enableErrorIcon: boolean = true;

  isLoading: WritableSignal<boolean> = signal(true); // Iniciar en true ya que cargamos en ngOnInit
  hasError: WritableSignal<boolean> = signal(false);
  // pdfUrl: WritableSignal<string | null> = signal(null); // Usaremos una URL saneada
  safePdfUrl: WritableSignal<SafeResourceUrl | null> = signal(null); // <--- PARA URL SANEADA

  private settingsService = inject(SettingsService);
  private sanitizer = inject(DomSanitizer); // <--- INYECTAR DomSanitizer
  private destroy$ = new Subject<void>();
  // private dialog = inject(MatDialog); // Quitar si no se usa

  ngOnInit(): void {
    this.loadPdfUrlFromSettings();
  }

  private loadPdfUrlFromSettings(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.safePdfUrl.set(null);

    this.settingsService
      .loadSettings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)) // Asegura que isLoading se ponga en false
      )
      .subscribe({
        next: (loadedSettings: any) => {
          // Tipar 'any' temporalmente, idealmente definir una interfaz para Settings
          console.log('Settings loaded:', loadedSettings);
          // Asumimos que loadedSettings es un array y queremos el primer elemento
          // y que la URL está en loadedSettings[0].terms_conditions_url
          const settingsEntry =
            loadedSettings && loadedSettings.length > 0
              ? loadedSettings[0]
              : null;
          const urlFromApi = settingsEntry?.terms_conditions_url;

          if (urlFromApi) {
            console.log('Terms conditions URL from API:', urlFromApi);
            // Sanea la URL antes de usarla en <embed> o <iframe>
            this.safePdfUrl.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(urlFromApi)
            );
            this.hasError.set(false);
          } else {
            console.warn(
              'TermsConditionsDisplayComponent: terms_conditions_url is missing or empty in settings.'
            );
            this.hasError.set(true);
          }
        },
        error: (err) => {
          this.hasError.set(true);
          console.error('Error loading settings for PDF URL:', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  retryLoad(): void {
    this.loadPdfUrlFromSettings();
  }
}
