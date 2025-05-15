import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components.component'),
  },
  {
    path: 'buttons',
    loadComponent: () => import('./buttons/buttons.component'),
  },
  {
    path: 'dialog',
    loadComponent: () => import('./dialog/dialog.component'),
  },
  {
    path: 'inputs',
    loadComponent: () => import('./inputs/inputs.component'),
  },
  {
    path: 'panels',
    loadComponent: () => import('./panels/panels.component'),
  },
  {
    path: 'progress',
    loadComponent: () => import('./progress/progress.component'),
  },
  {
    path: 'stepper',
    loadComponent: () => import('./stepper/stepper.component'),
  },
  {
    path: 'table',
    loadComponent: () => import('./table/table.component'),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.component'),
  },
];

export default routes;
