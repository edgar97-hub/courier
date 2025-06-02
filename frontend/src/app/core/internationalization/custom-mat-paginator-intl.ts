// src/app/core/internationalization/custom-mat-paginator-intl.ts
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs'; // Necesario para changes

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  // Subject que emite cuando cambian las etiquetas.
  // Es necesario para que el paginador se actualice si cambias las etiquetas dinámicamente.
  override changes = new Subject<void>();

  // Texto para "Items per page"
  override itemsPerPageLabel = 'Ítems por página:';

  // Texto para el tooltip del botón "Next page"
  override nextPageLabel = 'Siguiente página';

  // Texto para el tooltip del botón "Previous page"
  override previousPageLabel = 'Página anterior';

  // Texto para el tooltip del botón "First page"
  override firstPageLabel = 'Primera página';

  // Texto para el tooltip del botón "Last page"
  override lastPageLabel = 'Última página';

  // Función para generar el texto del rango (ej. "1 – 5 of 7")
  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // Si el índice de inicio excede la longitud de la lista, no intentes arreglarlo volviendo a la primera página.
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };
}
