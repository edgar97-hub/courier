import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlanningEventService } from '../../services/planning-event.service';
import {
  PlanningEvent,
  Route,
  Stop,
  StopStatus,
} from '../../models/planning-event.model';
import { Subscription, switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-planning-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './planning-event-detail-page.component.html',
  styleUrl: './planning-event-detail-page.component.scss',
})
export class PlanningEventDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private planningEventService = inject(PlanningEventService);
  private routeSubscription: Subscription | undefined;

  planningEvent: PlanningEvent | null = null;
  selectedRoute: Route | null = null;
  pollingInterval: any;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            return this.planningEventService.getPlanningEventDetails(id);
          }
          return of(null); // Use 'of' from rxjs to return an observable of null
        })
      )
      .subscribe({
        next: (data: PlanningEvent | null) => {
          if (data) {
            this.planningEvent = data;
            if (
              this.planningEvent.routes &&
              this.planningEvent.routes.length > 0
            ) {
              this.selectedRoute = this.planningEvent.routes[0];
            } else {
              this.selectedRoute = null;
            }
            this.startPolling();
          }
        },
        error: (err: any) => {
          console.error('Error loading planning event details', err);
        },
      });
  }

  selectRoute(route: Route): void {
    this.selectedRoute = route;
  }

  getCompletedStops(route: Route): number {
    if (!route.stops) return 0;
    return route.stops.filter((stop) => stop.status === StopStatus.COMPLETED)
      .length; // Asumiendo que el estado es 'ENTREGADO'
  }

  getRouteProgress(route: Route): number {
    if (!route.stops || route.stops.length === 0) return 0;
    const completedStops = this.getCompletedStops(route);
    return (completedStops / route.stops.length) * 100;
  }

  // Método para la clase CSS del icono de la parada en la línea de tiempo
  getStopStatusClass(status: string): string {
    return `status-${status}`;
  }

  startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  refreshData(): void {
    if (this.planningEvent?.id) {
      this.planningEventService
        .getPlanningEventDetails(this.planningEvent.id.toString())
        .subscribe({
          next: (updatedData: PlanningEvent) => {
            if (updatedData) {
              const currentSelectedId = this.selectedRoute?.id;
              this.planningEvent = updatedData;
              // CORRECCIÓN: Asegurarse de que la ruta seleccionada se mantenga
              this.selectedRoute =
                this.planningEvent.routes.find(
                  (r) => r.id === currentSelectedId
                ) ||
                (this.planningEvent.routes.length > 0
                  ? this.planningEvent.routes[0]
                  : null);
            }
          },
          error: (err: any) => {
            console.error('Error refreshing planning event data', err);
          },
        });
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
