import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouteService } from '../../features/myRoute/services/route.service'; // Adjusted path
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationTrackingService {
  private routeService = inject(RouteService);
  private snackBar = inject(MatSnackBar);

  private watchId: number | null = null;
  private currentRouteId: number | null = null;

  public isTracking$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Inicia el seguimiento para una ruta específica.
   * Pide permiso de geolocalización si es necesario.
   */
  public startTracking(routeId: number): void {
    if (this.watchId) {
      console.log('Tracking ya está activo.');
      return;
    }

    this.currentRouteId = routeId;

    if (!navigator.geolocation) {
      this.snackBar.open(
        'La geolocalización no es compatible con este navegador.',
        'Cerrar',
        { duration: 5000 }
      );
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true, // Pide la máxima precisión posible del GPS
      timeout: 10000, // Tiempo máximo de espera para una posición
      maximumAge: 0, // No usar posiciones en caché
    };

    // watchPosition se actualiza automáticamente cuando el usuario se mueve
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.onPositionUpdate(position),
      (error) => this.onPositionError(error),
      options
    );

    this.isTracking$.next(true);
    this.snackBar.open('Seguimiento de ubicación iniciado.', 'OK', {
      duration: 2000,
    });
  }

  /**
   * Se llama cada vez que el dispositivo reporta una nueva ubicación.
   */
  private onPositionUpdate(position: GeolocationPosition): void {
    if (!this.currentRouteId) return;

    const { latitude, longitude } = position.coords;
    console.log(
      `Nueva ubicación: ${latitude}, ${longitude}. Enviando al servidor...`
    );

    // Llama al endpoint del backend que creamos
    this.routeService
      .updateRouteLocation(this.currentRouteId, { latitude, longitude })
      .subscribe({
        next: () => {
          /* La actualización fue exitosa, no hacemos nada */
        },
        error: (err) => console.error('Error al enviar la ubicación:', err),
      });
  }

  /**
   * Maneja los errores de geolocalización, como el rechazo de permisos.
   */
  private onPositionError(error: GeolocationPositionError): void {
    let message = 'Error desconocido al obtener la ubicación.';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message =
          'Has denegado el permiso de ubicación. El seguimiento no puede iniciar.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'La información de ubicación no está disponible.';
        break;
      case error.TIMEOUT:
        message =
          'Se ha agotado el tiempo de espera para obtener la ubicación.';
        break;
    }
    this.snackBar.open(message, 'Cerrar', { duration: 7000 });
    this.stopTracking(); // Detener el seguimiento si hay un error
  }

  /**
   * Detiene el seguimiento de la ubicación.
   */
  public stopTracking(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.currentRouteId = null;
      this.isTracking$.next(false);
      this.snackBar.open('Seguimiento de ubicación detenido.', 'OK', {
        duration: 2000,
      });
    }
  }
}
