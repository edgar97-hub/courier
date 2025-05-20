import { inject, Injectable, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class SettingService {
  // readonly API_URL = 'http://161.132.41.184:8000/api/settings';
  readonly API_URL = 'http://localhost:8000/api/settings';
  private authService = inject(AuthService);

  unsubscribe: any | null = null;

  constructor(private http: HttpClient) {}

  async getAuthState(): Promise<any | null> {}
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
  getRows() {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }

    return this.http.get<any>(this.API_URL + '/all', {
      headers,
    });
  }

  update(user: any) {
    return this.http.put<any>(
      this.API_URL + '/edit/' + user.id,
      {
        business_name: user.business_name,
        address: user.address,
        phone_number: user.phone_number,
        logo_url: user.logo_url,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          codrr_token: user.token,
        },
      }
    );
  }

  updateSubmitStandardMeasurement(user: any) {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }
    return this.http.put<any>(
      this.API_URL + '/edit/' + user.id,
      {
        standard_measurements_length: user.standard_measurements_length,
        standard_measurements_width: user.standard_measurements_width,
        standard_measurements_height: user.standard_measurements_height,
        standard_measurements_weight: user.standard_measurements_weight,
      },
      {
        headers,
      }
    );
  }

  updateSubmitMaximumMeasurement(user: any) {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }
    return this.http.put<any>(
      this.API_URL + '/edit/' + user.id,
      {
        maximum_measurements_width: user.maximum_measurements_width,
        maximum_measurements_length: user.maximum_measurements_length,
        maximum_measurements_height: user.maximum_measurements_height,
        maximum_measurements_weight: user.volumetric_factor,
        volumetric_factor: user.volumetric_factor,
      },
      {
        headers,
      }
    );
  }

  remove(id: string, user: any) {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }
    return this.http.delete<any>(this.API_URL + '/delete/' + id, {
      headers,
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
