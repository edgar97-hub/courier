import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  // readonly API_URL = 'http://localhost:8000/api/districts';
  // readonly API_URL = 'http://161.132.41.184:8000/api/districts';
  readonly API_URL = environment.apiUrl + '/districts';

  unsubscribe: any | null = null;
  private authService = inject(AuthService);

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
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }
    return this.http.put<any>(
      this.API_URL + '/edit/' + user.id,
      {
        name: user.name,
        weight_from: user.weight_from,
        weight_to: user.weight_to,
        price: user.price,
        isStandard: !!user.isStandard,
      },
      {
        headers,
      }
    );
  }

  insert(user: any) {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
    }
    return this.http.post<any>(
      this.API_URL + '/register',
      {
        name: user.name,
        weight_from: user.weight_from,
        weight_to: user.weight_to,
        price: user.price,
        isStandard: !!user.isStandard,
      },
      {
        headers,
      }
    );
  }

  remove(id: string) {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(this.API_URL + '/delete/' + id, {
      headers,
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
