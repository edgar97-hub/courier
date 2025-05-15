import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  readonly API_URL = 'http://localhost:8000/api/settings';

  unsubscribe: any | null = null;

  constructor(private http: HttpClient) {}

  async getAuthState(): Promise<any | null> {}

  getUsers(_user: any) {
    return this.http.get<any>(this.API_URL + '/all', {
      headers: {
        codrr_token: _user.token,
      },
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

  remove(id: string, user: any) {
    return this.http.delete<any>(this.API_URL + '/delete/' + id, {
      headers: {
        'Content-Type': 'application/json',
        codrr_token: user.token,
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
