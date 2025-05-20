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
} from '../models/order.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  //   private apiUrl = 'http://localhost:8000/api/orders/distr';
  readonly apiUrl = environment.apiUrl + '/districts';
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
    }

    console.log(
      'OrderService: Fetching orders with params:',
      params.toString()
    );
    return this.http.get<PaginatedOrdersResponse>(this.apiUrl, { params }).pipe(
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

  // Podrías tener un método para obtener los posibles estados si vienen de la API
  getOrderStatuses(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/statuses`).pipe(catchError(this.handleError));
    // Por ahora, un mock:
    return new Observable((observer) => {
      observer.next([
        'Pending',
        'In Transit',
        'Delivered',
        'Cancelled',
        'On Hold',
      ]);
      observer.complete();
    });
  }

  getDeliveryDistricts(): Observable<DistrictOption[]> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    console.log('getDeliveryDistricts');
    return this.http
      .get<DistrictOption[]>(`${this.apiUrl}/all`, { headers })
      .pipe(catchError(this.handleError));
    // Simulación:
    // console.log('OrderService: Fetching delivery districts (simulated)');
    // return of([
    //   { id: 'D001', name: 'Miraflores', coverage_info: 'Cobertura completa.' },
    //   { id: 'D002', name: 'San Isidro', coverage_info: 'Cobertura completa.' },
    //   {
    //     id: 'D003',
    //     name: 'Surquillo',
    //     coverage_info: 'Verificar cobertura en algunas zonas.',
    //   },
    //   { id: 'D004', name: 'Lince', coverage_info: 'Cobertura completa.' },
    // ]).pipe(delay(300));
  }

  getMaxPackageDimensions(): Observable<MaxPackageDimensions> {
    const headers = this.getAuthHeaders();
    if (!this.authService.getAccessToken()) {
      return throwError(() => new Error('Not authenticated to fetch users.'));
    }
    // return this.http
    //   .get<MaxPackageDimensions>(`${this.apiUrlSettings}/all`, { headers })
    //   .pipe(catchError(this.handleError));

    // // Simulación:
    // console.log('OrderService: Fetching max package dimensions (simulated)');
    // return of({
    //   max_length_cm: 30,
    //   max_width_cm: 25,
    //   max_height_cm: 45,
    //   max_weight_kg: 5,
    //   standard_package_info: 'Estándar : 30cmx15cmx20cm 1.5kg',
    //   info_text:
    //     'MEDIDAS MAXIMAS (Largo 30 cm x Ancho 25 cm x Alto 45 cm) y PESO MAXIMO (5 kilogramos)',
    // }).pipe(delay(200));
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
            //address: "test"
            // business_name: "empresa prueba"
            // createdAt: "2025-05-15T14:50:57.957Z"
            // id: "8ae01119-0ca4-4aed-9c03-bae8df1fb8db"
            // logo_url: null
            // maximum_measurements_height: 0
            // maximum_measurements_length: 4
            // maximum_measurements_weight: 7
            // maximum_measurements_width: 5
            // phone_number: "951954633"
            // standard_measurements_height: 5
            // standard_measurements_length: 9
            // standard_measurements_weight: 2
            // standard_measurements_width: 2
            // terms_conditions_url: null
            // updatedAt: "2025-05-20T22:39:37.631Z"
            // volumetric_factor: 7

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
              'MEDIDAS MAXIMAS (Largo ' +
              apiResponse[0].maximum_measurements_length +
              ' cm x Ancho ' +
              apiResponse[0].maximum_measurements_width +
              ' cm x Alto ' +
              apiResponse[0].maximum_measurements_height +
              ' cm) y PESO MAXIMO (' +
              apiResponse[0].maximum_measurements_weight +
              ' kilogramos)';

            return {
              max_length_cm: apiResponse[0].maximum_measurements_length,
              max_width_cm: apiResponse[0].maximum_measurements_width,
              max_height_cm: apiResponse[0].maximum_measurements_height,
              max_weight_kg: apiResponse[0].maximum_measurements_weight,

              sta_length_cm: apiResponse[0].standard_measurements_length,
              sta_width_cm: apiResponse[0].standard_measurements_width,
              sta_height_cm: apiResponse[0].standard_measurements_height,
              sta_weight_kg: apiResponse[0].standard_measurements_weight,

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
              'MEDIDAS MAXIMAS (Largo 30 cm x Ancho 25 cm x Alto 45 cm) y PESO MAXIMO (5 kilogramos)',
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
    // return this.http.post<{ success: boolean; message: string; batchId?: string }>(`${this.baseUrl}/orders/batch-create`, payload).pipe(catchError(this.handleError));
    // Simulación:
    console.log('OrderService: Creating batch orders (simulated)', payload);
    if (payload.orders.length === 0) {
      return throwError(() => new Error('No orders to submit.'));
    }
    return of({
      success: true,
      message: 'Pedidos generados exitosamente!',
      batchId: `B-${Date.now()}`,
    }).pipe(delay(1500));
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
