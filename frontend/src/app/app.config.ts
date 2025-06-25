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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './core/internationalization/custom-mat-paginator-intl';

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
