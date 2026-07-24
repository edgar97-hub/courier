import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { KardexService } from './kardex.service';
import {
  KardexItem,
  KardexParams,
  PaginatedKardexResponse,
} from '../models/kardex.model';

interface KardexState {
  items: KardexItem[];
  total_count: number;
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  filter_company: string;
  filter_company_id: string;
  filter_product: string;
  filter_sku: string;
  filter_movement_type: string;
  filter_date_from: string;
  filter_date_to: string;
  filter_responsible_user: string;
  filter_observation: string;
  filter_quantity_from: number | undefined;
  filter_quantity_to: number | undefined;
  filter_stock_after_from: number | undefined;
  filter_stock_after_to: number | undefined;
  isLoading: boolean;
  error: string | null;
}

const initialState: KardexState = {
  items: [],
  total_count: 0,
  page_number: 1,
  page_size: 20,
  sort_field: 'createdAt',
  sort_direction: 'DESC',
  search_term: '',
  filter_company: '',
  filter_company_id: '',
  filter_product: '',
  filter_sku: '',
  filter_movement_type: '',
  filter_date_from: '',
  filter_date_to: '',
  filter_responsible_user: '',
  filter_observation: '',
  filter_quantity_from: undefined,
  filter_quantity_to: undefined,
  filter_stock_after_from: undefined,
  filter_stock_after_to: undefined,
  isLoading: false,
  error: null,
};

export const KardexStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalItems: computed(() => store.total_count()),
    totalPages: computed(() =>
      Math.ceil(store.total_count() / store.page_size())
    ),
  })),
  withMethods(
    (
      store,
      kardexService = inject(KardexService),
      snackBar = inject(MatSnackBar)
    ) => ({
      async loadItems(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const params: KardexParams = {
            page_number: store.page_number(),
            page_size: store.page_size(),
            sort_field: store.sort_field(),
            sort_direction: store.sort_direction(),
            search_term: store.search_term(),
            filter_company: store.filter_company() || undefined,
            filter_company_id: store.filter_company_id() || undefined,
            filter_product: store.filter_product() || undefined,
            filter_sku: store.filter_sku() || undefined,
            filter_movement_type: store.filter_movement_type() || undefined,
            filter_date_from: store.filter_date_from() || undefined,
            filter_date_to: store.filter_date_to() || undefined,
            filter_responsible_user: store.filter_responsible_user() || undefined,
            filter_observation: store.filter_observation() || undefined,
            filter_quantity_from: store.filter_quantity_from(),
            filter_quantity_to: store.filter_quantity_to(),
            filter_stock_after_from: store.filter_stock_after_from(),
            filter_stock_after_to: store.filter_stock_after_to(),
          };
          const response = await new Promise<PaginatedKardexResponse>(
            (resolve, reject) => {
              kardexService.getKardexPaginated(params).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
              });
            }
          );
          patchState(store, {
            items: response.items,
            total_count: response.total_count,
            isLoading: false,
          });
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al cargar Kardex',
            isLoading: false,
          });
        }
      },

      setColumnFilter(filters: Record<string, string>): void {
        const patch: Partial<KardexState> & { page_number: number } = {
          page_number: 1,
        };

        patch.filter_company = '';
        patch.filter_product = '';
        patch.filter_sku = '';
        patch.filter_movement_type = '';
        patch.filter_date_from = '';
        patch.filter_date_to = '';
        patch.filter_responsible_user = '';
        patch.filter_observation = '';
        patch.filter_quantity_from = undefined;
        patch.filter_quantity_to = undefined;
        patch.filter_stock_after_from = undefined;
        patch.filter_stock_after_to = undefined;

        const filterMap: Record<string, keyof KardexState> = {
          company: 'filter_company',
          product: 'filter_product',
          sku: 'filter_sku',
          movement_type: 'filter_movement_type',
          responsible_user: 'filter_responsible_user',
          observation: 'filter_observation',
        };

        for (const [colId, value] of Object.entries(filters)) {
          if (colId === 'date_from') {
            patch.filter_date_from = value;
            continue;
          }
          if (colId === 'date_to') {
            patch.filter_date_to = value;
            continue;
          }
          if (colId === 'quantity_from') {
            patch.filter_quantity_from = Number(value);
            continue;
          }
          if (colId === 'quantity_to') {
            patch.filter_quantity_to = Number(value);
            continue;
          }
          if (colId === 'stock_after_from') {
            patch.filter_stock_after_from = Number(value);
            continue;
          }
          if (colId === 'stock_after_to') {
            patch.filter_stock_after_to = Number(value);
            continue;
          }
          const stateKey = filterMap[colId];
          if (stateKey) {
            (patch as any)[stateKey] = value;
          }
        }
        patchState(store, patch);
      },

      clearColumnFilters(): void {
        patchState(store, {
          filter_company: '',
          filter_product: '',
          filter_sku: '',
          filter_movement_type: '',
          filter_date_from: '',
          filter_date_to: '',
          filter_responsible_user: '',
          filter_observation: '',
          filter_quantity_from: undefined,
          filter_quantity_to: undefined,
          filter_stock_after_from: undefined,
          filter_stock_after_to: undefined,
          page_number: 1,
        });
      },

      setPage(page_number: number): void {
        patchState(store, { page_number });
      },

      setPageSize(page_size: number): void {
        patchState(store, { page_size, page_number: 1 });
      },

      setSort(field: string, direction: 'ASC' | 'DESC'): void {
        patchState(store, { sort_field: field, sort_direction: direction });
      },

      setCompanyFilter(companyId: string): void {
        patchState(store, { filter_company_id: companyId });
      },

      setSearchTerm(term: string): void {
        patchState(store, { search_term: term, page_number: 1 });
      },

      resetFilters(): void {
        patchState(store, {
          ...initialState,
          items: store.items(),
          total_count: store.total_count(),
        });
      },
    })
  )
);
