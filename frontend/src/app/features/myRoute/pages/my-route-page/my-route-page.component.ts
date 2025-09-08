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
import { Order_, OrderStatus } from '../../../orders/models/order.model';
import {
  ChangeStatusDialogComponent,
  ChangeStatusDialogResult,
} from '../../../orders/components/change-status-dialog/change-status-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../../orders/services/order.service';

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
  private dialog = inject(MatDialog);

  private orderService = inject(OrderService);
  isLoading = false;

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
  getStatusClass(status: string | undefined | null): string {
    if (!status) {
      return 'status-desconocido'; // O una clase por defecto
    }
    const formattedStatus = status.toLowerCase().replace(/[\s_]+/g, '-');
    return `status-${formattedStatus}`;
  }

  loadRoutesForDate(): void {
    // this.appStore.setLoading(true);
    const dateString = this.selectedDate.toLocaleString('sv-SE', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

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
    // alert('funcionalidad pendiente');
    if (!this.selectedRoute || this.selectedRoute.stops.length === 0) return;

    console.log(this.selectedRoute);
    let _origin: any = this.selectedRoute.stops[0];
    let _destination: any =
      this.selectedRoute.stops[this.selectedRoute.stops.length - 1];
    console.log(_origin, _destination);
    const origin = `${this.selectedRoute.latitudeStartPoint},${this.selectedRoute.longitudeEndPoint}`;
    const destination = `${_destination.latitude},${_destination.longitude}`;

    const waypoints = this.selectedRoute.stops
      .filter((item, index) => index !== 0)
      .slice(0, -1)
      .map((stop: any) => `${stop.latitude},${stop.longitude}`)
      .join('|');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  }

  // Genera la URL para navegar a una parada específica
  navigateToStop(stop: Stop): void {
    const destination = `${stop.latitude},${stop.longitude}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  }

  hasPermision(order: Order_): boolean {
    const userRole = this.appStore.currentUser()?.role;

    if (userRole === 'MOTORIZADO') {
      if (order.status === OrderStatus.REGISTRADO) {
        return true;
      }

      if (order.assigned_driver?.id === this.appStore.currentUser()?.id) {
        return true;
      }
    }
    if (userRole === 'ADMINISTRADOR' || userRole === 'RECEPCIONISTA') {
      return true;
    }
    return false;
  }

  // Navega a la página de detalle de pedido existente
  // manageDelivery(stop: Stop): void {
  //   alert('funcionalidad pendiente');
  //   return;
  //   this.router.navigate(['/orders', stop.orderCode], {
  //     queryParams: { returnUrl: this.router.url },
  //   });
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

  // Lógica para el polling
  startPolling(): void {
    this.stopPolling(); // Asegura que no haya intervalos duplicados
    this.pollingInterval = setInterval(() => {
      this.loadRoutesForDate();
    }, 20000); // Refresca cada 20 segundos
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
