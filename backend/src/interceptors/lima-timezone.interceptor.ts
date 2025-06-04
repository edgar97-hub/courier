// timezone.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment-timezone';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.convertDatesToPeruTime(data)),
    );
  }

  private convertDatesToPeruTime(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertDatesToPeruTime(item));
    }

    if (data && typeof data === 'object') {
      const converted = {};
      for (const key in data) {
        const value = data[key];

        if (value instanceof Date) {
          converted[key] = moment(value).tz('America/Lima').toDate();
        } else if (Array.isArray(value) || typeof value === 'object') {
          converted[key] = this.convertDatesToPeruTime(value);
        } else {
          converted[key] = value;
        }
      }
      return converted;
    }

    return data;
  }
}
