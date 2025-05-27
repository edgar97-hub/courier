import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from '../../../core/services/auth.service'; // Asumo que está en core
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly apiUrl = environment.apiUrl + '/users';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {
    console.log('UserService (NgRx integrated) initialized');
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

  // Obtener todos los usuarios (para ser llamado por un Effect de NgRx)
  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http.get<User[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map((users) => users || []),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('Not authenticated to fetch user by ID.')
      );
    }
    return this.http
      .get<User>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  createUser(user: User): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http
      .post<User>(this.apiUrl + '/register', user, { headers })
      .pipe(
        tap((createdUser) =>
          console.log('UserService: User created via API', createdUser)
        ),
        catchError(this.handleError)
      );
  }

  updateUser(user: User): Observable<User> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to update user.'));
    }
    return this.http
      .put<User>(`${this.apiUrl}/edit/${user.id}`, user, { headers })
      .pipe(catchError(this.handleError));
  }

  // Eliminar un usuario (para ser llamado por un Effect de NgRx)
  deleteUser(id: string): Observable<{}> {
    // La API podría devolver un cuerpo vacío o un mensaje
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to delete user.'));
    }
    console.log(`UserService: Deleting user via API, ID: ${id}`);
    return this.http
      .delete<{}>(`${this.apiUrl}/delete/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred in UserService!';
    // ... (tu lógica de handleError existente, que es buena) ...
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 401) {
        errorMessage =
          'Unauthorized. Your session may have expired or you lack permissions.';
        // Considerar despachar una acción de logout desde un Effect si ocurre un 401
      } else if (error.status === 403) {
        errorMessage = 'Forbidden. You do not have permission for this action.';
      }
    }
    console.error('UserService API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
