import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import {
  StockAdjustmentService,
} from './stock-adjustment.service';
import {
  StockAdjustment,
  PaginatedAdjustmentsParams,
  PaginatedAdjustmentsResponse,
} from '../models/stock-adjustment.model';

interface StockAdjustmentsState {
  adjustments: StockAdjustment[];
  total_count: number;
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  isLoading: boolean;
  error: string | null;
}

const initialAdjustmentsState: StockAdjustmentsState = {
  adjustments: [],
  total_count: 0,
  page_number: 1,
  page_size: 20,
  sort_field: 'createdAt',
  sort_direction: 'DESC',
  search_term: '',
  isLoading: false,
  error: null,
};

export const StockAdjustmentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialAdjustmentsState),
  withComputed((store) => ({
    totalAdjustments: computed(() => store.total_count()),
    totalPages: computed(() =>
      Math.ceil(store.total_count() / store.page_size())
    ),
  })),
  withMethods(
    (
      store,
      adjustmentService = inject(StockAdjustmentService),
      snackBar = inject(MatSnackBar)
    ) => ({
      async loadAdjustments(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const params: PaginatedAdjustmentsParams = {
            page_number: store.page_number(),
            page_size: store.page_size(),
            sort_field: store.sort_field(),
            sort_direction: store.sort_direction(),
            search_term: store.search_term(),
          };
          const response = await new Promise<PaginatedAdjustmentsResponse>((resolve, reject) => {
            adjustmentService.getAdjustmentsPaginated(params).subscribe({
              next: (res) => resolve(res),
              error: (err) => reject(err),
            });
          });
          patchState(store, {
            adjustments: response.items,
            total_count: response.total_count,
            isLoading: false,
          });
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al cargar movimientos',
            isLoading: false,
          });
        }
      },

      setSearchTerm(search_term: string): void {
        patchState(store, { search_term, page_number: 1 });
      },

      setPage(page_number: number): void {
        patchState(store, { page_number });
      },

      setPageSize(page_size: number): void {
        patchState(store, { page_size, page_number: 1 });
      },

      setSort(field: string, direction: 'ASC' | 'DESC'): void {
        patchState(store, {
          sort_field: field,
          sort_direction: direction,
          page_number: 1,
        });
      },

      resetFilters(): void {
        patchState(store, {
          search_term: '',
          page_number: 1,
          sort_field: 'createdAt',
          sort_direction: 'DESC',
        });
      },

      async annulAdjustment(id: string): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            adjustmentService.annulAdjustment(id).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Movimiento anulado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al anular movimiento',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al anular movimiento', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },
    })
  )
);
