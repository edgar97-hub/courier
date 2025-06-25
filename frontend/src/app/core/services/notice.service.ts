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
    // Cargar avisos vistos desde sessionStorage al iniciar
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

  // Este método simula obtener un aviso específico para una ruta.
  // En una aplicación real, esto podría venir de una configuración, una API, etc.
  getNoticeForRoute(
    routePath: string
  ): Observable<RouteNoticeDialogData | null> {
    // Identificador único para este aviso/ruta combination
    const noticeId = `notice_for_${routePath.replace(/\//g, '_')}`;

    // if (this.viewedNotices.has(noticeId)) {
    //   console.log(`Aviso para ruta '${routePath}' ya mostrado en esta sesión.`);
    //   return of(null); // Ya se mostró en esta sesión
    // }

    // Lógica para determinar qué aviso mostrar según la ruta
    // Esto es un EJEMPLO. Deberías tener una fuente de datos para tus avisos.
    let noticeData: RouteNoticeDialogData | null = null;
    let global_notice_url =
      environment.apiUrl + '/settings/company/global-notice-image';
    environment;
    if (routePath.includes('dashboard')) {
      noticeData = {
        title: '¡Bienvenido al Dashboard!',
        message:
          'Recuerda revisar tus tareas pendientes y las últimas actualizaciones.',
        imageUrl: global_notice_url,
        confirmButtonText: 'Cerrar',
      };
    }

    // if (routePath.includes('orders/create')) {
    //   noticeData = {
    //     title: '¡Bienvenido al Dashboard!',
    //     message:
    //       'Recuerda revisar tus tareas pendientes y las últimas actualizaciones.',
    //     imageUrl: global_notice_url,
    //     confirmButtonText: 'Cerrar',
    //   };
    // }

    // else if (routePath.includes('users')) {
    //   noticeData = {
    //     title: 'Gestión de Usuarios',
    //     message:
    //       'Desde aquí puedes administrar todos los usuarios del sistema. <strong>¡Ten cuidado al eliminar!</strong>',
    //     confirmButtonText: 'De acuerdo',
    //   };
    // } else if (routePath.includes('tarifas')) {
    //   // <--- El ejemplo de tu cotización
    //   noticeData = {
    //     title: 'Información de Tarifas',
    //     message:
    //       'Consulta nuestras tarifas actualizadas para todos los destinos.',
    //     imageUrl: 'URL_DE_TU_IMAGEN_DE_TARIFAS_AQUI', // La URL que obtendrías de tu API
    //     // altText: 'Tabla de tarifas',
    //   };
    // }
    // // Añade más condiciones para otras rutas

    if (noticeData) {
      // Marcar como que se va a mostrar (aunque el usuario lo cierre sin confirmar)
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

    // console.log('NoticeService: Fetching global login notice...');
    // Este aviso podría ser siempre el mismo o configurable.
    // Aquí usaremos la imagen global configurada en Settings.
    // return this.settingsService.getGlobalNoticeImageUrl().pipe(
    //   // Asume que tienes este método en SettingsService
    //   map((imageUrl) => {
    //     if (imageUrl) {
    //       return {
    //         // Puedes definir un título, mensaje, etc. por defecto o también desde config
    //         title: '¡Bienvenido/a!',
    //         message: 'Gracias por iniciar sesión. Tenemos novedades para ti.',
    //         imageUrl: imageUrl,
    //         buttonText: 'Ver Novedades',
    //         linkUrl: '/novedades', // Opcional: un enlace
    //         isGlobalNotice: true, // Una bandera para diferenciarlo si es necesario
    //       };
    //     }
    //     return null; // No hay aviso global si no hay imagen configurada
    //   }),
    //   catchError((err) => {
    //     console.error('Error fetching global notice image URL:', err);
    //     return of(null);
    //   })
    // );
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

  // Podrías tener un método para resetear los avisos vistos si es necesario
  // resetViewedNotices(): void {
  //   this.viewedNotices.clear();
  //   sessionStorage.removeItem(VIEWED_NOTICES_SESSION_KEY);
  // }
}
