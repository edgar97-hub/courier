import { Injectable } from '@angular/core';

// Declaramos una variable global para gestionar el estado de la carga.
// Esto previene que se intente cargar el script múltiples veces si el servicio se instancia de nuevo.
declare global {
  interface Window {
    googleMapsApiPromise: Promise<void>;
  }
}

@Injectable({ providedIn: 'root' })
export class DirectionsService {
  // La instancia del servicio de direcciones se inicializará después de que la API esté cargada.
  private directionsService: google.maps.DirectionsService | undefined;

  // Esta promesa se resolverá cuando tanto la API esté cargada como el servicio interno esté inicializado.
  private readyPromise: Promise<void>;

  constructor() {
    // El constructor inicia el proceso de carga y preparación.
    this.readyPromise = this.loadApiAndInitialize();
  }

  /**
   * Método privado que maneja la carga del script de Google Maps y la inicialización
   * del servicio de direcciones. Es idempotente, lo que significa que solo cargará el script una vez.
   */
  private loadApiAndInitialize(): Promise<void> {
    // Usamos una promesa global en el objeto 'window' para asegurar que el script se cargue solo una vez
    // en toda la aplicación, sin importar cuántos servicios intenten cargarlo.
    if (!window.googleMapsApiPromise) {
      window.googleMapsApiPromise = new Promise<void>((resolve, reject) => {
        // Comprobar si el script ya fue inyectado por otro medio.
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        // ¡IMPORTANTE! Obtiene la API Key de tus archivos de entorno.
        let googleMapsApiKey = 'AIzaSyBhUbLFbasymqM2cMgC3inBK7OeGkAkO3M';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log(
            'Google Maps script loaded successfully by DirectionsService.'
          );
          resolve();
        };

        script.onerror = (error) => {
          console.error('Error loading Google Maps script:', error);
          reject(error);
        };

        document.head.appendChild(script);
      });
    }

    // Una vez que la promesa global de la API se resuelva, inicializamos nuestro servicio de direcciones.
    return window.googleMapsApiPromise
      .then(() => {
        if (!this.directionsService) {
          this.directionsService = new google.maps.DirectionsService();
        }
      })
      .catch((err) => {
        console.error('Google Maps API could not be loaded.', err);
        // Rechazar la promesa de 'ready' para que las llamadas a getDirections fallen limpiamente.
        return Promise.reject(err);
      });
  }

  /**
   * Obtiene las direcciones de la API de Google.
   * Este método ahora espera a que el servicio esté completamente listo antes de ejecutarse.
   */
  public async getDirections(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    waypoints: google.maps.DirectionsWaypoint[]
  ): Promise<google.maps.DirectionsResult> {
    // 1. Esperar a que la promesa de 'listo' se complete.
    // Esto garantiza que la API está cargada y this.directionsService está inicializado.
    await this.readyPromise;

    if (!this.directionsService) {
      throw new Error(
        'DirectionsService is not initialized. The Google Maps API may have failed to load.'
      );
    }

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false, // Para rutas planificadas, queremos respetar el orden.
      drivingOptions: {
        departureTime: new Date(), // Usar la hora actual para la solicitud
        trafficModel: google.maps.TrafficModel.BEST_GUESS, // Usa datos históricos y en tiempo real
      },
    };

    // 2. Envolver la llamada de callback en una promesa para un manejo moderno con async/await.
    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          console.error(`Directions request failed due to status: ${status}`);
          reject(new Error(`Directions request failed with status: ${status}`));
        }
      });
    });
  }
}
