import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppStore } from './app.store';
import { NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from './core/services/auth.service';
import { Subject } from 'rxjs';
import { NoticeService } from './core/services/notice.service'; // Ajusta ruta
import {
  RouteSpecificNoticeDialogComponent,
  RouteNoticeDialogData,
} from './features/shared/components/route-specific-notice-dialog/route-specific-notice-dialog.component'; // Ajusta ruta
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter, takeUntil, switchMap, tap } from 'rxjs/operators';
import { NavigationEnd, Event as RouterEvent } from '@angular/router'; // Event para tipar

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getAccessToken();
    if (token) {
      this.authService.getCurrentUserFromBackend().subscribe({
        next: () => console.log('Usuario cargado al iniciar'),
        error: () => console.warn('No se pudo cargar usuario al iniciar'),
      });
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
        this.openRouteNoticeDialog(noticeData);
      });
  }
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
}
