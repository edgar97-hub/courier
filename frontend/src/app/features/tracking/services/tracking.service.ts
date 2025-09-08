import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { TrackingOrder } from '../models/tracking-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root', // O en el módulo de tracking si es lazy loaded y exclusivo
})
export class TrackingService {
  readonly API_TRACKING_URL = environment.apiUrl + '/orders';
  private http = inject(HttpClient);

  getOrderByTrackingCode(
    trackingCode: string
  ): Observable<TrackingOrder | null> {
    if (!trackingCode || trackingCode.trim() === '') {
      return of(null);
    }
    console.log(
      `TrackingService: Fetching order with tracking code: ${trackingCode}`
    );
    return this.http
      .get<TrackingOrder>(this.API_TRACKING_URL + '/tracking', {
        params: new HttpParams().set('tracking_code', trackingCode.trim()),
      })
      .pipe(
        tap((order) => console.log('TrackingService: Fetched order:', order)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error in TrackingService:', error);
    let userMessage =
      'No se pudo obtener la información del pedido. Por favor, intente más tarde.';

    if (error.status === 404) {
      userMessage =
        'Código de seguimiento no encontrado. Verifique el código e intente de nuevo.';
    } else if (
      error.error &&
      typeof error.error === 'string' &&
      error.error.length < 100
    ) {
      userMessage = error.error; // Usar mensaje de error del backend si es simple
    } else if (error.message) {
      // userMessage = error.message; // Puede ser muy técnico
    }
    // Siempre devuelve un error que el componente pueda manejar
    return throwError(() => new Error(userMessage));
  }
}
