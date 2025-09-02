import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ImportResult } from '../components/planning-event-import-modal/planning-event-import-modal.component'; // Assuming ImportResult is defined there
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import {
  PaginatedPlanningEventsResponse,
  PlanningEvent,
} from '../models/planning-event.model';
import { PlanningEventFilterCriteria } from '../models/planning-event-filter.model';

@Injectable({
  providedIn: 'root',
})
export class PlanningEventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/planning-events`;
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

  getPlanningEvents(
    filters: PlanningEventFilterCriteria,
    page: number,
    pageSize: number,
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ): Observable<PaginatedPlanningEventsResponse> {
    let params = new HttpParams()
      .set('page_number', page.toString())
      .set('page_size', pageSize.toString())
      .set('sort_field', sortField)
      .set('sort_direction', sortDirection);
    if (filters.startDate) {
      params = params.set('start_date', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('end_date', filters.endDate);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http
      .get<PaginatedPlanningEventsResponse>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getPlanningEventDetails(id: string): Observable<PlanningEvent> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('Not authenticated to fetch planning event details.')
      );
    }
    return this.http
      .get<PlanningEvent>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  importPlanningEventsFromParsedJson(
    jsonData: any[]
  ): Observable<ImportResult> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .post<ImportResult>(`${this.apiUrl}/import-batch-json`, jsonData, {
        headers,
      })
      .pipe(catchError(this.handleImportError));
  }

  private handleImportError(error: HttpErrorResponse): Observable<never> {
    console.error('API Import Error:', error);
    let result: ImportResult = {
      success: false,
      message: 'Error de comunicación con el servidor durante la importación.',
      errors: [
        {
          row: 0,
          message: `Error: ${error.status} - ${
            error.statusText || 'Error desconocido'
          }`,
        },
      ],
    };
    if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      result = { ...result, ...error.error }; // Sobrescribir con el error del backend
    }
    return throwError(() => result); // Devolver el objeto ImportResult para que el componente lo maneje
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.message || error.error?.message || 'Server error'
      }`;
      if (error.status === 0) {
        errorMessage =
          'Could not connect to the server. Please check your network or if the server is running.';
      }
    }
    console.error('API Error in PlanningEventsService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
