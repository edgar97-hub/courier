import { Component, effect, inject, Injector, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppStore } from './app.store';
import { NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from './core/services/auth.service';
import { Subject } from 'rxjs';
import { NoticeService } from './core/services/notice.service';
import {
  RouteSpecificNoticeDialogComponent,
  RouteNoticeDialogData,
} from './features/shared/components/route-specific-notice-dialog/route-specific-notice-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter, takeUntil, switchMap, tap } from 'rxjs/operators';
import { NavigationEnd, Event as RouterEvent } from '@angular/router';
import {
  MenuItem,
  menuItems as baseMenuItems,
} from './shared/components/custom-sidenav/menu-items';
import { DirectionsService } from './core/services/directions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="appStore.isLoading()"></mat-progress-bar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  appStore = inject(AppStore);
  router = inject(Router);
  private noticeService = inject(NoticeService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private currentNoticeDialogRef: MatDialogRef<RouteSpecificNoticeDialogComponent> | null =
    null;
  private justShowedRouteNotice = false;
  private directionsService = inject(DirectionsService);

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getAccessToken();
    if (token) {
      this.authService.getCurrentUserFromBackend().subscribe({
        next: () => console.log('Usuario cargado al iniciar'),
        error: () => console.warn('No se pudo cargar usuario al iniciar'),
      });
      console.log(
        'AppComponent initialized, triggering Google Maps API load...'
      );
    }

    this.router.events
      .pipe(
        filter(
          (event: RouterEvent): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        tap((event: NavigationEnd) =>
          console.log(
            'AppComponent: NavigationEnd event detected for:',
            event.urlAfterRedirects
          )
        ),
        switchMap((event: NavigationEnd) => {
          const currentRoute = event.urlAfterRedirects.split('?')[0];
          const currentUser = this.appStore.currentUser();
          const cleanedTargetRoute = this.cleanRoute(currentRoute);

          if (
            cleanedTargetRoute !== 'register' &&
            cleanedTargetRoute !== 'tracking' &&
            !this.hasAccess(currentUser?.role || '', currentRoute)
          ) {
            this.router.navigate(['login']);
          }
          return this.noticeService.getNoticeForRoute(currentRoute);
        }),
        filter(
          (noticeData): noticeData is RouteNoticeDialogData =>
            noticeData !== null
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((noticeData) => {
        if (this.currentNoticeDialogRef) {
          this.currentNoticeDialogRef.close();
        }
        this.justShowedRouteNotice = true;
        this.openRouteNoticeDialog(noticeData);
        setTimeout(() => (this.justShowedRouteNotice = false), 500);
      });

    // let previousIsAuthenticated = this.appStore.isAuthenticated();

    // effect(
    //   () => {
    //     const currentIsAuthenticated = this.appStore.isAuthenticated();
    //     console.log(
    //       'AppComponent Auth Effect: PrevAuth:',
    //       previousIsAuthenticated,
    //       'CurrAuth:',
    //       currentIsAuthenticated
    //     );
    //     if (!previousIsAuthenticated && currentIsAuthenticated) {
    //       // El usuario ACABA de iniciar sesión
    //       console.log(
    //         'AppComponent: User just logged in. Checking for global notice.'
    //       );
    //       if (!this.justShowedRouteNotice) {
    //         // No mostrar si un aviso por ruta se mostró en el mismo ciclo
    //         this.noticeService
    //           .getGlobalLoginNotice()
    //           .pipe(
    //             filter(
    //               (noticeData): noticeData is RouteNoticeDialogData =>
    //                 noticeData !== null
    //             ),
    //             takeUntil(this.destroy$)
    //           )
    //           .subscribe((globalNoticeData) => {
    //             console.log(
    //               'AppComponent: Global login notice received:',
    //               globalNoticeData
    //             );
    //             // this.openRouteNoticeDialog(globalNoticeData);
    //           });
    //       } else {
    //         console.log(
    //           'AppComponent: Skipping global notice as route notice was just shown.'
    //         );
    //       }
    //     }
    //     previousIsAuthenticated = currentIsAuthenticated; // Actualizar para la próxima comprobación
    //   },
    //   { injector: this.injector }
    // ); // Pasar el injector si es necesario para servicios dentro del effect
  }
  private injector = inject(Injector);

  openRouteNoticeDialog(data: RouteNoticeDialogData): void {
    const isMobile = window.innerWidth < 768; // Detección simple de móvil

    this.currentNoticeDialogRef = this.dialog.open<
      RouteSpecificNoticeDialogComponent,
      RouteNoticeDialogData
    >(RouteSpecificNoticeDialogComponent, {
      data: data,
      width: isMobile ? '95vw' : '600px', // Más ancho en móvil
      maxWidth: '95vw', // Consistente en móvil
      height: '90vh', // Altura automática
      // height: isMobile ? 'auto' : 'auto', // Altura automática
      // maxHeight: isMobile ? '90vh' : '85vh', // Ligeramente diferente para móvil
      disableClose: false,
      autoFocus: 'dialog',
      panelClass: [
        'app-notice-dialog-panel',
        isMobile ? 'mobile-fullscreen-dialog' : '',
      ], // Clases condicionales
    });

    this.currentNoticeDialogRef.afterClosed().subscribe((result) => {
      console.log('Notice dialog closed, result:', result);
      this.currentNoticeDialogRef = null;
    });
  }
  cleanRoute(route: string): string {
    let cleaned = route;
    if (cleaned.startsWith('/')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    return cleaned;
  }
  /**
   * Valida si un usuario tiene acceso a una ruta específica basándose en su rol.
   *
   * @param {string} userRole - El rol del usuario (ej. 'EMPRESA').
   * @param {string} targetRoute - La ruta a la que se intenta acceder (ej. 'districts', 'users/detail/').
   * @returns {boolean} - Retorna true si el usuario tiene acceso, false en caso contrario.
   */
  hasAccess(userRole: string, targetRoute: string) {
    const cleanedTargetRoute = this.cleanRoute(targetRoute);

    for (const item of baseMenuItems) {
      // Validar ítems principales
      if (item.roles && item.roles.includes(userRole)) {
        const cleanedItemRoute = item.route ? this.cleanRoute(item.route) : '';

        // Coincidencia exacta de la ruta
        if (cleanedItemRoute === cleanedTargetRoute) {
          return true;
        }

        // Manejar rutas dinámicas: si la ruta del ítem es un prefijo de la ruta objetivo
        // Por ejemplo, cleanedItemRoute 'users/detail' y cleanedTargetRoute 'users/detail/123'
        if (
          cleanedItemRoute &&
          cleanedTargetRoute.startsWith(cleanedItemRoute)
        ) {
          // Asegurarse de que no sea una coincidencia parcial incorrecta (ej. 'users' no coincide con 'userslist')
          if (
            cleanedTargetRoute.length === cleanedItemRoute.length ||
            cleanedTargetRoute[cleanedItemRoute.length] === '/'
          ) {
            return true;
          }
        }
      }

      // Validar sub-ítems
      if (item.subItems) {
        for (const subItem of item.subItems) {
          // Un sub-item es accesible si el padre tiene el rol.
          if (item.roles && item.roles.includes(userRole)) {
            const cleanedSubItemRoute = subItem.route
              ? this.cleanRoute(subItem.route)
              : '';

            // Coincidencia exacta de la ruta
            if (cleanedSubItemRoute === cleanedTargetRoute) {
              return true;
            }

            // Manejar rutas dinámicas para sub-ítems
            if (
              cleanedSubItemRoute &&
              cleanedTargetRoute.startsWith(cleanedSubItemRoute)
            ) {
              if (
                cleanedTargetRoute.length === cleanedSubItemRoute.length ||
                cleanedTargetRoute[cleanedSubItemRoute.length] === '/'
              ) {
                return true;
              }
            }
          }
        }
      }
    }
    return false; // Si no se encontró ninguna coincidencia
  }
}
