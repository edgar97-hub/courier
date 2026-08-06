import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { ProductFormDialogComponent } from '../../components/product-form-dialog/product-form-dialog.component';
import { ProductsStore } from '../../services/products.store';
import { FulfillmentProduct } from '../../models/fulfillment-product.model';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    ProductTableComponent,
  ],
  template: `
    <div class="product-list-container">
      <div class="page-header">
        <h2>Catálogo de Productos Fulfillment</h2>
        <button mat-raised-button class="btn-add" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Producto
        </button>
      </div>

      <div class="table-toolbar">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Buscar producto..."
            [(ngModel)]="searchValue"
            (input)="onSearchInput()"
          />
          @if (searchValue) {
            <button class="clear-btn" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
        <button class="btn-refresh" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refrescar
        </button>
      </div>

      <app-product-table
        [rowData]="store.products()"
        [pageSize]="store.page_size()"
        [page]="store.page_number()"
        [totalCount]="store.total_count()"
        (editProduct)="openEditDialog($event)"
        (deleteProduct)="openDeleteConfirm($event)"
        (sortChanged)="onSortChanged($event)"
        (pageChanged)="onPageChanged($event)"
      >
      </app-product-table>
    </div>
  `,
  styles: [
    `
      .product-list-container {
        padding: 20px;
        font-family: 'Inter', sans-serif;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .page-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #012147;
      }
      .btn-add {
        background-color: #f97c06 !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        padding: 4px 16px;
      }
      .table-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .search-box {
        position: relative;
        flex: 1;
        max-width: 360px;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: #888;
      }
      .search-input {
        width: 100%;
        padding: 8px 32px 8px 34px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      }
      .search-input:focus {
        border-color: #f97c06;
      }
      .clear-btn {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #888;
        display: flex;
        align-items: center;
      }
      .btn-refresh {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        border: 1.5px solid #f97c06;
        border-radius: 6px;
        background: #fff;
        color: #f97c06;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-refresh:hover {
        background: #f97c06;
        color: #fff;
      }
    `,
  ],
})
export class ProductListPageComponent implements OnInit {
  store = inject(ProductsStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  searchValue = '';
  private searchTimeout: any;

  ngOnInit(): void {
    this.store.loadProducts();
  }

  refresh(): void {
    this.store.loadProducts();
  }

  onSortChanged(sort: { field: string; direction: 'ASC' | 'DESC' }): void {
    this.store.setSort(sort.field, sort.direction);
    this.store.loadProducts();
  }

  onPageChanged(event: PageEvent): void {
    this.store.setPage(event.pageIndex + 1);
    if (event.pageSize !== this.store.page_size()) {
      this.store.setPageSize(event.pageSize);
    }
    this.store.loadProducts();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchTerm(this.searchValue);
      this.store.loadProducts();
    }, 300);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.store.setSearchTerm('');
    this.store.loadProducts();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      panelClass: 'full-screen-dialog',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.loadProducts();
      }
    });
  }

  openEditDialog(product: FulfillmentProduct): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      disableClose: true,
      panelClass: 'full-screen-dialog',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.loadProducts();
      }
    });
  }

  openDeleteConfirm(product: FulfillmentProduct): void {
    const confirmed = confirm(
      `¿Estás seguro de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    this.store.deleteProduct(product.id).then((success) => {
      if (success) {
        this.store.loadProducts();
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
}
