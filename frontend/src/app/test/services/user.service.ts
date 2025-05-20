import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly API_URL = 'http://localhost:8000/api/users';

  // readonly API_URL = 'http://161.132.41.184:8000/api/users';

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
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
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
        age: 1,
        firstName: 'test',
        lastName: 'test',
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
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
