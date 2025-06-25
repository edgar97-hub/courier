import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { Credentials } from '../../features/login/models/credentials.interface';
import { AuthResponse } from '../../features/login/models/auth-response.interface';
import { User } from '../../features/login/models/user.interface';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly isAuthenticated: WritableSignal<boolean> = signal(false);
  readonly currentUser: WritableSignal<User | null> = signal(null);
  readonly loginUrl = environment.apiUrl + '/auth/login';
  readonly usersUrl = environment.apiUrl + '/users';

  constructor() {
    this.loadSessionFromStorage();
  }

  private loadSessionFromStorage(): void {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userJson = localStorage.getItem(USER_INFO_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
        console.log('AuthService: Session loaded from storage.', user);
      } catch (e) {
        console.error('AuthService: Error parsing user from storage.', e);
        this.clearUserSessionAndSignals();
      }
    } else {
      this.clearUserSessionAndSignals();
    }
  }

  private storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private storeUserInfo(user: User): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  }

  private clearUserSessionAndSignals(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  getCurrentUserFromBackend(): Observable<User> {
    const token = this.getAccessToken();
    let headers;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        codrr_token: token,
      });
    }

    return this.http.get<User>(`${this.usersUrl}/perfil/me`, { headers }).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.storeUserInfo(user);
        this.isAuthenticated.set(true);
        console.log('AuthService: Usuario actualizado desde el backend', user);
      }),
      catchError((error) => {
        console.error(
          'Error al obtener el usuario actual desde el backend',
          error
        );
        this.clearUserSessionAndSignals();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return of({} as AuthResponse);
    }
    const body = { refreshToken: refreshToken };
    return this.http.post<any>(environment.apiUrl + '/auth/refresh', body).pipe(
      tap((authResponse: AuthResponse) => {
        this.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        console.log('AuthService: Token refreshed successfully.');
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    const body = { email: credentials.email, password: credentials.password };
    return this.http.post<any>(this.loginUrl, body).pipe(
      delay(1000),
      map((response) => {
        const simulatedUser: User = {
          id: response.user.id,
          role: response.user.role,
          email: credentials.email,
          username: credentials.email.split('@')[0],
        };
        return {
          accessToken: response.accessToken,
          user: simulatedUser,
        } as AuthResponse;
      }),
      tap((authResponse: AuthResponse) => {
        this.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        this.storeUserInfo(authResponse.user);
        this.isAuthenticated.set(true);
        this.currentUser.set(authResponse.user);
        console.log('AuthService: Login successful, internal signals updated.');
      }),
      catchError(this.handleError)
    );
  }

  loginPromise(credentials: Credentials): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      this.login(credentials).subscribe({
        next: (response) => resolve(response),
        error: (err) => reject(err),
      });
    });
  }

  logout(): void {
    console.log('AuthService: logout - Clearing session and signals...');
    this.clearUserSessionAndSignals();
    this.router.navigate(['/login']); // AuthService puede manejar la redirección base del logout
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Login failed. Please check your credentials or network.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      if (error.status === 400 && error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please check your credentials.';
      } else {
        errorMessage = `Server error: ${error.status}. ${error.message}`;
      }
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
