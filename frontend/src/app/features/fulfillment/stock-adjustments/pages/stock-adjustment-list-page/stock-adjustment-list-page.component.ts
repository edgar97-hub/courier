import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StockAdjustmentTableComponent } from '../../components/stock-adjustment-table/stock-adjustment-table.component';
import { StockAdjustmentFormDialogComponent } from '../../components/stock-adjustment-form-dialog/stock-adjustment-form-dialog.component';
import { StockAdjustmentsStore } from '../../services/stock-adjustments.store';
import { PageEvent } from '@angular/material/paginator';
import { StockAdjustment } from '../../models/stock-adjustment.model';

@Component({
  selector: 'app-stock-adjustment-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    StockAdjustmentTableComponent,
  ],
  template: `
    <div class="adjustment-list-container">
      <div class="page-header">
        <h2>Ingresos y Ajustes de Stock</h2>
        <button mat-raised-button class="btn-add" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Registrar Movimiento
        </button>
      </div>

      <div class="table-toolbar">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por empresa, producto, SKU..."
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

      <app-stock-adjustment-table
        [rowData]="store.adjustments()"
        [pageSize]="store.page_size()"
        [page]="store.page_number()"
        [totalCount]="store.total_count()"
        (annulAdjustment)="openAnnulConfirm($event)"
        (sortChanged)="onSortChanged($event)"
        (pageChanged)="onPageChanged($event)"
      >
      </app-stock-adjustment-table>
    </div>
  `,
  styles: [
    `
      .adjustment-list-container {
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
        max-width: 420px;
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

      /* ===== RESPONSIVE ===== */
      @media (max-width: 600px) {
        .stock-adjustments-container {
          padding: 12px;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .page-header h2 {
          font-size: 18px;
        }
        .table-toolbar {
          flex-wrap: wrap;
        }
        .search-box {
          max-width: 100%;
          flex-basis: 100%;
        }
        .btn-refresh {
          width: 100%;
          justify-content: center;
        }
        .btn-add {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class StockAdjustmentListPageComponent implements OnInit {
  store = inject(StockAdjustmentsStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  searchValue = '';
  private searchTimeout: any;

  ngOnInit(): void {
    this.store.loadAdjustments();
  }

  refresh(): void {
    this.store.loadAdjustments();
  }

  onSortChanged(sort: { field: string; direction: 'ASC' | 'DESC' }): void {
    this.store.setSort(sort.field, sort.direction);
    this.store.loadAdjustments();
  }

  onPageChanged(event: PageEvent): void {
    this.store.setPage(event.pageIndex + 1);
    if (event.pageSize !== this.store.page_size()) {
      this.store.setPageSize(event.pageSize);
    }
    this.store.loadAdjustments();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchTerm(this.searchValue);
      this.store.loadAdjustments();
    }, 300);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.store.setSearchTerm('');
    this.store.loadAdjustments();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(StockAdjustmentFormDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.loadAdjustments();
      }
    });
  }

  openAnnulConfirm(adjustment: StockAdjustment): void {
    const typeLabel = this.getTypeLabel(adjustment.adjustment_type);
    const confirmed = confirm(
      `¿Estás seguro de anular este movimiento?\n\nTipo: ${typeLabel}\nCantidad: ${adjustment.quantity}\nProducto: ${adjustment.product?.name}\nSKU: ${adjustment.variation?.sku}\n\nEsto revertirá el stock.`,
    );
    if (!confirmed) return;

    this.store.annulAdjustment(adjustment.id).then((success) => {
      if (success) {
        this.store.loadAdjustments();
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

  private getTypeLabel(type: string): string {
    switch (type) {
      case 'INBOUND': return 'Ingreso por Abastecimiento';
      case 'MANUAL_ADD': return 'Ajuste Manual - Suma';
      case 'MANUAL_SUBTRACT': return 'Ajuste Manual - Resta';
      default: return type;
    }
  }
}
