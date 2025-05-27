import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private http = inject(HttpClient);
  readonly apiUrl = environment.apiUrl + '/settings';
  private authService = inject(AuthService);

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
}
