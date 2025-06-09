import { Pipe, PipeTransform } from '@angular/core';
import { format, toZonedTime } from 'date-fns-tz';

@Pipe({
  name: 'peruDate',
})
export class PeruDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    formatString: string = 'dd/MM/yyyy HH:mm:ss'
  ): string {
    if (!value) {
      return '';
    }

    // La zona horaria para Perú
    const timeZone = 'America/Lima';

    // Convertir la fecha UTC (que viene de la API) a la zona horaria de Lima
    const zonedDate = toZonedTime(value, timeZone);

    // Formatear la fecha convertida al formato deseado
    return format(zonedDate, formatString, { timeZone });
  }
}
