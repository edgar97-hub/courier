import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';

// Asumiendo que tienes un AppStore para el loader
import { AppStore } from '../../../../app.store';
// Asumiendo que tienes un servicio para las rutas
import { RouteService } from '../../services/route.service';
// Asumiendo que tienes modelos definidos
import {
  Route,
  Stop,
  StopStatus,
} from '../../../planning-events/models/planning-event.model';

@Component({
  selector: 'app-my-route-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTabsModule,
  ],
  templateUrl: './my-route-page.component.html',
  styleUrls: ['./my-route-page.component.scss'],
})
export class MyRoutePageComponent implements OnInit, OnDestroy {
  // Inyección de dependencias moderna con inject()
  private routeService = inject(RouteService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  public appStore = inject(AppStore); // Público para usarlo en el template si es necesario

  selectedDate: Date = new Date();
  routesForSelectedDate: Route[] = [];
  selectedRoute: Route | null = null;

  private pollingInterval: any;
  private navigationSubscription: Subscription;

  constructor() {
    // Suscripción a eventos de navegación para forzar la recarga de datos al volver a esta página
    this.navigationSubscription = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd && event.url.includes('/my-route')
        )
      )
      .subscribe(() => {
        this.loadRoutesForDate();
      });
  }

  ngOnInit(): void {
    this.loadRoutesForDate();
    this.startPolling();
  }
  // Método para la clase CSS del icono de la parada en la línea de tiempo
  getStopStatusClass(status: string): string {
    return `status-${status}`;
  }

  loadRoutesForDate(): void {
    // this.appStore.setLoading(true);
    const dateString = this.selectedDate.toISOString().split('T')[0];

    this.routeService.getMyRoutesByDate(dateString).subscribe({
      next: (data: any) => {
        this.routesForSelectedDate = data;
        if (data && data.length > 0) {
          // Lógica para seleccionar la primera ruta con paradas pendientes
          this.selectedRoute =
            data.find((r: any) =>
              r.stops.some((s: any) => s.status === 'PENDIENTE')
            ) || data[0];
        } else {
          this.selectedRoute = null;
        }
        // this.appStore.setLoading(false);
      },
      error: (err: any) => {
        this.snackBar.open(
          'Error al cargar las rutas: ' + err.message,
          'Cerrar',
          { duration: 3000 }
        );
        // this.appStore.setLoading(false);
      },
    });
  }

  onDateChange(): void {
    this.loadRoutesForDate();
  }

  selectRoute(index: number): void {
    if (this.routesForSelectedDate && this.routesForSelectedDate[index]) {
      this.selectedRoute = this.routesForSelectedDate[index];
    }
  }

  // Genera la URL para ver la ruta completa en Google Maps
  generateFullRouteMapsUrl(): void {
    alert('funcionalidad pendiente');
    if (!this.selectedRoute || this.selectedRoute.stops.length === 0) return;

    // const origin = `${this.selectedRoute.startWarehouse.latitude},${this.selectedRoute.startWarehouse.longitude}`;
    // const destination = `${this.selectedRoute.endWarehouse.latitude},${this.selectedRoute.endWarehouse.longitude}`;
    // const waypoints = this.selectedRoute.stops
    //   .map((stop: any) => `${stop.latitude},${stop.longitude}`)
    //   .join('|');

    // const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    // window.open(mapsUrl, '_blank');
  }

  // Genera la URL para navegar a una parada específica
  navigateToStop(stop: Stop): void {
    // const destination = `${stop.latitude},${stop.longitude}`;
    // const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    // window.open(mapsUrl, '_blank');
  }

  // Navega a la página de detalle de pedido existente
  manageDelivery(stop: Stop): void {
    alert('funcionalidad pendiente');
    return;
    this.router.navigate(['/orders', stop.orderCode], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  // Lógica para el flujo guiado
  isStopActive(stop: Stop): boolean {
    if (!this.selectedRoute) return false;
    const firstPendingStop = this.selectedRoute.stops.find(
      (s) => s.status === StopStatus.PENDING
    );
    return firstPendingStop ? firstPendingStop.id === stop.id : false;
  }

  isStopCompleted(stop: Stop): boolean {
    return (
      stop.status === StopStatus.COMPLETED ||
      stop.status === StopStatus.INCIDENCIA
    );
  }

  // Lógica para el polling
  startPolling(): void {
    this.stopPolling(); // Asegura que no haya intervalos duplicados
    this.pollingInterval = setInterval(() => {
      this.loadRoutesForDate();
    }, 30000); // Refresca cada 30 segundos
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
