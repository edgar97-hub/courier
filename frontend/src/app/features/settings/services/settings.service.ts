import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, delay, finalize, map } from 'rxjs/operators';
import {
  AppSettings,
  initialAppSettings,
} from '../models/app-settings.interface';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly apiUrl = environment.apiUrl + '/settings';
  private settingsSubject = new BehaviorSubject<AppSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor() {}

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

  // Obtener la configuración actual
  loadSettings(): Observable<AppSettings> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http.get<AppSettings>(this.apiUrl + '/all', { headers }).pipe(
      map((settings) => settings || initialAppSettings),
      tap((settings) => {
        this.settingsSubject.next(settings);
        console.log(
          'SettingsService: Settings loaded from API and Subject updated',
          settings
        );
      }),
      catchError(
        this.handleError<AppSettings>('loadSettings', initialAppSettings)
      )
    );
  }
  saveSettings(settings: AppSettings): Observable<AppSettings> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .put<AppSettings>(this.apiUrl + '/edit/' + settings.id, settings, {
        headers,
      })
      .pipe(
        tap((savedSettings) => {
          this.settingsSubject.next(savedSettings);
          console.log(
            'SettingsService: Settings saved and Subject updated',
            savedSettings
          );
        }),
        catchError(this.handleError<AppSettings>('saveSettings'))
      );
  }

  uploadLogo(file: File): Observable<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logoFile', file, file.name);

    const token = this.authService.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let headers = new HttpHeaders({
      codrr_token: token,
    });

    return this.http
      .post<{ logo_url: string }>(`${this.apiUrl}/upload-logo`, formData, {
        headers,
      })
      .pipe(
        tap((response) =>
          console.log('SettingsService: Logo uploaded', response)
        ),
        catchError(this.handleError<{ logo_url: string }>('uploadLogo'))
      );
  }

  uploadTermsPdf(file: File): Observable<{ terms_conditions_url: string }> {
    const formData = new FormData();
    // El backend esperará un campo como 'termsPdfFile' o similar
    formData.append('termsPdfFile', file, file.name);
    const token = this.authService.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let headers = new HttpHeaders({
      codrr_token: token,
    });
    return this.http
      .post<{ terms_conditions_url: string }>(
        `${this.apiUrl}/upload-terms-pdf`,
        formData,
        { headers }
      )
      .pipe(
        tap((response) =>
          console.log('SettingsService: Terms PDF uploaded', response)
        ),
        catchError(
          this.handleError<{ terms_conditions_url: string }>('uploadTermsPdf')
        )
      );
  }

  uploadFile(file: File): Observable<{ file_url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const token = this.authService.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let headers = new HttpHeaders({
      codrr_token: token,
    });
    return this.http
      .post<{ file_url: string }>(`${this.apiUrl}/upload-file`, formData, {
        headers,
      })
      .pipe(
        tap((response) =>
          console.log('SettingsService: Terms PDF uploaded', response)
        ),
        catchError(
          this.handleError<{
            file_url: string;
          }>('file')
        )
      );
  }

  // Método genérico para manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      if (result !== undefined) {
        return of(result as T);
      } else {
        return throwError(
          () =>
            new Error(
              `Error in ${operation}. Details: ${
                error.message || 'Server error'
              }`
            )
        );
      }
    };
  }

  // Para obtener el valor actual de las configuraciones de forma síncrona (si ya se cargaron)
  getCurrentSettings(): AppSettings | null {
    return this.settingsSubject.value;
  }
}
