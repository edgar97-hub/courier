import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  WritableSignal,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list'; // Para la línea de tiempo
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil, tap, finalize, distinctUntilChanged } from 'rxjs/operators';

import { TrackingService } from '../../services/tracking.service';
import {
  TrackingOrder,
  TrackingOrderLog,
} from '../../models/tracking-order.model';
// Opcional: Un componente específico para la línea de tiempo
// import { TrackingTimelineComponent } from '../../components/tracking-timeline/tracking-timeline.component';
import { DefaultPipe } from '../../../../shared/pipes/default.pipe'; // <--- IMPORTA TU PIPE (ajusta la ruta)
@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Si tienes enlaces, ej. "Volver al inicio"
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    DatePipe,
    TitleCasePipe,
    DefaultPipe,
    // TrackingTimelineComponent, // Si lo creas
  ],
  templateUrl: './tracking-page.component.html',
  styleUrls: ['./tracking-page.component.scss'],
})
export class TrackingPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private trackingService = inject(TrackingService);

  trackingForm: FormGroup;
  trackedOrder: WritableSignal<TrackingOrder | null> = signal(null);
  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  searchAttempted: WritableSignal<boolean> = signal(false); // Para saber si ya se buscó

  private destroy$ = new Subject<void>();

  constructor() {
    this.trackingForm = this.fb.group({
      trackingCode: ['', [Validators.required, Validators.minLength(5)]], // Ajusta validadores
    });

    // Reaccionar a cambios en los parámetros de la URL para el código de tracking
    this.route.queryParamMap
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(
          (prev, curr) => prev.get('code') === curr.get('code')
        )
      )
      .subscribe((params) => {
        const codeFromUrl = params.get('code');
        console.log('codeFromUrl', codeFromUrl);
        if (codeFromUrl) {
          this.trackingForm.patchValue({ trackingCode: codeFromUrl });
          this.submitTracking();
        }
      });
  }

  ngOnInit(): void {
    // No se necesita nada especial aquí si el constructor ya maneja el param de la URL
  }

  get trackingCodeCtrl() {
    return this.trackingForm.get('trackingCode');
  }

  submitTracking(): void {
    this.searchAttempted.set(true);
    this.errorMessage.set(null);
    this.trackedOrder.set(null); // Limpiar resultados anteriores

    if (this.trackingForm.invalid) {
      this.trackingForm.markAllAsTouched();
      return;
    }

    const code = this.trackingCodeCtrl?.value.trim();
    if (!code) return;

    this.isLoading.set(true);

    // Actualizar la URL sin recargar la página (opcional, pero bueno para compartir)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { code: code },
      queryParamsHandling: 'merge', // Conserva otros queryParams si los hubiera
    });

    this.trackingService
      .getOrderByTrackingCode(code)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (order) => {
          this.trackedOrder.set(order);
          if (!order) {
            // Si el servicio devuelve null en lugar de error 404 manejado
            this.errorMessage.set('Código de seguimiento no encontrado.');
          }
        },
        error: (err) => {
          this.trackedOrder.set(null);
          this.errorMessage.set(
            err.message || 'Ocurrió un error al buscar el pedido.'
          );
        },
      });
  }

  // Función para determinar el icono de la línea de tiempo
  getTimelineIcon(log: TrackingOrderLog): string {
    const action = log.newValue?.toUpperCase() || "";
    if (action.includes('ENTREGADO')) return 'check_circle';
    if (action.includes('TRANSITO') || action.includes('RECOGIDO'))
      return 'local_shipping';
    if (action.includes('ALMACEN')) return 'inventory_2';
    if (action.includes('REGISTRADO')) return 'receipt_long';
    if (action.includes('CANCELADO')) return 'cancel';
    if (action.includes('RECHAZADO')) return 'report_problem';
    if (action.includes('REPROGRAMADO')) return 'event_repeat';
    return 'fiber_manual_record'; // Icono por defecto
  }

  // Función para el color del icono de la línea de tiempo
  getTimelineIconColor(
    log: TrackingOrderLog
  ): 'primary' | 'accent' | 'warn' | undefined {
    const action = log.action.toUpperCase();
    if (action.includes('ENTREGADO')) return 'primary'; // O un color verde específico
    if (
      action.includes('CANCELADO') ||
      action.includes('INCIDENCIA') ||
      action.includes('NO_ENTREGADO')
    )
      return 'warn';
    return undefined; // Color por defecto de mat-icon
  }

  getStatusBadgeClass(status: string | undefined | null): string {
    if (!status) {
      return 'status-desconocido'; // Clase por defecto o para manejar nulos/undefined
    }
    // Convierte a minúsculas y reemplaza espacios o guiones bajos con un guion simple
    const formattedStatus = status
      .toString()
      .toLowerCase()
      .replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }

  openMap(coordinates?: string): void {
    if (coordinates) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
        '_blank'
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
