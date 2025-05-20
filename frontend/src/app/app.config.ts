// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import {
//   provideRouter,
//   withViewTransitions,
//   withDebugTracing,
// } from '@angular/router';

// import { routes } from './app.routes';
// import { provideNativeDateAdapter } from '@angular/material/core';
// import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import {
//   provideHttpClient,
//   withInterceptorsFromDi,
// } from '@angular/common/http';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes, withViewTransitions()),
//     provideHttpClient(withInterceptorsFromDi()),
//     provideNativeDateAdapter(),
//     {
//       provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
//       useValue: {
//         appearance: 'outline',
//         floatLabel: 'never',
//         subscriptSizing: 'dynamic',
//       },
//     },
//     // provideHttpClient(),
//     provideAnimations(),
//   ],
// };

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { provideStore, StoreModule } from '@ngrx/store'; // <--- IMPORTA provideStore
import { provideEffects } from '@ngrx/effects'; // <--- IMPORTA provideEffects (si tienes root effects)
// import { provideStoreDevtools } from '@ngrx/store-devtools'; // Opcional, para Redux DevTools
// import { reducers, metaReducers } from './store/reducers'; // Si tienes reducers raíz y meta-reducers
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
// import { AppEffects } from './store/app.effects'; // Si tienes efectos raíz

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),

    // Configuración de NgRx Store a Nivel Raíz
    provideStore({}), // <--- DEBE ESTAR AQUÍ. {} si no tienes reducers raíz, o tus reducers raíz aquí.
    // Si tienes reducers raíz (ej. para autenticación global si no lo haces con signalStore):
    // provideStore(reducers, { metaReducers }),

    provideEffects([]), // <--- DEBE ESTAR AQUÍ. [] si no tienes effects raíz, o tus effects raíz aquí.
    provideAnimations(),

    // Si tienes effects raíz:
    // provideEffects([AppEffects]),

    // Opcional: Configuración para Redux DevTools (muy recomendado para desarrollo)
    // importProvidersFrom(
    //   StoreModule.forRoot({}), // Necesario para que Devtools se conecte correctamente en algunos casos
    //   isDevMode() ? StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }) : []
    // ),
    // O si usas provideStoreDevtools (más moderno):
    // provideStoreDevtools({
    //   maxAge: 25, // Retains last 25 states
    //   logOnly: !isDevMode(), // Restrict extension to log-only mode in production
    //   autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    //   trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping to the source code
    //   traceLimit: 75, // Maximum stack trace frames to be stored (in case trace option was provided as true)
    // }),

    // ... otros providers globales ...
  ],
};
