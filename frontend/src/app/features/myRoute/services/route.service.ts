import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface Stop {
  orderId: string;
  sequenceOrder: number;
  plannedStartTime: string;
  address: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  customerName: string;
  notes: string;
}

interface Route {
  id: number;
  routeIdExternal: string;
  driverCode: string;
  vehicle: string;
  startingPoint: string;
  completionPoint: string;
  planningEventId: number;
  stops: Stop[];
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/routes`;
  private authService = inject(AuthService);

  constructor() {}
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // ESTÁNDAR
        codrr_token: token, // Como lo tenías
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  getMyRoutesByDate(date: string): Observable<Route[]> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('Not authenticated to fetch planning event details.')
      );
    }
    return this.http.get<Route[]>(`${this.apiUrl}/my-routes?date=${date}`, {
      headers,
    });
  }
}
