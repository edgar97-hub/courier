import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'default',
  standalone: true,
})
export class DefaultPipe implements PipeTransform {
  transform(value: any, defaultValue: string = '-'): string {
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return defaultValue;
    }
    return value;
  }
}
