import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DistributorRegistration } from '../models/distributor-registration.model';
import { AuthService } from '../../../core/services/auth.service';
import { ImportResult } from '../../orders/components/order-import-modal/order-import-modal.component';

/**
 * Interfaz para tipar la respuesta paginada que viene del backend.
 */
export interface PaginatedRegistrations {
  data: DistributorRegistration[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class DistributorRegistrationService {
  private http = inject(HttpClient);
  // Asegúrate de que el endpoint coincida con tu backend.
  private apiUrl = `${environment.apiUrl}/distributor-records`;

  private authService = inject(AuthService);

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

  /**
   * Obtiene una lista paginada, ordenada y filtrada de registros.
   * Este método es utilizado por la tabla inteligente (server-side).
   * @param page El número de página a solicitar.
   * @param limit La cantidad de registros por página.
   * @param sortField El campo por el cual ordenar.
   * @param sortOrder La dirección del orden ('ASC' o 'DESC').
   * @param search El término de búsqueda a aplicar.
   */
  getMyRegistrationsPaginated(
    page: number,
    limit: number,
    sortField: string,
    sortOrder: string,
    search: string,
    startDate: Date | null,
    endDate: Date | null
  ): Observable<PaginatedRegistrations> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    let params = new HttpParams()
      .set('page', page?.toString())
      .set('limit', limit?.toString())
      .set('sortField', sortField)
      .set('sortOrder', sortOrder)
      .set('startDate', startDate?.toISOString() ?? '')
      .set('endDate', endDate?.toISOString() ?? '');

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedRegistrations>(this.apiUrl, {
      params,
      headers,
    });
  }

  /**
   * Envía los datos de un nuevo registro manual al backend para su creación.
   * @param dto Los datos del formulario.
   */
  createRegistration(dto: any): Observable<DistributorRegistration> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http.post<DistributorRegistration>(
      this.apiUrl + '/create',
      dto,
      { headers }
    );
  }

  /**
   * Actualiza un registro existente.
   * @param id El ID del registro a actualizar.
   * @param dto Los campos a modificar.
   */
  updateRegistration(
    id: string,
    dto: any
  ): Observable<DistributorRegistration> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('No autenticado para actualizar registro.')
      );
    }
    return this.http.patch<DistributorRegistration>(
      `${this.apiUrl}/${id}`,
      dto,
      { headers }
    );
  }

  /**
   * Elimina un registro existente.
   * @param id El ID del registro a eliminar.
   */
  deleteRegistration(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('No autenticado para eliminar registro.')
      );
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Sube un archivo Excel para la creación masiva de registros.
   * @param file El archivo seleccionado por el usuario.
   */
  importOrdersFromParsedJson(parsedOrders: any[]): Observable<any> {
    console.log(
      'OrderService: Sending parsed JSON to backend for import',
      parsedOrders
    );

    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .post<any>(`${this.apiUrl}/import-batch-json`, parsedOrders, {
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
    // Si el backend devuelve un objeto ImportResult en el cuerpo del error:
    if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      result = { ...result, ...error.error }; // Sobrescribir con el error del backend
    }
    return throwError(() => result); // Devolver el objeto ImportResult para que el componente lo maneje
  }

  /**
   * Descarga la plantilla de Excel desde el backend.
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' });
  }
}
