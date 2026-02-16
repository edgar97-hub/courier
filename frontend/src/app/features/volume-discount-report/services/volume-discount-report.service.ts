import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
  VolumeDiscountReportRow,
  VolumeDiscountReportParams,
} from '../models/volume-discount-report.model';

@Injectable({ providedIn: 'root' })
export class VolumeDiscountReportService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/orders/reports/volume-discounts`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      codrr_token: this.authService.getAccessToken() || '',
    });
  }

  getReport(
    params: VolumeDiscountReportParams,
  ): Observable<VolumeDiscountReportRow[]> {
    let httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);

    if (params.companyId)
      httpParams = httpParams.set('companyId', params.companyId);
    if (params.statusMeta)
      httpParams = httpParams.set('statusMeta', params.statusMeta);

    return this.http.get<VolumeDiscountReportRow[]>(this.apiUrl, {
      params: httpParams,
      headers: this.getHeaders(),
    });
  }
}
