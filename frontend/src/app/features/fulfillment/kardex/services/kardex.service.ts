import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  KardexItem,
  PaginatedKardexResponse,
  KardexParams,
} from '../models/kardex.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class KardexService {
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

  getKardexPaginated(params: KardexParams): Observable<PaginatedKardexResponse> {
    let httpParams = new HttpParams()
      .set('page_number', params.page_number.toString())
      .set('page_size', params.page_size.toString())
      .set('sort_field', params.sort_field)
      .set('sort_direction', params.sort_direction)
      .set('search_term', params.search_term);

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
    if (params.filter_movement_type) {
      httpParams = httpParams.set('filter_movement_type', params.filter_movement_type);
    }
    if (params.filter_date_from) {
      httpParams = httpParams.set('filter_date_from', params.filter_date_from);
    }
    if (params.filter_date_to) {
      httpParams = httpParams.set('filter_date_to', params.filter_date_to);
    }
    if (params.filter_responsible_user) {
      httpParams = httpParams.set('filter_responsible_user', params.filter_responsible_user);
    }
    if (params.filter_observation) {
      httpParams = httpParams.set('filter_observation', params.filter_observation);
    }
    if (params.filter_quantity_from !== undefined) {
      httpParams = httpParams.set('filter_quantity_from', params.filter_quantity_from.toString());
    }
    if (params.filter_quantity_to !== undefined) {
      httpParams = httpParams.set('filter_quantity_to', params.filter_quantity_to.toString());
    }
    if (params.filter_stock_after_from !== undefined) {
      httpParams = httpParams.set('filter_stock_after_from', params.filter_stock_after_from.toString());
    }
    if (params.filter_stock_after_to !== undefined) {
      httpParams = httpParams.set('filter_stock_after_to', params.filter_stock_after_to.toString());
    }

    return this.http.get<PaginatedKardexResponse>(
      `${this.apiUrl}/kardex/query`,
      { headers: this.getAuthHeaders(), params: httpParams },
    );
  }
}
