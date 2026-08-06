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
  FulfillmentService,
  PaginatedProductsParams,
  PaginatedProductsResponse,
} from './fulfillment.service';
import {
  FulfillmentProduct,
  CreateFulfillmentProductDto,
} from '../models/fulfillment-product.model';

interface ProductsState {
  products: FulfillmentProduct[];
  total_count: number;
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  isLoading: boolean;
  error: string | null;
}

const initialProductsState: ProductsState = {
  products: [],
  total_count: 0,
  page_number: 1,
  page_size: 20,
  sort_field: 'createdAt',
  sort_direction: 'DESC',
  search_term: '',
  isLoading: false,
  error: null,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialProductsState),
  withComputed((store) => ({
    totalProducts: computed(() => store.total_count()),
    totalPages: computed(() =>
      Math.ceil(store.total_count() / store.page_size())
    ),
  })),
  withMethods(
    (
      store,
      fulfillmentService = inject(FulfillmentService),
      snackBar = inject(MatSnackBar)
    ) => ({
      async loadProducts(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const params: PaginatedProductsParams = {
            page_number: store.page_number(),
            page_size: store.page_size(),
            sort_field: store.sort_field(),
            sort_direction: store.sort_direction(),
            search_term: store.search_term(),
          };
          const response = await new Promise<PaginatedProductsResponse>((resolve, reject) => {
            fulfillmentService.getProductsPaginated(params).subscribe({
              next: (res) => resolve(res),
              error: (err) => reject(err),
            });
          });
          patchState(store, {
            products: response.items,
            total_count: response.total_count,
            isLoading: false,
          });
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al cargar productos',
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

      async createProduct(dto: CreateFulfillmentProductDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            fulfillmentService.createProduct(dto).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Producto creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al crear producto',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al crear producto', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },

      async updateProduct(id: string, dto: Partial<CreateFulfillmentProductDto>): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            fulfillmentService.updateProduct(id, dto).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al actualizar producto',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al actualizar producto', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },

      async deleteProduct(id: string): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            fulfillmentService.deleteProduct(id).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al eliminar producto',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al eliminar producto', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },
    })
  )
);
