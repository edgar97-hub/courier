import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import {
  UserFormDialogComponent,
  UserDialogData,
} from '../../components/user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsersStore } from '../../services/users.store';
import { User } from '../../models/user.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule,
    UserTableComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Usuarios</h2>
        </div>
        <div class="header-actions">
          <button
            mat-stroked-button
            class="btn-refresh"
            matTooltip="Actualizar lista"
            (click)="refresh()"
          >
            <mat-icon>refresh</mat-icon>
            Refrescar
          </button>
          <button
            mat-raised-button
            class="btn-corp-primary"
            (click)="openCreateDialog()"
          >
            <mat-icon>add</mat-icon>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        @if (store.isLoading()) {
        <div class="loading-overlay">
          <p>Cargando usuarios...</p>
        </div>
        }
        @if (store.users().length === 0 && !store.isLoading() && !store.search_term()) {
        <div class="empty-container">
          <mat-icon class="empty-icon">people</mat-icon>
          <p>No hay usuarios registrados</p>
          <button
            mat-stroked-button
            class="btn-corp-secondary"
            (click)="openCreateDialog()"
          >
            Crear primer usuario
          </button>
        </div>
        } @else {
        <app-user-table
          [rowData]="store.users()"
          [pageSize]="store.page_size()"
          [page]="store.page_number()"
          [totalCount]="store.total_count()"
          (editUser)="openEditDialog($event)"
          (deleteUser)="openDeleteConfirm($event)"
          (searchChanged)="onSearchChanged($event)"
          (sortChanged)="onSortChanged($event)"
          (pageChanged)="onPageChanged($event)"
        />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--corp-blue-dark, #012147);
        margin: 0;
      }
      .page-subtitle {
        font-size: 14px;
        color: #666;
        margin: 4px 0 0 0;
      }
      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .btn-refresh {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        border: 1.5px solid #f97c06 !important;
        color: #f97c06;
      }
      .btn-refresh:hover {
        background-color: rgba(249, 124, 6, 0.08);
      }
      .loading-container,
      .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        color: #666;
      }
      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }
      .table-wrapper {
        position: relative;
      }
      .loading-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: #666;
        font-size: 14px;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 600px) {
        .page-container {
          padding: 16px;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .page-header h2 {
          font-size: 18px;
        }
        .header-actions {
          width: 100%;
          flex-wrap: wrap;
        }
        .header-actions button {
          flex: 1;
          justify-content: center;
        }
      }
    `,
  ],
})
export class UserListPageComponent implements OnInit {
  store = inject(UsersStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.store.loadUsers();
  }

  refresh(): void {
    this.store.loadUsers();
  }

  onSearchChanged(term: string): void {
    this.store.setSearchTerm(term);
    this.store.loadUsers();
  }

  onSortChanged(sort: { field: string; direction: 'ASC' | 'DESC' }): void {
    this.store.setSort(sort.field, sort.direction);
    this.store.loadUsers();
  }

  onPageChanged(event: PageEvent): void {
    this.store.setPage(event.pageIndex + 1);
    if (event.pageSize !== this.store.page_size()) {
      this.store.setPageSize(event.pageSize);
    }
    this.store.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: { mode: 'create' } as UserDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.createUser(result.data).then((success) => {
          if (success) {
            this.store.loadUsers();
          }
        });
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: { mode: 'edit', user } as UserDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && user.id) {
        this.store.updateUser(user.id, result.data).then((success) => {
          if (success) {
            this.store.loadUsers();
          }
        });
      }
    });
  }

  openDeleteConfirm(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro que deseas eliminar el usuario "${user.username}" (código: ${user.code})? Esta acción no se puede deshacer.`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'warn',
        icon: 'warning',
        iconColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && user.id) {
        this.store.deleteUser(user.id).then((success) => {
          if (success) {
            this.store.loadUsers();
          } else {
            const errorMsg = this.store.error();
            if (errorMsg) {
              this.snackBar.open(errorMsg, 'Cerrar', {
                duration: 6000,
                panelClass: ['error-snackbar'],
              });
            }
          }
        });
      }
    });
  }
}
