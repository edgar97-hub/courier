import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private dashboardDataService = inject(DashboardDataService);
  private destroy$ = new Subject<void>();

  dashboardSummary$: Observable<DashboardSummary | null> | undefined; // Puede ser null si hay error
  isLoading = true; // Para la carga inicial de toda la data del dashboard
  loadError = false; // Para manejar errores de carga

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.loadError = false; // Resetear error al reintentar
    this.dashboardSummary$ = this.dashboardDataService
      .getDashboardSummary()
      .pipe(
        takeUntil(this.destroy$),
        tap((summary) => {
          this.isLoading = false;
          if (!summary) {
            // Si el servicio devuelve null en caso de error manejado internamente
            this.loadError = true;
          }
          // console.log('Dashboard summary received:', summary);
        }),
        catchError((err) => {
          this.isLoading = false;
          this.loadError = true; // Marcar que hubo un error
          console.error('Dashboard Page: Error loading summary', err);
          // El servicio ya podría haber manejado el mensaje al usuario,
          // o podrías hacerlo aquí con MatSnackBar si lo prefieres.
          return of(null); // Devuelve un observable que emite null para que el async pipe no rompa
        })
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
