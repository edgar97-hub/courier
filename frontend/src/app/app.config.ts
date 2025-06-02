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
import { LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import { provideStore, StoreModule } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAnimations } from '@angular/platform-browser/animations';
import localeEsPE from '@angular/common/locales/es-PE';
import { routes } from './app.routes';
registerLocaleData(localeEsPE, 'es-PE');
import { MatPaginatorIntl } from '@angular/material/paginator'; // Importa MatPaginatorIntl
import { CustomMatPaginatorIntl } from './core/internationalization/custom-mat-paginator-intl'; // Ajusta la rut

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({}),
    provideEffects([]),
    provideAnimations(),
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ],
};
