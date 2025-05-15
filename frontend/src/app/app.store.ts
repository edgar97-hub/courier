import { computed, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthService } from './shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

type AppState = {
  loading: boolean;
};

const initialState: AppState = {
  loading: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store, authService = inject(AuthService)) => ({
    user: computed(() => authService.user()),
  })),
  withMethods(
    (
      store,
      router = inject(Router),
      authService = inject(AuthService),
      snackbar = inject(MatSnackBar)
    ) => ({
      startLoading: () => {
        patchState(store, { loading: true });
      },
      stopLoading: () => {
        patchState(store, { loading: false });
      },
      login: async (email: string, password: string) => {
        if (!email || !password) {
          return;
        }

        patchState(store, { loading: true });
        await authService.login(email, password).subscribe({
          next: (data) => {
            console.log(data.user);
            localStorage.setItem(
              'user',
              JSON.stringify({
                uid: data.user.id,
                email: data.user.email,
                name: data.user.firstName,
                photoUrl: '',
                role: data.user.role,
                token: data.accessToken,
              })
            );
            router.navigate(['/orders']);
          },
          error: (e) => {
            console.log(e);
            snackbar.open('Correo o contraseña no validos', 'Close', {
              verticalPosition: 'top',
              horizontalPosition: 'right',
            });
            patchState(store, { loading: false });
          },
          complete: () => {
            console.log('Data stream completed');
            patchState(store, { loading: false });
          },
        });
      },
      logout: async () => {
        await authService.logout();
        localStorage.removeItem('user');
        router.navigate(['/login']);
      },
      loaderOnNavigation: rxMethod<any>(
        pipe(
          tap((event) => {
            if (event instanceof NavigationStart) {
              patchState(store, { loading: true });
            } else if (
              event instanceof NavigationEnd ||
              event instanceof NavigationError
            ) {
              patchState(store, { loading: false });
            }
          })
        )
      ),
    })
  ),
  withHooks((store, router = inject(Router)) => ({
    onInit() {
      store.loaderOnNavigation(router.events);
    },
  }))
);
