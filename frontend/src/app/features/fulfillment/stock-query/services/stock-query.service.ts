import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StockQueryItem,
  PaginatedStockQueryResponse,
  StockQueryParams,
} from '../models/stock-query.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class StockQueryService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/fulfillment';
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

  getStockQueryPaginated(
    params: StockQueryParams,
  ): Observable<PaginatedStockQueryResponse> {
    let httpParams = new HttpParams()
      .set('page_number', params.page_number.toString())
      .set('page_size', params.page_size.toString())
      .set('sort_field', params.sort_field)
      .set('sort_direction', params.sort_direction)
      .set('search_term', params.search_term)

    if (params.filter_company) {
      httpParams = httpParams.set('filter_company', params.filter_company);
    }
    if (params.filter_company_id) {
      httpParams = httpParams.set('filter_company_id', params.filter_company_id);
    }
    if (params.filter_product) {
      httpParams = httpParams.set('filter_product', params.filter_product);
    }
    if (params.filter_sku) {
      httpParams = httpParams.set('filter_sku', params.filter_sku);
    }
    if (params.filter_color) {
      httpParams = httpParams.set('filter_color', params.filter_color);
    }
    if (params.filter_size) {
      httpParams = httpParams.set('filter_size', params.filter_size);
    }
    if (params.filter_model) {
      httpParams = httpParams.set('filter_model', params.filter_model);
    }
    if (params.filter_stock_from !== undefined) {
      httpParams = httpParams.set(
        'filter_stock_from',
        params.filter_stock_from.toString(),
      );
    }
    if (params.filter_stock_to !== undefined) {
      httpParams = httpParams.set(
        'filter_stock_to',
        params.filter_stock_to.toString(),
      );
    }
    if (params.filter_min_stock_from !== undefined) {
      httpParams = httpParams.set(
        'filter_min_stock_from',
        params.filter_min_stock_from.toString(),
      );
    }
    if (params.filter_min_stock_to !== undefined) {
      httpParams = httpParams.set(
        'filter_min_stock_to',
        params.filter_min_stock_to.toString(),
      );
    }

    return this.http.get<PaginatedStockQueryResponse>(
      `${this.apiUrl}/inventory/query`,
      { headers: this.getAuthHeaders(), params: httpParams },
    );
  }
}
