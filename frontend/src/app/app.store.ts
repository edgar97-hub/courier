// import { computed, inject } from '@angular/core';
// import {
//   NavigationEnd,
//   NavigationError,
//   NavigationStart,
//   Router,
//   RouterEvent,
// } from '@angular/router';
// import {
//   patchState,
//   signalStore,
//   withComputed,
//   withHooks,
//   withMethods,
//   withState,
// } from '@ngrx/signals';
// import { AuthService } from './shared/services/auth.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';
// import { pipe, tap } from 'rxjs';

// type AppState = {
//   loading: boolean;
//   user: any;
// };

// const initialState: AppState = {
//   loading: false,
//   user: {},
// };

// export const AppStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withComputed((store, authService = inject(AuthService)) => ({
//     user: computed(() => authService.user()),
//   })),
//   withMethods(
//     (
//       store,
//       router = inject(Router),
//       authService = inject(AuthService),
//       snackbar = inject(MatSnackBar)
//     ) => ({
//       startLoading: () => {
//         patchState(store, { loading: true });
//       },
//       stopLoading: () => {
//         patchState(store, { loading: false });
//       },
//       login: async (email: string, password: string) => {
//         if (!email || !password) {
//           return;
//         }

//         patchState(store, { loading: true });
//         authService.login(email, password).subscribe({
//           next: (data: any) => {
//             console.log(data.user);
//             console.log('data.user', data.user);
//             patchState(store, { user: data.user, loading: false });
//             router.navigate(['/orders']);
//           },
//           error: (e) => {
//             console.log(e);
//             snackbar.open('Correo o contraseña no validos', 'Close', {
//               verticalPosition: 'top',
//               horizontalPosition: 'right',
//             });
//             patchState(store, { loading: false });
//           },
//           complete: () => {
//             console.log('Data stream completed');
//             patchState(store, { loading: false });
//           },
//         });
//       },
//       logout: async () => {
//         await authService.logout();
//         localStorage.removeItem('user');
//         router.navigate(['/login']);
//       },
//       loaderOnNavigation: rxMethod<any>(
//         pipe(
//           tap((event) => {
//             if (event instanceof NavigationStart) {
//               patchState(store, { loading: true });
//             } else if (
//               event instanceof NavigationEnd ||
//               event instanceof NavigationError
//             ) {
//               patchState(store, { loading: false });
//             }
//           })
//         )
//       ),
//     })
//   ),
//   withHooks((store, router = inject(Router)) => ({
//     onInit() {
//       const user = localStorage.getItem('user');
//       if (user) {
//         patchState(store, { user: JSON.parse(user) });
//       }
//       store.loaderOnNavigation(router.events);
//     },
//   }))
// );

// src/app/store/auth.store.ts
// src/app/store/auth.store.ts (o app.store.ts si prefieres)
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
} from '@ngrx/signals'; // Importa PartialStateUpdater
import { AuthService } from './core/services/auth.service';
import { Credentials } from './features/login/models/credentials.interface';
import { AuthResponse } from './features/login/models/auth-response.interface';
import { User } from './features/login/models/user.interface'; // Asumiendo que este es el modelo de usuario que quieres guardar

interface AppUiState {
  // Renombrado para reflejar que es más estado de UI/orquestación
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

  // Derivar el estado de autenticación directamente de las señales del AuthService
  withComputed(
    (
      // store: StateSignal<AppUiState>, // No es necesario aquí si solo derivamos
      _, // Placeholder
      authService = inject(AuthService)
    ) => ({
      currentUser: computed(() => authService.currentUser()), // Lee la señal de AuthService
      isAuthenticated: computed(() => authService.isAuthenticated()), // Lee la señal de AuthService
    })
  ),

  withMethods(
    (
      store, // El 'store' aquí se refiere a AppUiState
      router = inject(Router),
      authService = inject(AuthService), // AuthService se inyecta aquí para sus métodos de acción
      snackbar = inject(MatSnackBar)
      // injector = inject(Injector) // Inyectar el Injector
    ) => {
      // Efecto para reaccionar a cambios en la autenticación del AuthService
      // y actualizar el estado del AppStore si es necesario (aunque withComputed ya lo hace)
      // o para realizar acciones adicionales.
      // runInInjectionContext(injector, () => { // Ejecutar effect en contexto de inyección
      //   effect(() => {
      //     const isAuth = authService.isAuthenticated();
      //     const user = authService.currentUser();
      //     console.log('AppStore effect: Auth state changed in AuthService:', { isAuth, user });
      //     // patchState(store, { currentUser: user, isAuthenticated: isAuth }); // Redundante si withComputed está bien
      //   });
      // });

      return {
        async login(credentials: Credentials): Promise<void> {
          patchState(store, { isLoading: true, error: null });
          try {
            const authResponse: AuthResponse = await authService.loginPromise(
              credentials
            );
            console.log('authResponse', authResponse);
            snackbar.open(
              `Welcome back, ${authResponse.user.username}!`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              }
            );
            router.navigate(['/configuracion/users']);
          } catch (err: any) {
            const errorMessage =
              err.message || 'Login failed. Please try again.';
            patchState(store, { error: errorMessage }); // Solo actualiza el error en AppStore
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
          snackbar.open('You have been logged out.', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },

        clearError(): void {
          patchState(store, { error: null });
        },
      };
    }
  )
);
