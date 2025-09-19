import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
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
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { DirectionsService } from '../../../../core/services/directions.service';
import { RouteService } from '../../../myRoute/services/route.service';

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
    GoogleMapsModule,
  ],
  templateUrl: './planning-event-detail-page.component.html',
  styleUrl: './planning-event-detail-page.component.scss',
})
export class PlanningEventDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private planningEventService = inject(PlanningEventService);
  private routeService = inject(RouteService);
  private directionsService = inject(DirectionsService); // Inyectar el DirectionsService
  private routeSubscription: Subscription | undefined;

  @ViewChild(GoogleMap) map!: GoogleMap;

  planningEvent: PlanningEvent | null = null;
  selectedRoute: Route | null = null;
  pollingInterval: any;

  // Propiedades para el mapa
  mapOptions: google.maps.MapOptions = {
    center: { lat: -12.046374, lng: -77.042793 }, // Lima, Perú como centro por defecto
    zoom: 12,
    mapTypeControl: false,
  };

  // Propiedades para dibujar la ruta planificada
  plannedRouteMarkers: google.maps.MarkerOptions[] = [];
  plannedRoutePolyline: google.maps.PolylineOptions | null = null;

  // Propiedad para el marcador del vehículo en tiempo real
  liveVehicleMarker: google.maps.MarkerOptions | null = null;

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
              this.drawPlannedRoute();
              this.startLiveLocationPolling();
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
    // Cada vez que se selecciona una nueva ruta, dibujamos su plan y empezamos el seguimiento
    this.drawPlannedRoute();
    this.startLiveLocationPolling(); // <-- Iniciar polling para la nueva ruta
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
  getStatusClass(status: string | undefined | null): string {
    if (!status) {
      return 'status-desconocido'; // O una clase por defecto
    }
    const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
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

  getWhatsAppLink(phoneNumber: string): string {
    // Remove any non-numeric characters from the phone number
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Determine if a country code is already present.
    // This is a simplified check; a more robust solution might involve a library
    // or a more complex regex to validate phone numbers and extract country codes.
    let formattedPhoneNumber = cleanedPhoneNumber;
    if (
      !cleanedPhoneNumber.startsWith('51') &&
      !cleanedPhoneNumber.startsWith('+51')
    ) {
      // Assuming +51 for Peru if no country code is present
      formattedPhoneNumber = '51' + cleanedPhoneNumber;
    } else if (cleanedPhoneNumber.startsWith('+')) {
      // Remove '+' if present, as wa.me links don't use it
      formattedPhoneNumber = cleanedPhoneNumber.substring(1);
    }

    return `https://wa.me/${formattedPhoneNumber}`;
  }

  /**
   * Dibuja la ruta planificada (marcadores y polilínea) en el mapa.
   * Usa la API de Direcciones.
   */
  private drawPlannedRoute(): void {
    // Limpiar datos anteriores
    this.plannedRouteMarkers = [];
    this.plannedRoutePolyline = null;
    this.liveVehicleMarker = null;

    if (
      !this.selectedRoute ||
      !this.selectedRoute.stops ||
      this.selectedRoute.stops.length === 0
    ) {
      return;
    }

    const route = this.selectedRoute;
    const sortedStops = route.stops
      .slice()
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const bounds = new google.maps.LatLngBounds();

    // Crear marcadores de paradas
    sortedStops.forEach((stop) => {
      const position = {
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
      };
      this.plannedRouteMarkers.push({
        position,
        label: stop.sequenceOrder.toString(),
        title: `#${stop.sequenceOrder}: ${stop.address}`,
      });
      bounds.extend(position);
    });

    // Crear polilínea
    const origin = {
      lat: Number(route.latitudeStartPoint),
      lng: Number(route.longitudeStartPoint),
    };
    const destination = {
      lat: Number(sortedStops[sortedStops.length - 1].latitude),
      lng: Number(sortedStops[sortedStops.length - 1].longitude),
    };
    const waypoints = sortedStops.slice(0, -1).map((stop) => ({
      location: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
      stopover: true,
    }));

    this.directionsService
      .getDirections(origin, destination, waypoints)
      .then((response) => {
        if (this.selectedRoute?.id !== route.id) return;
        if (response.routes.length > 0) {
          const path = response.routes[0].overview_path.map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }));
          this.plannedRoutePolyline = {
            path,
            strokeColor: '#3f51b5',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          };
        }
      })
      .catch((e) => {
        console.error('Error al obtener la polilínea de la ruta:', e);
      });
  }

  /**
   * Inicia el polling para obtener la ubicación en tiempo real de los vehículos.
   */
  private startLiveLocationPolling(): void {
    // Detener cualquier polling anterior para evitar duplicados
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    if (!this.planningEvent?.id) return;

    const eventId = this.planningEvent.id;

    // Ejecutar una vez inmediatamente
    this.fetchLiveLocations(eventId);

    // Y luego cada 15 segundos
    this.pollingInterval = setInterval(() => {
      this.fetchLiveLocations(eventId);
    }, 15000);
  }

  /**
   * Llama al backend para obtener las ubicaciones y actualiza el marcador en el mapa.
   */
  private fetchLiveLocations(eventId: number): void {
    this.routeService.getLiveRouteLocations(eventId).subscribe({
      next: (locations: any) => {
        if (this.selectedRoute) {
          const vehicleLocation = locations.find(
            (loc: any) => loc.routeId === this.selectedRoute!.id
          );
          if (
            vehicleLocation &&
            vehicleLocation.latitude &&
            vehicleLocation.longitude
          ) {
            this.liveVehicleMarker = {
              position: {
                lat: Number(vehicleLocation.latitude),
                lng: Number(vehicleLocation.longitude),
              },
              title: `Ubicación actual: ${this.selectedRoute.driverCode}`,
              icon: {
                url: 'assets/icons/truck-icon.png', // <-- DEBES CREAR ESTE ICONO
                scaledSize: new google.maps.Size(40, 40),
              },
              zIndex: 999, // Para que siempre esté por encima de la ruta
            };
            // alert('font');
          } else {
            this.liveVehicleMarker = null;
          }
        }
      },
      error: (err: any) => console.error('Error fetching live locations:', err),
    });
  }

  // Sobrescribir el método ngOnDestroy para limpiar el intervalo
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
