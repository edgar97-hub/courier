import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  private router = inject(Router); // Router todavía puede ser útil aquí

  readonly isAuthenticated: WritableSignal<boolean> = signal(false);
  readonly currentUser: WritableSignal<User | null> = signal(null);
  readonly loginUrl = environment.apiUrl + '/auth/login';

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
      this.clearUserSessionAndSignals(); // Asegura que las señales estén limpias si no hay sesión
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

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // login() ahora actualiza las señales INTERNAS de AuthService
  // y AppStore leerá estas señales o será notificado
  login(credentials: Credentials): Observable<AuthResponse> {
    const body = { email: credentials.email, password: credentials.password };
    return this.http.post<any>(this.loginUrl, body).pipe(
      // loginUrl es tu API o la de reqres.in
      delay(1000),
      map((response) => {
        console.log('response', response);
        const simulatedUser: User = {
          id: 's',
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
