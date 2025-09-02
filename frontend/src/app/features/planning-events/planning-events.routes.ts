import { Routes } from '@angular/router';
import { PlanningEventsListPageComponent } from './pages/planning-events-list-page/planning-events-list-page.component';
import { PlanningEventDetailPageComponent } from './pages/planning-event-detail-page/planning-event-detail-page.component';

export const PLANNING_EVENTS_ROUTES: Routes = [
  {
    path: '',
    component: PlanningEventsListPageComponent,
  },
  {
    path: ':id',
    component: PlanningEventDetailPageComponent,
  },
];
