import { bootstrapApplication } from '@angular/platform-browser';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  CellStyleModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  LocaleModule,
  TooltipModule,
} from 'ag-grid-community';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CellStyleModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  LocaleModule,
  TooltipModule,
]);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
