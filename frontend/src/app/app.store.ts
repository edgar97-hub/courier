import { computed, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
  type PartialStateUpdater,
} from '@ngrx/signals';
import { AuthService } from './core/services/auth.service';
import { Credentials } from './features/login/models/credentials.interface';
import { AuthResponse } from './features/login/models/auth-response.interface';
import { User } from './features/login/models/user.interface';

interface AppUiState {
  isLoading: boolean;
  error: string | null;
}

const initialAppUiState: AppUiState = {
  isLoading: false,
  error: null,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialAppUiState),
  withComputed((_, authService = inject(AuthService)) => ({
    currentUser: computed(() => authService.currentUser()),
    isAuthenticated: computed(() => authService.isAuthenticated()),
  })),

  withMethods(
    (
      store,
      router = inject(Router),
      authService = inject(AuthService),
      snackbar = inject(MatSnackBar)
    ) => {
      return {
        async login(credentials: Credentials): Promise<void> {
          patchState(store, { isLoading: true, error: null });
          try {
            const authResponse: AuthResponse = await authService.loginPromise(
              credentials
            );
            console.log('authResponse', authResponse);
            snackbar.open(
              `Bienvenido de nuevo, ${authResponse.user.username}!`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              }
            );
            authService.getCurrentUserFromBackend().subscribe();
            if (authResponse.user.role === 'EMPRESA') {
              router.navigate(['/orders/create']);
            } else {
              router.navigate(['dashboard']);
            }
          } catch (err: any) {
            const errorMessage =
              err.message || 'Login failed. Please try again.';
            patchState(store, { error: errorMessage });
            snackbar.open(errorMessage, 'Retry', {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          } finally {
            patchState(store, { isLoading: false });
          }
        },

        logout(): void {
          authService.logout();
          patchState(store, initialAppUiState);
          snackbar.open('Se ha cerrado la sesión.', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },

        //        updateCurrentUser(updatedUser: User): void {
        //   patchState(store, { currentUser: updatedUser });
        //   // También actualiza el localStorage si AuthService guarda el usuario ahí
        //   // inject(AuthService).storeUserInfo(updatedUser); // Necesitarías inyectar AuthService o manejarlo diferente
        //   localStorage.setItem('user_info', JSON.stringify(updatedUser)); // Ejemplo simple
        // }

        clearError(): void {
          patchState(store, { error: null });
        },
      };
    }
  )
);
