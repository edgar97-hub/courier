import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  CashMovement,
  CashMovementQuery,
  DetailedCashMovementSummary,
  CreateCashMovement,
  CashMovementPaginatedResponse
} from '../models/cash-movement.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CashManagementService {
  private apiUrl = `${environment.apiUrl}/cash-management`;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

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

  getAllCashMovements(query?: CashMovementQuery, pageNumber: number = 1, pageSize: number = 10): Observable<CashMovementPaginatedResponse> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch cash movements.'));
    }
    let params = new HttpParams();
    if (query) {
      for (const key in query) {
        if (query.hasOwnProperty(key) && query[key]) {
          params = params.append(key, query[key] as string);
        }
      }
    }
    params = params.append('page_number', pageNumber.toString());
    params = params.append('page_size', pageSize.toString());

    return this.http.get<CashMovementPaginatedResponse>(`${this.apiUrl}/movements`, {
      params,
      headers,
    });
  }

  getCashMovementSummary(
    query?: CashMovementQuery
  ): Observable<DetailedCashMovementSummary> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch cash movement summary.'));
    }
    let params = new HttpParams();
    if (query) {
      for (const key in query) {
        if (query.hasOwnProperty(key) && query[key]) {
          params = params.append(key, query[key] as string);
        }
      }
    }
    return this.http.get<DetailedCashMovementSummary>(`${this.apiUrl}/detailed-summary`, {
      params,
      headers,
    });
  }

  createManualMovement(movement: CreateCashMovement): Observable<CashMovement> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to create cash movement.'));
    }
    return this.http.post<CashMovement>(
      `${this.apiUrl}/manual-movement`,
      movement,
      { headers }
    );
  }

  updateCashMovement(id: string, movement: CreateCashMovement): Observable<CashMovement> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to update cash movement.'));
    }
    return this.http.put<CashMovement>(`${this.apiUrl}/${id}`, movement, { headers });
  }

  deleteCashMovement(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to delete cash movement.'));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  generatePdf(id: string): Observable<Blob> {
    const headers = this.getAuthHeaders().set('Accept', 'application/pdf');
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to generate PDF.'));
    }
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      headers,
      responseType: 'blob' // Important for handling binary data like PDF
    });
  }
}
