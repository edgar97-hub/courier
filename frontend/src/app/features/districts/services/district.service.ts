import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { District } from '../models/district.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

// REEMPLAZA CON LA URL BASE DE TU API DE DISTRITOS
const API_BASE_URL = 'URL_DE_TU_API/districts'; // Ejemplo: http://localhost:3000/api/districts

@Injectable({
  providedIn: 'root', // O proveerlo en las rutas de districts si es específico
})
export class DistrictService {
  readonly apiUrl = environment.apiUrl + '/districts';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Para el autocompletado de nombres de distrito
  // Este BehaviorSubject almacenará una lista de nombres de distritos únicos cargados.
  private districtNamesSubject = new BehaviorSubject<string[]>([]);
  districtNames$ = this.districtNamesSubject.asObservable();
  private loadedDistrictNames = false; // Para cargar solo una vez

  constructor() {
    this.loadDistrictNamesForAutocomplete().subscribe(); // Cargar al inicio
  }
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

  getDistricts(
    page: number = 1,
    limit: number = 10,
    sort: string = 'name', // Campo por defecto para ordenar
    order: 'asc' | 'desc' = 'asc',
    searchTerm?: string
  ): Observable<{ data: District[]; total: number }> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let params = new HttpParams()
      .set('page_number', parseInt(page.toString()) || 1)
      .set('page_size', limit.toString())
      .set('sort_field', sort)
      .set('sort_directionr', order);
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http
      .get<{ data: District[]; total: number }>(this.apiUrl, {
        params,
        headers,
      })
      .pipe(
        // delay(500), // Simular latencia
        tap((response) => console.log('Fetched districts:', response)),
        catchError(this.handleError)
      );
  }

  getDistrictById(id: string | number): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap((district) => {
        console.log(
          'SERVICE: HTTP GET successful, received district:',
          district
        );
      }),
      delay(300), // Considera comentar el delay durante la depuración
      catchError((errorResponse) => {
        console.error('SERVICE: HTTP GET failed:', errorResponse);
        return this.handleError(errorResponse); // Asegúrate que handleError relance un error observable
      })
    );
  }

  createDistrict(
    district: Omit<District, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<District> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .post<District>(this.apiUrl + '/register', district, { headers })
      .pipe(
        tap((newDistrict) => {
          console.log('Created district:', newDistrict);
          this.addDistrictNameToAutocomplete(newDistrict.name);
        }),
        catchError(this.handleError)
      );
  }

  updateDistrict(
    id: string | number,
    district: Partial<District>
  ): Observable<District> {
    const {
      id: districtId,
      createdAt,
      updatedAt,
      ...updatePayload
    } = district as District;
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .put<District>(`${this.apiUrl}/edit/${id}`, updatePayload, { headers })
      .pipe(
        tap((updatedDistrict) => {
          console.log('Updated district:', updatedDistrict);
          this.addDistrictNameToAutocomplete(updatedDistrict.name); // Actualizar lista
        }),
        catchError(this.handleError)
      );
  }

  deleteDistrict(id: string | number): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .delete<void>(`${this.apiUrl}/delete/${id}`, { headers })
      .pipe(
        tap(() => console.log(`Deleted district with id: ${id}`)),
        catchError(this.handleError)
      );
  }

  // --- Lógica para Autocompletado de Nombres de Distrito ---
  loadDistrictNamesForAutocomplete(): Observable<any[]> {
    if (
      this.loadedDistrictNames &&
      this.districtNamesSubject.value.length > 0
    ) {
      return this.districtNames$; // Devolver cacheados si ya se cargaron
    }
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    console.log('DistrictService: Loading district names for autocomplete...');
    return this.http.get<any[]>(`${this.apiUrl}?limit=1000`, { headers }).pipe(
      map((districts: any) => {
        const names = districts?.items.map((d: any) => d.name);
        const uniqueNames = [...new Set(names)].sort();
        this.districtNamesSubject.next(uniqueNames as string[]);
        this.loadedDistrictNames = true;
        console.log('DistrictService: Loaded unique names:', uniqueNames);
        return uniqueNames;
      }),
      catchError((err) => {
        console.error('Error loading district names for autocomplete', err);
        this.loadedDistrictNames = false; // Permitir reintentar
        return of([]); // Devolver array vacío en caso de error
      })
    );
  }

  private addDistrictNameToAutocomplete(name: string): void {
    const currentNames = this.districtNamesSubject.value;
    if (name && !currentNames.includes(name)) {
      const updatedNames = [...currentNames, name].sort();
      this.districtNamesSubject.next(updatedNames);
    }
  }

  // Filtro para el autocompletado (se puede llamar desde el componente)
  filterDistrictNames(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return this.districtNames$.pipe(
      map((names) =>
        names.filter((name) => name.toLowerCase().includes(filterValue))
      )
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let userMessage = 'An error occurred. Please try again later.';
    if (error.error instanceof ErrorEvent) {
      userMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status === 404) {
      userMessage = 'The requested resource was not found.';
    } else if (error.status === 400 && error.error?.message) {
      // Si el backend envía un array de mensajes (class-validator)
      if (Array.isArray(error.error.message)) {
        userMessage = error.error.message.join(', ');
      } else {
        userMessage = error.error.message;
      }
    } else if (error.status === 500) {
      userMessage = 'A server error occurred. Please contact support.';
    }
    return throwError(() => new Error(userMessage));
  }
}
