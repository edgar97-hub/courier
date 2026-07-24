import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import {
  StockAdjustment,
  CreateStockAdjustmentDto,
  PaginatedAdjustmentsResponse,
  PaginatedAdjustmentsParams,
} from '../models/stock-adjustment.model';
import { FulfillmentProduct } from '../../products/models/fulfillment-product.model';

@Injectable({
  providedIn: 'root',
})
export class StockAdjustmentService {
  private readonly apiUrl =
    environment.apiUrl + '/fulfillment/stock-adjustments';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        codrr_token: token,
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  getAdjustmentsPaginated(
    params: PaginatedAdjustmentsParams,
  ): Observable<PaginatedAdjustmentsResponse> {
    const headers = this.getAuthHeaders();
    let httpParams = new HttpParams();
    httpParams = httpParams.set('page_number', String(params.page_number ?? 1));
    httpParams = httpParams.set('page_size', String(params.page_size ?? 20));
    httpParams = httpParams.set('sort_field', params.sort_field ?? 'createdAt');
    httpParams = httpParams.set(
      'sort_direction',
      params.sort_direction ?? 'DESC',
    );
    if (params.search_term) {
      httpParams = httpParams.set('search_term', params.search_term);
    }
    return this.http.get<PaginatedAdjustmentsResponse>(
      `${this.apiUrl}/paginated`,
      { headers, params: httpParams },
    );
  }

  createAdjustment(dto: CreateStockAdjustmentDto): Observable<StockAdjustment> {
    return this.http.post<StockAdjustment>(`${this.apiUrl}`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  annulAdjustment(id: string): Observable<StockAdjustment> {
    return this.http.put<StockAdjustment>(
      `${this.apiUrl}/${id}/annul`,
      {},
      { headers: this.getAuthHeaders() },
    );
  }

  getProductsByCompany(companyId: string): Observable<FulfillmentProduct[]> {
    return this.http.get<FulfillmentProduct[]>(
      `${this.apiUrl}/products/by-company/${companyId}`,
      { headers: this.getAuthHeaders() },
    );
  }

  getVariationsByProduct(productId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/variations/by-product/${productId}`,
      { headers: this.getAuthHeaders() },
    );
  }

  getMainWarehouse(): Observable<{ id: string; name: string; code: string; is_main: boolean }> {
    return this.http.get<{ id: string; name: string; code: string; is_main: boolean }>(
      `${this.apiUrl}/main-warehouse`,
      { headers: this.getAuthHeaders() },
    );
  }
}
