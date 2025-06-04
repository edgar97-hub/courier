import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PromotionalSetItem } from '../../settings/models/app-settings.interface';
import { AuthService } from '../../../core/services/auth.service';

// Interfaz para los datos de KPI
export interface KpiData {
  totalOrdersToday: number;
  ordersInTransit: number;
  ordersDeliveredToday: number;
  ordersWithIssuesToday: number;
}

// Interfaz para los datos del gráfico de estados (formato que espera ngx-charts)
export interface ChartDataEntry {
  name: string; // Nombre del estado
  value: number; // Cantidad de pedidos
}

// Interfaz para la respuesta completa del dashboard desde la API
export interface DashboardSummary {
  kpis: KpiData;
  statusDistribution: ChartDataEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        codrr_token: token,
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    // console.log('DashboardDataService: Fetching dashboard summary (simulated)');
    // // const mockSummary: DashboardSummary = {
    // //   kpis: {
    // //     totalOrdersToday: 120,
    // //     ordersInTransit: 25,
    // //     ordersDeliveredToday: 85,
    // //     ordersWithIssuesToday: 3,
    // //   },
    // //   statusDistribution: [
    // //     { name: 'Registrado', value: 15 },
    // //     { name: 'En Preparación', value: 20 },
    // //     { name: 'En Tránsito', value: 25 },
    // //     { name: 'Entregado', value: 85 },
    // //     { name: 'Incidencia', value: 3 },
    // //     { name: 'Cancelado', value: 5 },
    // //   ],
    // // };
    // // return of(mockSummary).pipe(delay(800));

    return this.http
      .get<DashboardSummary>(this.apiUrl + '/orders/dashboard/data')
      .pipe(
        tap((data) => console.log('Dashboard summary fetched:', data)),
        catchError(this.handleError)
      );
  }

  getPromotionalSets(): Observable<PromotionalSetItem> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .get<PromotionalSetItem>(
        environment.apiUrl + '/settings/promotional-sets',
        { headers }
      )
      .pipe(
        tap((data) => console.log('Error loading promotional sets:', data)),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error fetching dashboard data:', error);
    return throwError(
      () => new Error('Could not load dashboard data. Please try again later.')
    );
  }
}
