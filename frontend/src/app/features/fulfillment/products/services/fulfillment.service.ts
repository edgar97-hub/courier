import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import {
  FulfillmentProduct,
  CreateFulfillmentProductDto,
} from '../models/fulfillment-product.model';

export interface PaginatedProductsResponse {
  items: FulfillmentProduct[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface PaginatedProductsParams {
  page_number?: number;
  page_size?: number;
  sort_field?: string;
  sort_direction?: 'ASC' | 'DESC';
  search_term?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FulfillmentService {
  private readonly apiUrl = environment.apiUrl + '/fulfillment';
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

  getProductNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products/names`, {
      headers: this.getAuthHeaders(),
    });
  }

  getVariationValues(): Observable<{
    colors: string[];
    sizes: string[];
    models: string[];
  }> {
    return this.http.get<{
      colors: string[];
      sizes: string[];
      models: string[];
    }>(`${this.apiUrl}/variations/values`, { headers: this.getAuthHeaders() });
  }

  checkVariationDeletable(
    variationId: string,
  ): Observable<{ deletable: boolean; reasons: string[] }> {
    return this.http.get<{ deletable: boolean; reasons: string[] }>(
      `${this.apiUrl}/variations/${variationId}/deletable`,
      { headers: this.getAuthHeaders() },
    );
  }

  getProducts(): Observable<FulfillmentProduct[]> {
    return this.http.get<FulfillmentProduct[]>(`${this.apiUrl}/products`, {
      headers: this.getAuthHeaders(),
    });
  }

  getProductsPaginated(
    params: PaginatedProductsParams,
  ): Observable<PaginatedProductsResponse> {
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
    return this.http.get<PaginatedProductsResponse>(
      `${this.apiUrl}/products/paginated`,
      { headers, params: httpParams },
    );
  }

  getProduct(id: string): Observable<FulfillmentProduct> {
    return this.http.get<FulfillmentProduct>(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createProduct(
    dto: CreateFulfillmentProductDto,
  ): Observable<FulfillmentProduct> {
    return this.http.post<FulfillmentProduct>(`${this.apiUrl}/products`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProduct(
    id: string,
    dto: Partial<CreateFulfillmentProductDto>,
  ): Observable<FulfillmentProduct> {
    return this.http.put<FulfillmentProduct>(
      `${this.apiUrl}/products/${id}`,
      dto,
      { headers: this.getAuthHeaders() },
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
