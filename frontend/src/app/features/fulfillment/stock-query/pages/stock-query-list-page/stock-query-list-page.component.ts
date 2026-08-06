import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';
import { StockQueryStore } from '../../services/stock-query.store';
import { StockQueryTableComponent } from '../../components/stock-query-table/stock-query-table.component';
import { AppStore } from '../../../../../app.store';
import { UserRole } from '../../../../../common/roles.enum';

@Component({
  selector: 'app-stock-query-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    StockQueryTableComponent,
  ],
  template: `
    <div class="stock-query-container">
      <div class="page-header">
        <h2>{{ isCompany ? 'Mi Stock' : 'Consulta de Stock Maestro' }}</h2>
        <button class="btn-refresh" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refrescar
        </button>
      </div>

      <div class="table-toolbar">
        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="{{ isCompany ? 'Buscar por producto, SKU...' : 'Buscar por empresa, producto, SKU...' }}"
            [(ngModel)]="searchValue"
            (input)="onSearchInput()"
          />
          @if (searchValue) {
            <button class="clear-btn" (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
      </div>

      <app-stock-query-table
        [rowData]="store.items()"
        [pageSize]="store.page_size()"
        [page]="store.page_number()"
        [totalCount]="store.total_count()"
        [isCompany]="isCompany"
        (sortChanged)="onSortChanged($event)"
        (pageChanged)="onPageChanged($event)"
        (columnFilterChanged)="onColumnFilterChanged($event)"
      />
    </div>
  `,
  styles: [
    `
      .stock-query-container {
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
    `,
  ],
})
export class StockQueryListPageComponent implements OnInit {
  store = inject(StockQueryStore);
  appStore = inject(AppStore);

  searchValue = '';

  get isCompany(): boolean {
    const role = this.appStore.currentUser()?.role;
    return role === UserRole.COMPANY || role === UserRole.EMPRESA_DISTRIBUIDOR;
  }

  get companyId(): string | null {
    return this.appStore.currentUser()?.id || null;
  }

  ngOnInit(): void {
    if (this.isCompany && this.companyId) {
      this.store.setCompanyFilter(this.companyId);
    }
    this.store.loadItems();
  }

  private searchTimeout: any;

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.store.setSearchTerm(this.searchValue);
      this.store.loadItems();
    }, 300);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.store.setSearchTerm('');
    this.store.loadItems();
  }

  onSortChanged(sort: { field: string; direction: 'ASC' | 'DESC' }): void {
    this.store.setSort(sort.field, sort.direction);
    this.store.loadItems();
  }

  onPageChanged(event: PageEvent): void {
    this.store.setPage(event.pageIndex + 1);
    if (event.pageSize !== this.store.page_size()) {
      this.store.setPageSize(event.pageSize);
    }
    this.store.loadItems();
  }

  onColumnFilterChanged(filters: Record<string, string>): void {
    this.store.setColumnFilter(filters);
    this.store.loadItems();
  }

  refresh(): void {
    this.store.loadItems();
  }
}
