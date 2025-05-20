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
      // El Effect o el interceptor deberían manejar la redirección o el error de no autenticado
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    console.log('UserService: Fetching all users from API');
    return this.http.get<User[]>(`${this.apiUrl}/all`, { headers }).pipe(
      map((users) => users || []), // Asegurar que devuelve un array, incluso si la API devuelve null
      catchError(this.handleError)
    );
  }

  // Obtener un usuario por ID (para ser llamado por un Effect de NgRx)
  getUserById(id: string): Observable<User> {
    // Asumimos que la API devuelve un User o un error
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(
        () => new Error('Not authenticated to fetch user by ID.')
      );
    }
    console.log(`UserService: Fetching user by ID: ${id}`);
    return this.http
      .get<User>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo usuario (para ser llamado por un Effect de NgRx)
  createUser(userData: Omit<User, 'id'>): Observable<User> {
    const headers = this.getAuthHeaders();
    // if (!this.authService.getAccessToken()) { // Podrías chequear aquí o confiar en el interceptor/backend
    //   return throwError(() => new Error('Not authenticated to create user.'));
    // }
    console.log(
      `UserService: Attempting to create user - POST`,
      `${this.apiUrl}/register`,
      userData
    );
    return this.http
      .post<User>(this.apiUrl + '/register', userData, { headers })
      .pipe(
        tap((createdUser) =>
          console.log('UserService: User created via API', createdUser)
        ),
        catchError(this.handleError)
      );
  }
  // Actualizar un usuario existente (para ser llamado por un Effect de NgRx)
  updateUser(user: User): Observable<User> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to update user.'));
    }
    console.log('UserService: Updating user via API', user);
    // Asegúrate de que el endpoint sea el correcto para tu API (ej. /users/:id o /users/edit/:id)
    return (
      this.http
        .put<User>(`${this.apiUrl}/edit/${user.id}`, user, { headers }) // Cambiado a /users/:id
        // o si tu API realmente usa /edit/:id
        // return this.http.put<User>(`${this.apiUrl}/edit/${user.id}`, user, { headers })
        .pipe(catchError(this.handleError))
    );
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
