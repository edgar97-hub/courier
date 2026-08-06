import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
} from 'ag-grid-community';
import {
  themeQuartz,
  colorSchemeLight,
  iconSetMaterial,
} from 'ag-grid-community';
import { StockQueryItem } from '../../models/stock-query.model';
import { TextFilterHeaderComponent } from '../filter-headers/text-filter-header.component';
import { NumberRangeFilterHeaderComponent } from '../filter-headers/number-range-filter-header.component';

const courierGridTheme = themeQuartz
  .withPart(colorSchemeLight)
  .withPart(iconSetMaterial)
  .withParams({
    headerBackgroundColor: '#012147',
    headerTextColor: '#ffffff',
    headerFontWeight: '600',
    headerFontSize: 11,
    headerHeight: 50,
    accentColor: '#f97c06',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    borderColor: '#e0e0e0',
    oddRowBackgroundColor: '#f8f9fa',
    selectedRowBackgroundColor: 'rgba(249, 124, 6, 0.12)',
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    spacing: 4,
  });

@Component({
  selector: 'app-stock-query-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    AgGridAngular,
  ],
  template: `
    <ag-grid-angular
      class="stock-query-grid"
      [theme]="gridTheme"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [localeText]="localeText"
      (gridReady)="onGridReady($event)"
      (cellClicked)="onCellClicked($event)"
      domLayout="autoHeight"
    >
    </ag-grid-angular>
    <mat-paginator
      [length]="totalCount"
      [pageSize]="pageSize"
      [pageIndex]="page - 1"
      [pageSizeOptions]="[10, 20, 50, 100]"
      (page)="onPageChange($event)"
      showFirstLastButtons
      aria-label="Seleccione página del inventario"
    >
    </mat-paginator>
  `,
  styles: [
    `
      :host ::ng-deep .stock-query-grid .ag-header-cell {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      :host ::ng-deep .stock-query-grid .ag-right-aligned-cell,
      :host ::ng-deep .stock-query-grid .ag-cell.right-align {
        text-align: right !important;
        justify-content: flex-end !important;
        padding-right: 24px;
      }
      .stock-query-grid {
        width: 100%;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .status-badge.normal {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-badge.low-stock {
        background: #fbe9e7;
        color: #c62828;
      }
    `,
  ],
})
export class StockQueryTableComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild(AgGridAngular) grid!: AgGridAngular;
  @Input() rowData: StockQueryItem[] = [];
  @Input() pageSize = 20;
  @Input() page = 1;
  @Input() totalCount = 0;
  @Input() isCompany = false;
  @Output() sortChanged = new EventEmitter<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>();
  @Output() columnFilterChanged = new EventEmitter<Record<string, string>>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  gridTheme = courierGridTheme;
  gridApi: GridApi | null = null;
  private listenerRegistered = false;
  private activeFilters: Record<string, string> = {};

  localeText: Record<string, string> = {
    searchOoo: 'Buscar...',
    noRowsToShow: 'No hay registros de inventario',
    page: 'Página',
    of: 'de',
    to: 'a',
    totalRows: 'Total de filas',
    blank: '—',
    firstPage: 'Primera página',
    lastPage: 'Última página',
    nextPage: 'Siguiente página',
    previousPage: 'Página anterior',
    pageSizeLabel: 'Filas por página:',
    sortAscending: 'Orden ascendente',
    sortDescending: 'Orden descendente',
    sortUnSort: 'Sin orden',
    filterOoo: 'Filtrar...',
    equals: 'Igual a',
    notEqual: 'Diferente de',
    lessThan: 'Menor que',
    greaterThan: 'Mayor que',
    lessThanOrEqual: 'Menor o igual que',
    greaterThanOrEqual: 'Mayor o igual que',
    inRange: 'Entre',
    contains: 'Contiene',
    notContains: 'No contiene',
    startsWith: 'Comienza con',
    endsWith: 'Termina con',
    andCondition: 'Y',
    orCondition: 'O',
    dateFormatOoo: 'yyyy-mm-dd',
    equalsNo: 'Igual a',
    lessThanNo: 'Menor que',
    greaterThanNo: 'Mayor que',
    lessThanOrEqualNo: 'Menor o igual que',
    greaterThanOrEqualNo: 'Mayor o igual que',
    inRangeNo: 'Entre',
    textFilter: 'Filtro de texto',
    numberFilter: 'Filtro de número',
    dateFilter: 'Filtro de fecha',
    applyFilter: 'Aplicar',
    clearFilter: 'Limpiar',
    resetFilter: 'Restablecer',
    loadingOoo: 'Cargando...',
    group: 'Grupo',
    pinColumn: 'Fijar columna',
    value: 'Valor',
    copy: 'Copiar',
    copyWithHeaders: 'Copiar con encabezados',
    ctrlC: 'Ctrl+C',
    ctrlV: 'Ctrl+V',
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Usuario (Empresa)',
      valueGetter: (params) => {
        const company = params.data?.company;
        return company?.username || '-';
      },
      field: 'company',
      minWidth: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('company', value),
      },
    },
    {
      headerName: 'Producto',
      valueGetter: (params) => {
        const product = params.data?.product;
        return product?.name || '-';
      },
      field: 'product',
      minWidth: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('product', value),
      },
    },
    {
      headerName: 'SKU',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.sku || '-';
      },
      field: 'sku',
      width: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('sku', value),
      },
    },
    {
      headerName: 'Color',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.color || '-';
      },
      field: 'color',
      width: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('color', value),
      },
    },
    {
      headerName: 'Talla',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.size || '-';
      },
      field: 'size',
      width: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('size', value),
      },
    },
    {
      headerName: 'Modelo',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.model || '-';
      },
      field: 'model',
      width: 200,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('model', value),
      },
    },
    {
      headerName: 'Stock Disponible',
      field: 'stock',
      width: 200,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell',
      headerComponent: NumberRangeFilterHeaderComponent,
      headerComponentParams: {
        onFilterChanged: (from: string, to: string) =>
          this.onNumberRangeFilter('stock', from, to),
      },
    },
    {
      headerName: 'Stock Mínimo',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.min_stock ?? '-';
      },
      field: 'min_stock',
      width: 200,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell',
      headerComponent: NumberRangeFilterHeaderComponent,
      headerComponentParams: {
        onFilterChanged: (from: string, to: string) =>
          this.onNumberRangeFilter('min_stock', from, to),
      },
    },
    {
      headerName: 'Estado',
      width: 110,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const item = params.data as StockQueryItem;
        const stock = item?.stock ?? 0;
        const minStock = item?.variation?.min_stock ?? 0;
        const isLow = stock <= minStock;
        const cssClass = isLow ? 'low-stock' : 'normal';
        const label = isLow ? 'Stock Bajo' : 'Normal';
        return `<span class="status-badge ${cssClass}">${label}</span>`;
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    floatingFilter: false,
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.grid?.api) {
      this.gridApi = this.grid.api;
      this.registerSortListener();
    }
  }

  ngOnDestroy(): void {
    if (this.listenerRegistered && this.gridApi) {
      this.gridApi.removeEventListener('sortChanged', this.handleGridSortChanged);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowData'] && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.registerSortListener();
    if (this.isCompany) {
      params.api.setColumnsVisible(['company'], false);
    }
  }

  onCellClicked(event: CellClickedEvent): void {}

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  private registerSortListener(): void {
    if (!this.listenerRegistered && this.gridApi) {
      this.gridApi.addEventListener('sortChanged', this.handleGridSortChanged);
      this.listenerRegistered = true;
    }
  }

  private handleGridSortChanged = (): void => {
    if (this.gridApi) {
      const columnState = this.gridApi.getColumnState();
      const sortedCol = columnState.find((col) => col.sort);
      if (sortedCol) {
        this.sortChanged.emit({
          field: sortedCol.colId,
          direction: sortedCol.sort!.toUpperCase() as 'ASC' | 'DESC',
        });
      } else {
        this.sortChanged.emit({ field: 'createdAt', direction: 'DESC' });
      }
    }
  };

  onTextFilter(colId: string, value: string): void {
    if (value) {
      this.activeFilters[colId] = value;
    } else {
      delete this.activeFilters[colId];
    }
    this.columnFilterChanged.emit({ ...this.activeFilters });
  }

  onNumberRangeFilter(colId: string, from: string, to: string): void {
    if (from) {
      this.activeFilters[`${colId}_from`] = from;
    } else {
      delete this.activeFilters[`${colId}_from`];
    }
    if (to) {
      this.activeFilters[`${colId}_to`] = to;
    } else {
      delete this.activeFilters[`${colId}_to`];
    }
    this.columnFilterChanged.emit({ ...this.activeFilters });
  }
}
