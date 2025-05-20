import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly API_URL = 'http://localhost:8000/api/auth/login';
  // readonly API_URL = 'http://161.132.41.184:8000/api/auth/login';

  user = signal<User | null>(null);

  // firebaseService = inject(FirebaseService);
  // auth = this.firebaseService.auth;
  // db = this.firebaseService.db;

  unsubscribe: any | null = null;

  // constructor() {
  //   // this.unsubscribe = onAuthStateChanged(
  //   //   this.firebaseService.auth,
  //   //   async (user) => {
  //   //     if (!user) {
  //   //       this.user.set(null);
  //   //       return;
  //   //     }
  //   //     this.user.set({ uid: user.uid });
  //   //     const userInfo = await this.getUserInfo(user?.uid);
  //   //     this.user.set({ ...userInfo, uid: user.uid });
  //   //   }
  //   // );
  // }

  constructor(private http: HttpClient) {}

  async getAuthState(): Promise<any | null> {
    // const local = localStorage.getItem('user');
    // const _user = local ? JSON.parse(local) : null;
    // if (!_user) {
    //   this.user.set(null);
    //   return;
    // }
    // // this.user.set({ uid: user.uid });
    // const userInfo = await this.getUserInfo(_user?.uid);
    // this.user.set({ ...userInfo, uid: _user.uid });
    // return this.user;
    // // await this.auth.authStateReady();
    // // return Promise.resolve(this.auth.currentUser);

    // //  localStorage.setItem('dataSource', this.dataSource.length);

    const local = localStorage.getItem('user');
    if (!local) {
      this.user.set(null);
      return null;
    }
    const parsedUser = JSON.parse(local);
    this.user.set(parsedUser);
    return parsedUser;
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(
        this.API_URL,
        { username: email, password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .pipe(
        tap((response) => {
          let user = {
            uid: response.user.id,
            email: response.user.email,
            name: response.user.firstName,
            photoUrl: '',
            role: response.user.role,
            token: response.accessToken,
          };
          this.user.set(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
      );
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('user');
  }

  async getUserInfo(uid: string): Promise<any | null> {
    const local = localStorage.getItem('user');
    const _user = local ? JSON.parse(local) : null;
    return _user;
    // const userRef = doc(this.db, 'users', uid);
    // const userDoc = await getDoc(userRef);
    // if (!userDoc.exists()) {
    //   return null;
    // }
    // return userDoc.data() as User;
  }
}
