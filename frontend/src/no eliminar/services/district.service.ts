import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  readonly API_URL = 'http://localhost:8000/api/districts';
  // readonly API_URL = 'http://161.132.41.184:8000/api/districts';

  unsubscribe: any | null = null;

  constructor(private http: HttpClient) {}

  async getAuthState(): Promise<any | null> {}

  getRows(_user: any) {
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
        name: user.name,
        weight_from: user.weight_from,
        weight_to: user.weight_to,
        price: user.price,
        isStandard: !!user.isStandard,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          codrr_token: user.token,
        },
      }
    );
  }

  insert(user: any) {
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
