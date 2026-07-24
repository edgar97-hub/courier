import { computed, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { StockQueryService } from './stock-query.service';
import {
  StockQueryItem,
  StockQueryParams,
  PaginatedStockQueryResponse,
} from '../models/stock-query.model';

interface StockQueryState {
  items: StockQueryItem[];
  total_count: number;
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  // Per-column filters
  filter_company: string;
  filter_company_id: string;
  filter_product: string;
  filter_sku: string;
  filter_color: string;
  filter_size: string;
  filter_model: string;
  filter_stock_from: number | undefined;
  filter_stock_to: number | undefined;
  filter_min_stock_from: number | undefined;
  filter_min_stock_to: number | undefined;
  isLoading: boolean;
  error: string | null;
}

const initialState: StockQueryState = {
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
  filter_color: '',
  filter_size: '',
  filter_model: '',
  filter_stock_from: undefined,
  filter_stock_to: undefined,
  filter_min_stock_from: undefined,
  filter_min_stock_to: undefined,
  isLoading: false,
  error: null,
};

export const StockQueryStore = signalStore(
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
      stockQueryService = inject(StockQueryService),
      snackBar = inject(MatSnackBar)
    ) => ({
      async loadItems(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const params: StockQueryParams = {
            page_number: store.page_number(),
            page_size: store.page_size(),
            sort_field: store.sort_field(),
            sort_direction: store.sort_direction(),
            search_term: store.search_term(),
            filter_company: store.filter_company() || undefined,
            filter_company_id: store.filter_company_id() || undefined,
            filter_product: store.filter_product() || undefined,
            filter_sku: store.filter_sku() || undefined,
            filter_color: store.filter_color() || undefined,
            filter_size: store.filter_size() || undefined,
            filter_model: store.filter_model() || undefined,
            filter_stock_from: store.filter_stock_from(),
            filter_stock_to: store.filter_stock_to(),
            filter_min_stock_from: store.filter_min_stock_from(),
            filter_min_stock_to: store.filter_min_stock_to(),
          };
          const response = await new Promise<PaginatedStockQueryResponse>(
            (resolve, reject) => {
              stockQueryService.getStockQueryPaginated(params).subscribe({
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
            error: err.message || 'Error al cargar inventario',
            isLoading: false,
          });
        }
      },

      setColumnFilter(filters: Record<string, string>): void {
        const patch: Partial<StockQueryState> & { page_number: number } = {
          page_number: 1,
        };
        // Map AG Grid column IDs to store filter fields
        const filterMap: Record<string, keyof StockQueryState> = {
          company: 'filter_company',
          product: 'filter_product',
          sku: 'filter_sku',
          color: 'filter_color',
          size: 'filter_size',
          model: 'filter_model',
        };
        // Reset all filters first
        patch.filter_company = '';
        patch.filter_product = '';
        patch.filter_sku = '';
        patch.filter_color = '';
        patch.filter_size = '';
        patch.filter_model = '';
        patch.filter_stock_from = undefined;
        patch.filter_stock_to = undefined;
        patch.filter_min_stock_from = undefined;
        patch.filter_min_stock_to = undefined;

        for (const [colId, value] of Object.entries(filters)) {
          // Handle stock range filters (stock_from, stock_to)
          if (colId === 'stock_from') {
            patch.filter_stock_from = Number(value);
            continue;
          }
          if (colId === 'stock_to') {
            patch.filter_stock_to = Number(value);
            continue;
          }
          // Handle min_stock range filters
          if (colId === 'min_stock_from') {
            patch.filter_min_stock_from = Number(value);
            continue;
          }
          if (colId === 'min_stock_to') {
            patch.filter_min_stock_to = Number(value);
            continue;
          }
          // Map text column filters
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
          filter_color: '',
          filter_size: '',
          filter_model: '',
          filter_stock_from: undefined,
          filter_stock_to: undefined,
          filter_min_stock_from: undefined,
          filter_min_stock_to: undefined,
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
