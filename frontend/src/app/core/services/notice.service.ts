import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { RouteNoticeDialogData } from '../../features/shared/components/route-specific-notice-dialog/route-specific-notice-dialog.component'; // Ajusta ruta
import { environment } from '../../../environments/environment';

// Para evitar mostrar el mismo aviso repetidamente en la misma sesión de usuario
const VIEWED_NOTICES_SESSION_KEY = 'viewedRouteNotices';

@Injectable({
  providedIn: 'root',
})
export class NoticeService {
  private viewedNotices: Set<string> = new Set();

  constructor() {
    const storedNotices = sessionStorage.getItem(VIEWED_NOTICES_SESSION_KEY);
    if (storedNotices) {
      try {
        this.viewedNotices = new Set(JSON.parse(storedNotices));
      } catch (e) {
        console.error('Error parsing viewed notices from session storage', e);
        this.viewedNotices = new Set();
      }
    }
  }

  getNoticeForRoute(
    routePath: string
  ): Observable<RouteNoticeDialogData | null> {
    const noticeId = `notice_for_${routePath.replace(/\//g, '_')}`;

    let noticeData: RouteNoticeDialogData | null = null;
    let global_notice_url =
      environment.apiUrl + '/settings/company/global-notice-image';

    if (routePath.includes('dashboard')) {
      noticeData = {
        title: '¡Bienvenido al Dashboard!',
        message:
          'Recuerda revisar tus tareas pendientes y las últimas actualizaciones.',
        imageUrl: global_notice_url,
        confirmButtonText: 'Cerrar',
      };
    }

    if (noticeData) {
      this.markNoticeAsViewed(noticeId);
      return of(noticeData).pipe(delay(100)); // Simula una pequeña demora
    }

    return of(null); // No hay aviso para esta ruta
  }

  getGlobalLoginNotice(): Observable<RouteNoticeDialogData | null> {
    let noticeData: RouteNoticeDialogData | null = null;
    let global_notice_url =
      environment.apiUrl + '/settings/company/global-notice-image';
    environment;
    noticeData = {
      title: '¡Bienvenido al Dashboard!',
      message:
        'Recuerda revisar tus tareas pendientes y las últimas actualizaciones.',
      imageUrl: global_notice_url,
      confirmButtonText: 'Cerrar',
    };
    return of(noticeData).pipe(delay(100)); // Simula una pequeña demora
  }
  private markNoticeAsViewed(noticeId: string): void {
    this.viewedNotices.add(noticeId);
    try {
      sessionStorage.setItem(
        VIEWED_NOTICES_SESSION_KEY,
        JSON.stringify(Array.from(this.viewedNotices))
      );
    } catch (e) {
      console.error('Error saving viewed notices to session storage', e);
    }
  }
}
