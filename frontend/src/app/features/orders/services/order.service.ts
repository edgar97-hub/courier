import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { OrderFilterCriteria } from '../models/order-filter.model';
import {
  PaginatedOrdersResponse, // Ya existente
  DistrictOption,
  MaxPackageDimensions,
  ShippingCostResponse,
  CreateBatchOrderPayload,
  Order,
} from '../models/order.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ImportResult } from '../components/order-import-modal/order-import-modal.component';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  readonly apiUrlOrders = environment.apiUrl + '/orders';
  readonly apiUrlDistricts = environment.apiUrl + '/districts';
  readonly apiUrlUsers = environment.apiUrl + '/users';
  readonly apiUrlSettings = environment.apiUrl + '/settings';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // ESTÁNDAR
        codrr_token: token, // Como lo tenías
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getOrders(
    filters?: OrderFilterCriteria,
    page: number = 1, // API suele esperar page index 1-based
    pageSize: number = 10,
    sortField: string = 'id', // Campo por defecto para ordenar
    sortDirection: 'asc' | 'desc' = 'desc' // Dirección por defecto
  ): Observable<PaginatedOrdersResponse> {
    let params = new HttpParams()
      .set('page_number', page.toString()) // Asegúrate que estos nombres de param coincidan con tu API
      .set('page_size', pageSize.toString())
      .set('sort_field', sortField)
      .set('sort_direction', sortDirection);

    if (filters) {
      if (filters.start_date) {
        params = params.set('start_date', filters.start_date);
      }
      if (filters.end_date) {
        params = params.set('end_date', filters.end_date);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.search_term && filters.search_term.trim() !== '') {
        params = params.set('search_term', filters.search_term.trim());
      }
      if (filters.myOrders) {
        params = params.set('my_orders', 'true');
      }
    }

    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .get<PaginatedOrdersResponse>(this.apiUrlOrders, { params, headers })
      .pipe(
        map((response) => {
          // Si necesitas transformar las fechas de string a Date object aquí:
          // response.items = response.items.map(order => ({
          //   ...order,
          //   registration_date: new Date(order.registration_date),
          //   delivery_date: order.delivery_date ? new Date(order.delivery_date) : null,
          // }));
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getOrders2(
    filters?: OrderFilterCriteria,
    sortField: string = 'id', // Campo por defecto para ordenar
    sortDirection: 'asc' | 'desc' = 'desc' // Dirección por defecto
  ): Observable<Order[]> {
    let params = new HttpParams()
      .set('sort_field', sortField)
      .set('sort_direction', sortDirection);

    if (filters) {
      if (filters.start_date) {
        params = params.set('start_date', filters.start_date);
      }
      if (filters.end_date) {
        params = params.set('end_date', filters.end_date);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.search_term && filters.search_term.trim() !== '') {
        params = params.set('search_term', filters.search_term.trim());
      }
    }

    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .get<Order[]>(this.apiUrlOrders + '/filtered-orders', {
        params,
        headers,
      })
      .pipe(
        map((response: any) => {
          // Si necesitas transformar las fechas de string a Date object aquí:
          // response.items = response.items.map(order => ({
          //   ...order,
          //   registration_date: new Date(order.registration_date),
          //   delivery_date: order.delivery_date ? new Date(order.delivery_date) : null,
          // }));
          return response.items;
        }),
        catchError(this.handleError)
      );
  }

  getOrderStatuses(): Observable<string[]> {
    return new Observable((observer) => {
      observer.next([
        'REGISTRADO',
        'RECOGIDO',
        'EN ALMACEN',
        'EN TRANSITO',
        'ENTREGADO',
        'CANCELADO',
        'RECHAZADO EN PUNTO',
        'REPROGRAMADO',
        'ANULADO',
      ]);
      observer.complete();
    });
  }

  getDeliveryDistricts(): Observable<DistrictOption[]> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .get<DistrictOption[]>(`${this.apiUrlDistricts}/all`, { headers })
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(
    orderId: number | string,
    newStatus: string,
    reason?: string,
    product_delivery_photo_url?: string | null,
    payment_method_for_shipping_cost?: string | null,
    payment_method_for_collection?: string | null
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    let payload: any = {
      orderId,
      reason,
      newStatus,
      action: 'CAMBIO DE ESTADO',
    };
    if (product_delivery_photo_url) {
      payload.product_delivery_photo_url = product_delivery_photo_url;
    }
    if (payment_method_for_shipping_cost) {
      payload.payment_method_for_shipping_cost =
        payment_method_for_shipping_cost;
    }
    if (payment_method_for_collection) {
      payload.payment_method_for_collection = payment_method_for_collection;
    }
    return this.http
      .post<{ success: boolean; message: string; batchId?: string }>(
        `${this.apiUrlOrders}/update-order-status`,
        {
          payload,
        },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  getMaxPackageDimensions(): Observable<MaxPackageDimensions> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    return this.http
      .get<MaxPackageDimensions>(`${this.apiUrlSettings}/all`, { headers })
      .pipe(
        tap((apiResponse) =>
          console.log(
            'OrderService: API response for max dimensions:',
            apiResponse
          )
        ),
        map((apiResponse: any): MaxPackageDimensions => {
          console.log('apiResponse', apiResponse);
          if (apiResponse.length) {
            let standard_package_info =
              'Estándar : ' +
              apiResponse[0].standard_measurements_length +
              'cmx' +
              apiResponse[0].standard_measurements_width +
              'cmx' +
              apiResponse[0].standard_measurements_height +
              'cm ' +
              apiResponse[0].standard_measurements_weight +
              'kg';

            let info_text =
              'Las entregas en motorizado permiten paquetes de hasta ' +
              apiResponse[0].maximum_measurements_length +
              ' cm x ' +
              apiResponse[0].maximum_measurements_width +
              ' cm x  ' +
              apiResponse[0].maximum_measurements_height +
              ' cm y ' +
              apiResponse[0].maximum_measurements_weight +
              ' kg. Si se exceden estas medidas o peso, se cobrará una tarifa distinta porque la entrega será en una van.';

            return {
              max_length_cm: apiResponse[0].maximum_measurements_length,
              max_width_cm: apiResponse[0].maximum_measurements_width,
              max_height_cm: apiResponse[0].maximum_measurements_height,
              max_weight_kg: apiResponse[0].maximum_measurements_weight,

              sta_length_cm: apiResponse[0].standard_measurements_length,
              sta_width_cm: apiResponse[0].standard_measurements_width,
              sta_height_cm: apiResponse[0].standard_measurements_height,
              sta_weight_kg: apiResponse[0].standard_measurements_weight,

              volumetric_factor: apiResponse[0].volumetric_factor,

              standard_package_info: standard_package_info,
              info_text: info_text,
            };
          }
          return {
            max_length_cm: 0,
            max_width_cm: 0,
            max_height_cm: 0,
            max_weight_kg: 0,

            sta_length_cm: 0,
            sta_width_cm: 0,
            sta_height_cm: 0,
            sta_weight_kg: 0,
            volumetric_factor: 0,
            standard_package_info: '',
            info_text: '',
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(
            'OrderService: API error fetching max package dimensions. Details:',
            error.message
          );

          return of({
            max_length_cm: 30,
            max_width_cm: 25,
            max_height_cm: 45,
            max_weight_kg: 5,
            standard_package_info: 'Estándar : 30cmx15cmx20cm 1.5kg',
            info_text:
              'Las entregas en motorizado permiten paquetes de hasta 25 cm x 30 cm x 45 cm y 5 kg. Si se exceden estas medidas o peso, se cobrará una tarifa distinta porque la entrega será en una van.',
          }).pipe(delay(200));
        })
      );
  }

  calculateShippingCost(packageData: {
    delivery_district_id: string | number;
    package_size_type: 'standard' | 'custom';
    package_width_cm?: number | null;
    package_length_cm?: number | null;
    package_height_cm?: number | null;
    package_weight_kg?: number | null;
  }): Observable<ShippingCostResponse> {
    console.log('packageData', packageData);
    // return this.http.post<ShippingCostResponse>(`${this.baseUrl}/shipping/calculate-cost`, packageData).pipe(catchError(this.handleError));
    // Simulación:
    console.log(
      'OrderService: Calculating shipping cost (simulated) for',
      packageData
    );
    let cost = 8; // Costo base estándar
    if (packageData.package_size_type === 'custom') {
      cost = 10; // Costo base para custom
      if ((packageData.package_weight_kg || 0) > 2) cost += 5;
      if (
        (packageData.package_length_cm || 0) > 30 ||
        (packageData.package_width_cm || 0) > 25 ||
        (packageData.package_height_cm || 0) > 20
      )
        cost += 4;
    }
    if (packageData.delivery_district_id === 'D003') cost += 2; // Surquillo un poco más
    return of({ shipping_cost: cost }).pipe(delay(500));
  }

  createBatchOrders(
    payload: CreateBatchOrderPayload
  ): Observable<{ success: boolean; message: string; batchId?: string }> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .post<{ success: boolean; message: string; batchId?: string }>(
        `${this.apiUrlOrders}/batch-create`,
        payload,
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  importOrdersFromParsedJson(parsedOrders: any[]): Observable<ImportResult> {
    console.log(
      'OrderService: Sending parsed JSON to backend for import',
      parsedOrders
    );

    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .post<ImportResult>(
        `${this.apiUrlOrders}/import-batch-json`,
        parsedOrders,
        { headers }
      )
      .pipe(catchError(this.handleImportError));
  }

  getAvailableDrivers(searchTerm: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let params = new HttpParams()
      .set('search_term', searchTerm)
      .set('role', 'MOTORIZADO');

    return this.http
      .get<any>(`${this.apiUrlUsers}/filtered`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  getCompanies(searchTerm: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let params = new HttpParams()
      .set('search_term', searchTerm)
      .set('role', 'EMPRESA');

    return this.http
      .get<any>(`${this.apiUrlUsers}/filtered`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  getDistricts(searchTerm: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    let params = new HttpParams().set('search_term', searchTerm);

    return this.http
      .get<any>(`${this.apiUrlDistricts}/filtered`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  // getOrders2(
  //   filters?: OrderFilterCriteria,
  //   sortField: string = 'id', // Campo por defecto para ordenar
  //   sortDirection: 'asc' | 'desc' = 'desc' // Dirección por defecto
  // ): Observable<Order[]> {
  //   let params = new HttpParams()
  //     .set('sort_field', sortField)
  //     .set('sort_direction', sortDirection);

  //   if (filters) {
  //     if (filters.start_date) {
  //       params = params.set('start_date', filters.start_date);
  //     }
  //     if (filters.end_date) {
  //       params = params.set('end_date', filters.end_date);
  //     }
  //     if (filters.status) {
  //       params = params.set('status', filters.status);
  //     }
  //     if (filters.search_term && filters.search_term.trim() !== '') {
  //       params = params.set('search_term', filters.search_term.trim());
  //     }
  //   }

  //   const headers = this.getAuthHeaders();
  //   if (!this.authService.getAccessToken()) {
  //     return throwError(() => new Error('Not authenticated to fetch users.'));
  //   }
  //   return this.http
  //     .get<Order[]>(this.apiUrlOrders + '/filtered-orders', {
  //       params,
  //       headers,
  //     })
  //     .pipe(
  //       map((response: any) => {
  //         // Si necesitas transformar las fechas de string a Date object aquí:
  //         // response.items = response.items.map(order => ({
  //         //   ...order,
  //         //   registration_date: new Date(order.registration_date),
  //         //   delivery_date: order.delivery_date ? new Date(order.delivery_date) : null,
  //         // }));
  //         return response.items;
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

  assignDriverToOrder(
    orderId: string | number,
    motorizedId: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .put<{ success: boolean; message: string }>(
        `${this.apiUrlOrders}/assign-driver-to-order/` + orderId,
        {
          motorizedId,
        },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  rescheduleOrder(
    orderId: number | string,
    newDate: string,
    reason?: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    return this.http
      .put<{ success: boolean; message: string }>(
        `${this.apiUrlOrders}/reschedule-order/` + orderId,
        {
          newDate,
          reason,
        },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  updateOrderAmountToCollect(
    orderId: number | string,
    newValue: number,
    notes?: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    let payload: any = {
      orderId,
      newValue,
      notes,
      action: 'MODIFICACIÓN DEL MONTO A COBRAR',
    };

    return this.http
      .post<{ success: boolean; message: string; batchId?: string }>(
        `${this.apiUrlOrders}/update-order-status`,
        {
          payload,
        },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  updateOrderShippingCost(
    orderId: number | string,
    newValue: number,
    notes?: string
  ): Observable<any> {
    // event.orderId,
    //   event.newShippingCost,
    //   event.observation

    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }

    let payload: any = {
      orderId,
      newValue,
      notes,
      action: 'MODIFICACIÓN DEL COSTO DE ENVÍO',
    };

    return this.http
      .post<{ success: boolean; message: string; batchId?: string }>(
        `${this.apiUrlOrders}/update-order-status`,
        {
          payload,
        },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  private handleImportError(error: HttpErrorResponse): Observable<never> {
    console.error('API Import Error:', error);
    let result: ImportResult = {
      success: false,
      message: 'Error de comunicación con el servidor durante la importación.',
      errors: [
        {
          row: 0,
          message: `Error: ${error.status} - ${
            error.statusText || 'Error desconocido'
          }`,
        },
      ],
    };
    // Si el backend devuelve un objeto ImportResult en el cuerpo del error:
    if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      result = { ...result, ...error.error }; // Sobrescribir con el error del backend
    }
    return throwError(() => result); // Devolver el objeto ImportResult para que el componente lo maneje
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de error
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.message || error.error?.message || 'Server error'
      }`;
      if (error.status === 0) {
        errorMessage =
          'Could not connect to the server. Please check your network or if the server is running.';
      }
    }
    console.error('API Error in OrderService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
