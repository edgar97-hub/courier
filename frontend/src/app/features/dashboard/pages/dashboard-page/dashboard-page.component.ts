import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button'; // Para el botón de reintentar
import { MatIconModule } from '@angular/material/icon'; // Para el icono de error
import { Observable, Subject, of } from 'rxjs'; // 'of' para el caso de error
import { takeUntil, tap, catchError } from 'rxjs/operators';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { StatusDistributionChartComponent } from '../../components/status-distribution-chart/status-distribution-chart.component';
import {
  DashboardDataService,
  DashboardSummary,
} from '../../services/dashboard-data.service'; // KpiData y ChartDataEntry ya están en DashboardSummary
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../../environments/environment';
import { PromotionalSetItem } from '../../../settings/models/app-settings.interface';
import { HttpClient } from '@angular/common/http';
import { ImageSliderComponent } from '../../components/image-slider/image-slider.component'; // <--- IMPORTA EL SLIDER

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatButtonModule, // Añadido
    MatIconModule, // Añadido
    MatCardModule,
    ImageSliderComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  private dashboardDataService = inject(DashboardDataService);
  private destroy$ = new Subject<void>();
  private apiUrl = `${environment.apiUrl}/settings`;

  dashboardSummary$: Observable<DashboardSummary | null> | undefined; // Puede ser null si hay error
  promotionalSlides = signal<PromotionalSetItem[]>([]); // Inicializa como array vacío
  isLoading = true; // Para la carga inicial de toda la data del dashboard
  loadError = false; // Para manejar errores de carga

  ngOnInit(): void {
    this.loadAllDashboardData();
  }

  loadAllDashboardData(): void {
    this.isLoading = true;
    this.loadError = false; // Resetear error al reintentar
    this.dashboardSummary$ = this.dashboardDataService
      .getDashboardSummary()
      .pipe(
        takeUntil(this.destroy$),
        tap((summary) => {
          this.isLoading = false;
          if (!summary) {
            this.loadError = true;
          }
        }),
        catchError((err) => {
          this.isLoading = false;
          this.loadError = true;
          console.error('Dashboard Page: Error loading summary', err);
          return of(null); // Devuelve un observable que emite null para que el async pipe no rompa
        })
      );

    // Cargar slides promocionales
    this.dashboardDataService
      .getPromotionalSets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slides: any) => {
          this.promotionalSlides.set(
            slides.filter(
              (slide: any) => slide.isActive !== false && slide.imageUrl
            )
          ); // Filtra activos y con imagen
          // Marcamos la carga como completa después de que ambas llamadas (o las que sean) terminen.
          // Si las llamadas son independientes, puedes usar forkJoin o simplemente el último finalize.
        },
        error: (err) => {
          console.error(
            'Dashboard Page: Error loading promotional slides',
            err
          );
          // No necesariamente un error fatal para todo el dashboard
        },
        // complete: () => {
        //   // Podrías poner isLoading a false aquí si esta es la última llamada,
        //   // o usar un contador/forkJoin para todas las llamadas del dashboard.
        //   // Para simplificar, lo pondremos aquí asumiendo que el summary es más rápido o igual.
        //   this.dashboardSummary$
        //     ?.pipe(takeUntil(this.destroy$))
        //     .subscribe(() => (this.isLoading = false));
        // },
      });
  }

  // getPromotionalSets(): Observable<PromotionalSetItem[]> {
  //   return this.http
  //     .get<PromotionalSetItem[]>(`${this.apiUrl}/promotional-sets`)
  //     .pipe(
  //       tap((sets) => console.log('Promotional sets loaded:', sets)),
  //       catchError((err) => {
  //         console.error('Error loading promotional sets:', err);
  //         return of([]);
  //       })
  //     );
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
