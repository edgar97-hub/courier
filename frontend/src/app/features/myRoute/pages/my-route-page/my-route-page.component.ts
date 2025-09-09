// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatTabsModule } from '@angular/material/tabs';
// import { RouterModule, Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Subscription, filter } from 'rxjs';
// import { NavigationEnd } from '@angular/router';

// // Asumiendo que tienes un AppStore para el loader
// import { AppStore } from '../../../../app.store';
// // Asumiendo que tienes un servicio para las rutas
// import { RouteService } from '../../services/route.service';
// // Asumiendo que tienes modelos definidos
// import {
//   Route,
//   Stop,
//   StopStatus,
// } from '../../../planning-events/models/planning-event.model';
// import { Order_, OrderStatus } from '../../../orders/models/order.model';
// import {
//   ChangeStatusDialogComponent,
//   ChangeStatusDialogResult,
// } from '../../../orders/components/change-status-dialog/change-status-dialog.component';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { OrderService } from '../../../orders/services/order.service';
// import { GoogleMapsModule } from '@angular/google-maps';
// import { DirectionsService } from '../../../../core/services/directions.service';

// @Component({
//   selector: 'app-my-route-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterModule,
//     MatCardModule,
//     MatButtonModule,
//     MatIconModule,
//     MatDatepickerModule,
//     MatInputModule,
//     MatFormFieldModule,
//     MatNativeDateModule,
//     MatChipsModule,
//     MatTabsModule,
//     MatDialogModule,
//     GoogleMapsModule,
//   ],
//   templateUrl: './my-route-page.component.html',
//   styleUrls: ['./my-route-page.component.scss'],
// })
// export class MyRoutePageComponent implements OnInit, OnDestroy {
//   // Inyección de dependencias moderna con inject()
//   private directionsService = inject(DirectionsService); // <-- AÑADIR
//   private routeService = inject(RouteService);
//   private snackBar = inject(MatSnackBar);
//   private router = inject(Router);
//   public appStore = inject(AppStore); // Público para usarlo en el template si es necesario

//   selectedDate: Date = new Date();
//   routesForSelectedDate: Route[] = [];
//   selectedRoute: Route | null = null;

//   private pollingInterval: any;
//   private navigationSubscription: Subscription;
//   private dialog = inject(MatDialog);

//   private orderService = inject(OrderService);
//   isLoading = false;

//   mapOptions: google.maps.MapOptions = {
//     center: { lat: -12.046374, lng: -77.042793 }, // Centro por defecto
//     zoom: 12,
//     mapTypeControl: false, // Simplificar UI del mapa
//   };
//   markers: google.maps.MarkerOptions[] = [];
//   polylines: google.maps.PolylineOptions[] = [];
//   mapBounds: google.maps.LatLngBounds | undefined;

//   constructor() {
//     // Suscripción a eventos de navegación para forzar la recarga de datos al volver a esta página
//     this.navigationSubscription = this.router.events
//       .pipe(
//         filter(
//           (event) =>
//             event instanceof NavigationEnd && event.url.includes('/my-route')
//         )
//       )
//       .subscribe(() => {
//         this.loadRoutesForDate();
//       });
//   }

//   ngOnInit(): void {
//     this.loadRoutesForDate();
//     this.startPolling();
//   }
//   // Método para la clase CSS del icono de la parada en la línea de tiempo
//   getStatusClass(status: string | undefined | null): string {
//     if (!status) {
//       return 'status-desconocido'; // O una clase por defecto
//     }
//     const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
//     return `status-${formattedStatus}`;
//   }

//   loadRoutesForDate(): void {
//     const dateString = this.selectedDate.toLocaleString('sv-SE', {
//       timeZone: 'America/Bogota',
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     });

//     this.routeService.getMyRoutesByDate(dateString).subscribe({
//       next: (data: any) => {
//         this.routesForSelectedDate = data;
//         if (data && data.length > 0) {
//           this.selectedRoute =
//             data.find((r: any) =>
//               r.stops.some((s: any) => s.status === 'PENDIENTE')
//             ) || data[0];
//         } else {
//           this.selectedRoute = null;
//         }
//       },
//       error: (err: any) => {
//         this.snackBar.open(
//           'Error al cargar las rutas: ' + err.message,
//           'Cerrar',
//           { duration: 3000 }
//         );
//         // this.appStore.setLoading(false);
//       },
//     });
//   }

//   onDateChange(): void {
//     this.loadRoutesForDate();
//   }

//   navigateToStop(stopIndex: number): void {
//     if (!this.selectedRoute || !this.selectedRoute.stops) return;

//     const sortedStops = this.selectedRoute.stops
//       .slice()
//       .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

//     if (stopIndex < 0 || stopIndex >= sortedStops.length) {
//       console.error('Índice de parada inválido');
//       return;
//     }

//     let origin: string;
//     if (stopIndex === 0) {
//       origin = `${this.selectedRoute.latitudeStartPoint},${this.selectedRoute.longitudeStartPoint}`;
//       console.log(origin);
//     } else {
//       // El origen de las demás paradas es la parada anterior
//       const previousStop = sortedStops[stopIndex - 1];
//       origin = `${previousStop.latitude},${previousStop.longitude}`;
//     }

//     const currentStop = sortedStops[stopIndex];
//     const destination = `${currentStop.latitude},${currentStop.longitude}`;

//     const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${destination}&destination=${origin}&travelmode=driving&dir_action=navigate`;

//     window.open(mapsUrl, '_blank');
//   }

//   getAvailableStatuses(order: Order_): OrderStatus[] {
//     const userRole = this.appStore.currentUser()?.role;
//     order.status === OrderStatus.REGISTRADO;

//     let almacen = [OrderStatus.EN_ALMACEN];
//     if (userRole === 'MOTORIZADO' && OrderStatus.REGISTRADO) {
//       almacen = [];
//     }

//     switch (order.status) {
//       case OrderStatus.REGISTRADO:
//         return [OrderStatus.RECOGIDO, ...almacen, OrderStatus.CANCELADO];
//       case OrderStatus.RECOGIDO:
//         return [OrderStatus.EN_ALMACEN, OrderStatus.CANCELADO];
//       case OrderStatus.EN_ALMACEN:
//         return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
//       case OrderStatus.EN_TRANSITO:
//         return [
//           OrderStatus.ENTREGADO,
//           OrderStatus.RECHAZADO,
//           OrderStatus.REPROGRAMADO,
//         ];
//       case OrderStatus.REPROGRAMADO:
//         return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
//       default:
//         return [];
//     }
//   }
//   manageDelivery(stop: Stop): void {
//     let order: Order_ = stop.order;

//     const availableStatuses = this.getAvailableStatuses(order);
//     if (availableStatuses.length === 0) {
//       this.snackBar.open(
//         'No hay cambios de estado disponibles para este pedido.',
//         'OK',
//         { duration: 3000 }
//       );
//       return;
//     }

//     const dialogRef = this.dialog.open<
//       ChangeStatusDialogComponent,
//       { order: Order_; availableStatuses: OrderStatus[] },
//       ChangeStatusDialogResult
//     >(ChangeStatusDialogComponent, {
//       width: '450px',
//       data: { order: order, availableStatuses: availableStatuses },
//       disableClose: true,
//     });

//     dialogRef.afterClosed().subscribe((result) => {
//       if (result && result.newStatus) {
//         console.log('Dialog result:', result);
//         const updatePayload: any = {
//           newStatus: result.newStatus,
//           reason: result.reason || '',
//           proofOfDeliveryImageUrl: '',
//           shippingCostPaymentMethod: '',
//           collectionPaymentMethod: '',
//         };
//         if (result.newStatus === OrderStatus.ENTREGADO) {
//           if (result.proofOfDeliveryImageUrl) {
//             updatePayload.proofOfDeliveryImageUrl =
//               result.proofOfDeliveryImageUrl;
//           }
//           if (result.shippingCostPaymentMethod) {
//             updatePayload.shippingCostPaymentMethod =
//               result.shippingCostPaymentMethod;
//           }
//           if (result.collectionPaymentMethod) {
//             updatePayload.collectionPaymentMethod =
//               result.collectionPaymentMethod;
//           }
//         }
//         this.orderService
//           .updateOrderStatus(
//             order.id,
//             result.newStatus,
//             result.reason || '',
//             result.proofOfDeliveryImageUrl,
//             result.shippingCostPaymentMethod,
//             result.collectionPaymentMethod
//           )
//           .subscribe({
//             next: (updatedOrder) => {
//               this.snackBar.open(
//                 `Estado del pedido ${updatedOrder.code} actualizado a ${result.newStatus}.`,
//                 'OK',
//                 { duration: 3000, panelClass: ['success-snackbar'] }
//               );
//               this.loadRoutesForDate();
//             },
//             error: (err) => {
//               this.snackBar.open(
//                 `Error al actualizar estado: ${
//                   err.message || 'Intente de nuevo'
//                 }`,
//                 'Cerrar',
//                 { duration: 5000, panelClass: ['error-snackbar'] }
//               );
//               this.isLoading = false;
//             },
//             complete: () => {
//               this.isLoading = false;
//             },
//           });
//         console.log('updatePayload', updatePayload);
//       } else {
//         console.log('Cambio de estado cancelado o sin selección.');
//       }
//     });
//   }

//   isStopActive(stop: Stop): boolean {
//     if (!this.selectedRoute) return false;
//     const firstPendingStop = this.selectedRoute.stops.find(
//       (s) =>
//         s.order.status !== OrderStatus.ENTREGADO &&
//         s.order.status !== OrderStatus.RECHAZADO &&
//         s.order.status !== OrderStatus.ANULADO
//     );
//     return firstPendingStop ? firstPendingStop.id === stop.id : false;
//   }

//   isStopCompleted(stop: Stop): boolean {
//     return (
//       stop.status === StopStatus.COMPLETED ||
//       stop.status === StopStatus.INCIDENCIA
//     );
//   }

//   // Lógica para el polling
//   startPolling(): void {
//     this.stopPolling(); // Asegura que no haya intervalos duplicados
//     this.pollingInterval = setInterval(() => {
//       this.loadRoutesForDate();
//     }, 20000); // Refresca cada 20 segundos
//   }

//   stopPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//     }
//   }

//   getWhatsAppLink(phoneNumber: string): string {
//     const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
//     let formattedPhoneNumber = cleanedPhoneNumber;
//     if (
//       !cleanedPhoneNumber.startsWith('51') &&
//       !cleanedPhoneNumber.startsWith('+51')
//     ) {
//       // Assuming +51 for Peru if no country code is present
//       formattedPhoneNumber = '51' + cleanedPhoneNumber;
//     } else if (cleanedPhoneNumber.startsWith('+')) {
//       // Remove '+' if present, as wa.me links don't use it
//       formattedPhoneNumber = cleanedPhoneNumber.substring(1);
//     }

//     return `https://wa.me/${formattedPhoneNumber}`;
//   }

//   ngOnDestroy(): void {
//     this.stopPolling();
//     if (this.navigationSubscription) {
//       this.navigationSubscription.unsubscribe();
//     }
//   }

//   selectRoute(index: number): void {
//     if (this.routesForSelectedDate && this.routesForSelectedDate[index]) {
//       this.selectedRoute = this.routesForSelectedDate[index];
//       this.drawFullRouteOnMap(); // <-- LLAMAR A LA NUEVA FUNCIÓN
//     }
//   }

//   private drawFullRouteOnMap(): void {
//     if (
//       !this.selectedRoute ||
//       !this.selectedRoute.stops ||
//       this.selectedRoute.stops.length === 0
//     ) {
//       this.markers = [];
//       this.polylines = [];
//       return;
//     }

//     const route = this.selectedRoute;
//     const sortedStops = route.stops
//       .slice()
//       .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

//     const origin = {
//       lat: Number(route.latitudeStartPoint),
//       lng: Number(route.longitudeStartPoint),
//     };
//     const destination = {
//       lat: Number(sortedStops[sortedStops.length - 1].latitude),
//       lng: Number(sortedStops[sortedStops.length - 1].longitude),
//     };

//     const waypoints = sortedStops.slice(0, -1).map((stop) => ({
//       location: { lat: Number(stop.latitude), lng: Number(stop.longitude) },
//       stopover: true,
//     }));

//     this.directionsService
//       .getDirections(origin, destination, waypoints)
//       .then((response) => {
//         this.markers = []; // Limpiar marcadores anteriores
//         this.polylines = []; // Limpiar polilíneas anteriores

//         if (response.routes.length > 0) {
//           const routePath = response.routes[0];
//           const path = routePath.overview_path.map((p) => ({
//             lat: p.lat(),
//             lng: p.lng(),
//           }));

//           this.polylines.push({
//             path,
//             strokeColor: '#3f51b5',
//             strokeWeight: 5,
//             strokeOpacity: 0.8,
//           });

//           // Añadir marcadores para inicio y paradas
//           this.markers.push({
//             position: origin,
//             icon: {
//               url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
//             },
//             title: 'Almacén de Partida',
//           });
//           sortedStops.forEach((stop) => {
//             this.markers.push({
//               position: {
//                 lat: Number(stop.latitude),
//                 lng: Number(stop.longitude),
//               },
//               label: stop.sequenceOrder.toString(),
//               title: `#${stop.sequenceOrder}: ${stop.address}`,
//             });
//           });

//           // Ajustar el zoom del mapa para que se vea toda la ruta
//           this.mapBounds = routePath.bounds;
//         }
//       })
//       .catch((e) => {
//         console.error('Error al obtener la ruta de la Directions API', e);
//         this.snackBar.open(
//           'No se pudo dibujar la ruta completa en el mapa.',
//           'Cerrar',
//           { duration: 4000 }
//         );
//       });
//   }
// }

import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
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
import { AppStore } from '../../../../app.store';
import { RouteService } from '../../services/route.service';
import {
  Route,
  Stop,
  StopStatus,
} from '../../../planning-events/models/planning-event.model';
import { Order_, OrderStatus } from '../../../orders/models/order.model';
import {
  ChangeStatusDialogComponent,
  ChangeStatusDialogResult,
} from '../../../orders/components/change-status-dialog/change-status-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../../orders/services/order.service';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { DirectionsService } from '../../../../core/services/directions.service';

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
    MatDialogModule,
    GoogleMapsModule,
  ],
  templateUrl: './my-route-page.component.html',
  styleUrls: ['./my-route-page.component.scss'],
})
export class MyRoutePageComponent implements OnInit, OnDestroy {
  private directionsService = inject(DirectionsService);
  private routeService = inject(RouteService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  public appStore = inject(AppStore);
  private dialog = inject(MatDialog);
  private orderService = inject(OrderService);

  private pollingInterval: any;
  private navigationSubscription: Subscription;

  @ViewChild(GoogleMap) map!: GoogleMap;

  selectedDate: Date = new Date();
  routesForSelectedDate: Route[] = [];
  selectedRoute: Route | null = null;
  isLoading = false;

  mapOptions: google.maps.MapOptions = {
    center: { lat: -12.046374, lng: -77.042793 },
    zoom: 12,
    mapTypeControl: false,
  };
  markers: google.maps.MarkerOptions[] = [];
  polylines: google.maps.PolylineOptions[] = [];

  constructor() {
    this.navigationSubscription = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd && event.url.includes('/my-route')
        )
      )
      .subscribe(() => this.loadRoutesForDate());
  }

  ngOnInit(): void {
    this.loadRoutesForDate();
    this.startPolling();
  }

  loadRoutesForDate(): void {
    const dateString = this.selectedDate.toLocaleString('sv-SE', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    this.isLoading = true;
    this.selectedRoute = null;

    this.routeService.getMyRoutesByDate(dateString).subscribe({
      next: (data: any[]) => {
        this.routesForSelectedDate = data;
        if (data && data.length > 0) {
          this.selectedRoute =
            data.find((r: any) =>
              r.stops.some((s: any) => s.status === 'PENDIENTE')
            ) || data[0];
          this.updateMapDisplay();
        } else {
          this.updateMapDisplay(); // Limpia el mapa si no hay rutas
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.snackBar.open(
          'Error al cargar las rutas: ' + err.message,
          'Cerrar',
          { duration: 3000 }
        );
        this.isLoading = false;
      },
    });
  }

  onDateChange(): void {
    this.loadRoutesForDate();
  }

  selectRoute(index: number): void {
    if (this.routesForSelectedDate && this.routesForSelectedDate[index]) {
      this.selectedRoute = this.routesForSelectedDate[index];
      this.updateMapDisplay();
    }
  }

  private updateMapDisplay(): void {
    if (!this.selectedRoute) {
      this.markers = [];
      this.polylines = [];
      return;
    }
    this.drawMarkersOptimistically(this.selectedRoute);
    this.fetchAndDrawPolyline(this.selectedRoute);
  }

  private drawMarkersOptimistically(route: Route): void {
    if (!route.stops || route.stops.length === 0) {
      this.markers = [];
      return;
    }
    const sortedStops = route.stops
      .slice()
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const bounds = new google.maps.LatLngBounds();
    this.markers = [];

    const originPosition = {
      lat: Number(route.latitudeStartPoint),
      lng: Number(route.longitudeStartPoint),
    };
    this.markers.push({
      position: originPosition,
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
      title: 'Almacén de Partida',
    });
    bounds.extend(originPosition);

    sortedStops.forEach((stop) => {
      const stopPosition = {
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
      };
      this.markers.push({
        position: stopPosition,
        label: stop.sequenceOrder.toString(),
        title: `#${stop.sequenceOrder}: ${stop.address}`,
      });
      bounds.extend(stopPosition);
    });

    if (this.map && this.map.googleMap) {
      setTimeout(() => this.map.googleMap?.fitBounds(bounds), 0);
    }
  }

  private fetchAndDrawPolyline(route: Route): void {
    if (!route.stops || route.stops.length < 1) {
      this.polylines = [];
      return;
    }
    this.polylines = [];

    const sortedStops = route.stops
      .slice()
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
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
          this.polylines = [
            {
              path,
              strokeColor: '#3f51b5',
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          ];
        }
      })
      .catch((e) => {
        console.error('Error al obtener la polilínea de la ruta:', e);
        this.snackBar.open(
          'No se pudo dibujar el trazado de la ruta.',
          'Cerrar',
          { duration: 3000 }
        );
      });
  }

  // --- FIN DE LA ARQUITECTURA DE MAPA ---

  navigateToStop(stopIndex: number): void {
    if (!this.selectedRoute || !this.selectedRoute.stops) return;
    const sortedStops = this.selectedRoute.stops
      .slice()
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    if (stopIndex < 0 || stopIndex >= sortedStops.length) {
      console.error('Índice de parada inválido');
      return;
    }
    let origin: string;
    if (stopIndex === 0) {
      origin = `${this.selectedRoute.latitudeStartPoint},${this.selectedRoute.longitudeStartPoint}`;
    } else {
      const previousStop = sortedStops[stopIndex - 1];
      origin = `${previousStop.latitude},${previousStop.longitude}`;
    }
    const currentStop = sortedStops[stopIndex];
    const destination = `${currentStop.latitude},${currentStop.longitude}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${destination}&destination=${origin}&travelmode=driving&dir_action=navigate`;
    window.open(mapsUrl, '_blank');
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) return 'status-desconocido';
    return `status-${status.toLowerCase().replace(/[\s_]+/g, '-')}`;
  }

  getWhatsAppLink(phoneNumber: string): string {
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    let formattedPhoneNumber = cleanedPhoneNumber;
    if (
      !cleanedPhoneNumber.startsWith('51') &&
      !cleanedPhoneNumber.startsWith('+51')
    ) {
      formattedPhoneNumber = '51' + cleanedPhoneNumber;
    } else if (cleanedPhoneNumber.startsWith('+')) {
      formattedPhoneNumber = cleanedPhoneNumber.substring(1);
    }
    return `https://wa.me/${formattedPhoneNumber}`;
  }

  // manageDelivery(stop: Stop): void {
  //   // ... (Tu lógica de manageDelivery no necesita cambios)
  // }
  getAvailableStatuses(order: Order_): OrderStatus[] {
    const userRole = this.appStore.currentUser()?.role;
    order.status === OrderStatus.REGISTRADO;

    let almacen = [OrderStatus.EN_ALMACEN];
    if (userRole === 'MOTORIZADO' && OrderStatus.REGISTRADO) {
      almacen = [];
    }

    switch (order.status) {
      case OrderStatus.REGISTRADO:
        return [OrderStatus.RECOGIDO, ...almacen, OrderStatus.CANCELADO];
      case OrderStatus.RECOGIDO:
        return [OrderStatus.EN_ALMACEN, OrderStatus.CANCELADO];
      case OrderStatus.EN_ALMACEN:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
      case OrderStatus.EN_TRANSITO:
        return [
          OrderStatus.ENTREGADO,
          OrderStatus.RECHAZADO,
          OrderStatus.REPROGRAMADO,
        ];
      case OrderStatus.REPROGRAMADO:
        return [OrderStatus.EN_TRANSITO, OrderStatus.CANCELADO];
      default:
        return [];
    }
  }

  manageDelivery(stop: Stop): void {
    let order: Order_ = stop.order;

    const availableStatuses = this.getAvailableStatuses(order);
    if (availableStatuses.length === 0) {
      this.snackBar.open(
        'No hay cambios de estado disponibles para este pedido.',
        'OK',
        { duration: 3000 }
      );
      return;
    }

    const dialogRef = this.dialog.open<
      ChangeStatusDialogComponent,
      { order: Order_; availableStatuses: OrderStatus[] },
      ChangeStatusDialogResult
    >(ChangeStatusDialogComponent, {
      width: '450px',
      data: { order: order, availableStatuses: availableStatuses },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.newStatus) {
        console.log('Dialog result:', result);
        const updatePayload: any = {
          newStatus: result.newStatus,
          reason: result.reason || '',
          proofOfDeliveryImageUrl: '',
          shippingCostPaymentMethod: '',
          collectionPaymentMethod: '',
        };
        if (result.newStatus === OrderStatus.ENTREGADO) {
          if (result.proofOfDeliveryImageUrl) {
            updatePayload.proofOfDeliveryImageUrl =
              result.proofOfDeliveryImageUrl;
          }
          if (result.shippingCostPaymentMethod) {
            updatePayload.shippingCostPaymentMethod =
              result.shippingCostPaymentMethod;
          }
          if (result.collectionPaymentMethod) {
            updatePayload.collectionPaymentMethod =
              result.collectionPaymentMethod;
          }
        }
        this.orderService
          .updateOrderStatus(
            order.id,
            result.newStatus,
            result.reason || '',
            result.proofOfDeliveryImageUrl,
            result.shippingCostPaymentMethod,
            result.collectionPaymentMethod
          )
          .subscribe({
            next: (updatedOrder) => {
              this.snackBar.open(
                `Estado del pedido ${updatedOrder.code} actualizado a ${result.newStatus}.`,
                'OK',
                { duration: 3000, panelClass: ['success-snackbar'] }
              );
              this.loadRoutesForDate();
            },
            error: (err) => {
              this.snackBar.open(
                `Error al actualizar estado: ${
                  err.message || 'Intente de nuevo'
                }`,
                'Cerrar',
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
              this.isLoading = false;
            },
            complete: () => {
              this.isLoading = false;
            },
          });
        console.log('updatePayload', updatePayload);
      } else {
        console.log('Cambio de estado cancelado o sin selección.');
      }
    });
  }

  isStopActive(stop: Stop): boolean {
    if (!this.selectedRoute) return false;
    const firstPendingStop = this.selectedRoute.stops.find(
      (s) =>
        s.order.status !== OrderStatus.ENTREGADO &&
        s.order.status !== OrderStatus.RECHAZADO &&
        s.order.status !== OrderStatus.ANULADO
    );
    return firstPendingStop ? firstPendingStop.id === stop.id : false;
  }

  isStopCompleted(stop: Stop): boolean {
    return (
      stop.status === StopStatus.COMPLETED ||
      stop.status === StopStatus.INCIDENCIA
    );
  }

  startPolling(): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => this.loadRoutesForDate(), 20000);
  }

  stopPolling(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
  }
}
