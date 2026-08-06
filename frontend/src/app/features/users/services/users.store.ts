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
  UserService,
  PaginatedUsersParams,
  PaginatedUsersResponse,
} from './user.service';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

interface UsersState {
  users: User[];
  total_count: number;
  page_number: number;
  page_size: number;
  sort_field: string;
  sort_direction: 'ASC' | 'DESC';
  search_term: string;
  role: string;
  isLoading: boolean;
  error: string | null;
}

const initialUsersState: UsersState = {
  users: [],
  total_count: 0,
  page_number: 1,
  page_size: 20,
  sort_field: 'createdAt',
  sort_direction: 'DESC',
  search_term: '',
  role: '',
  isLoading: false,
  error: null,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialUsersState),
  withComputed((store) => ({
    totalUsers: computed(() => store.total_count()),
    totalPages: computed(() =>
      Math.ceil(store.total_count() / store.page_size())
    ),
  })),
  withMethods(
    (
      store,
      userService = inject(UserService),
      snackBar = inject(MatSnackBar)
    ) => ({
      async loadUsers(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const params: PaginatedUsersParams = {
            page_number: store.page_number(),
            page_size: store.page_size(),
            sort_field: store.sort_field(),
            sort_direction: store.sort_direction(),
            search_term: store.search_term(),
            role: store.role(),
          };
          const response = await new Promise<PaginatedUsersResponse>((resolve, reject) => {
            userService.getUsersPaginated(params).subscribe({
              next: (res) => resolve(res),
              error: (err) => reject(err),
            });
          });
          patchState(store, {
            users: response.items,
            total_count: response.total_count,
            isLoading: false,
          });
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al cargar usuarios',
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
        patchState(store, { sort_field: field, sort_direction: direction });
      },

      setRole(role: string): void {
        patchState(store, { role, page_number: 1 });
      },

      resetFilters(): void {
        patchState(store, {
          search_term: '',
          role: '',
          page_number: 1,
          sort_field: 'code',
          sort_direction: 'ASC',
        });
      },

      async createUser(dto: CreateUserDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            userService.createUser(dto).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Usuario creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al crear usuario',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al crear usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },

      async updateUser(id: string, dto: UpdateUserDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            userService.updateUser(id, dto).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al actualizar usuario',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al actualizar usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },

      async deleteUser(id: string): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await new Promise<void>((resolve, reject) => {
            userService.deleteUser(id).subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
          });
          snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          patchState(store, {
            error: err.message || 'Error al eliminar usuario',
            isLoading: false,
          });
          snackBar.open(err.message || 'Error al eliminar usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          return false;
        }
      },
    })
  )
);
