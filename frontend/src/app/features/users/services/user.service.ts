import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface PaginatedUsersResponse {
  items: User[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface PaginatedUsersParams {
  page_number?: number;
  page_size?: number;
  sort_field?: string;
  sort_direction?: 'ASC' | 'DESC';
  search_term?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.apiUrl + '/users';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

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

  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map((users) => users || []),
      catchError(this.handleError)
    );
  }

  getUsersFiltered(params: {
    search_term?: string;
    role?: string;
    fulfillment_enabled?: boolean;
  }): Observable<User[]> {
    const headers = this.getAuthHeaders();
    let httpParams = new HttpParams();
    if (params.search_term) {
      httpParams = httpParams.set('search_term', params.search_term);
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.fulfillment_enabled !== undefined) {
      httpParams = httpParams.set('fulfillment_enabled', String(params.fulfillment_enabled));
    }
    return this.http.get<User[]>(`${this.apiUrl}/filtered`, {
      headers,
      params: httpParams,
    }).pipe(
      map((users) => users || []),
      catchError(this.handleError)
    );
  }

  getUsersPaginated(params: PaginatedUsersParams): Observable<PaginatedUsersResponse> {
    const headers = this.getAuthHeaders();
    let httpParams = new HttpParams();
    httpParams = httpParams.set('page_number', String(params.page_number ?? 1));
    httpParams = httpParams.set('page_size', String(params.page_size ?? 20));
    httpParams = httpParams.set('sort_field', params.sort_field ?? 'code');
    httpParams = httpParams.set('sort_direction', params.sort_direction ?? 'ASC');
    if (params.search_term) {
      httpParams = httpParams.set('search_term', params.search_term);
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }
    return this.http.get<PaginatedUsersResponse>(`${this.apiUrl}/paginated`, {
      headers,
      params: httpParams,
    }).pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createUser(dto: CreateUserDto): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.post<User>(`${this.apiUrl}/register`, dto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/edit/${id}`, dto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/update-profile/${user.id}`, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<{}> {
    const headers = this.getAuthHeaders();
    return this.http.delete<{}>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'Ocurrió un error inesperado.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error del servidor: ${error.status}. ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
