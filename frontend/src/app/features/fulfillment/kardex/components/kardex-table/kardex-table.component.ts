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
import { KardexItem, KardexMovementType } from '../../models/kardex.model';
import { TextFilterHeaderComponent } from '../../../stock-query/components/filter-headers/text-filter-header.component';
import { NumberRangeFilterHeaderComponent } from '../../../stock-query/components/filter-headers/number-range-filter-header.component';
import { DateRangeFilterHeaderComponent } from '../filter-headers/date-range-filter-header.component';
import { SelectFilterHeaderComponent } from '../filter-headers/select-filter-header.component';

const courierGridTheme = themeQuartz
  .withPart(colorSchemeLight)
  .withPart(iconSetMaterial)
  .withParams({
    headerBackgroundColor: '#012147',
    headerTextColor: '#ffffff',
    headerFontWeight: '600',
    headerFontSize: 11,
    headerHeight: 64,
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
  selector: 'app-kardex-table',
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
      class="kardex-grid"
      [theme]="gridTheme"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [localeText]="localeText"
      (gridReady)="onGridReady($event)"
      (cellClicked)="onCellClicked($event)"
      [tooltipShowDelay]="300"
      [tooltipHideDelay]="8000"
      [tooltipInteraction]="true"
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
      aria-label="Seleccione página de movimientos"
    >
    </mat-paginator>
  `,
  styles: [
    `
      :host ::ng-deep .kardex-grid .ag-header-cell {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      :host ::ng-deep .kardex-grid .ag-right-aligned-cell,
      :host ::ng-deep .kardex-grid .ag-cell.right-align {
        text-align: right !important;
        justify-content: flex-end !important;
        padding-right: 24px;
      }
      .kardex-grid {
        width: 100%;
      }
      .movement-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .movement-badge.inbound {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .movement-badge.order-out {
        background: #fff3e0;
        color: #e65100;
      }
      .movement-badge.manual-add {
        background: #e3f2fd;
        color: #1565c0;
      }
      .movement-badge.manual-subtract {
        background: #fbe9e7;
        color: #c62828;
      }
      .movement-badge.annul-reversal {
        background: #f3e5f5;
        color: #6a1b9a;
      }
      .quantity-positive {
        color: #2e7d32;
        font-weight: 600;
      }
      .quantity-negative {
        color: #c62828;
        font-weight: 600;
      }
      :host ::ng-deep .ag-tooltip {
        background-color: #333;
        color: #fff;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 12px;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        white-space: normal;
        line-height: 1.4;
      }
    `,
  ],
})
export class KardexTableComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild(AgGridAngular) grid!: AgGridAngular;
  @Input() rowData: KardexItem[] = [];
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
    noRowsToShow: 'No hay registros de Kardex',
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
    loadingOoo: 'Cargando...',
  };

  movementTypeOptions = [
    { label: 'Ingreso por Abastecimiento', value: 'INBOUND' },
    { label: 'Salida por Pedido', value: 'ORDER_OUT' },
    { label: 'Ajuste Manual - Suma', value: 'MANUAL_ADD' },
    { label: 'Ajuste Manual - Resta', value: 'MANUAL_SUBTRACT' },
    { label: 'Reversión por Anulación', value: 'ANNUL_REVERSAL' },
  ];

  private getMovementTypeLabel(type: KardexMovementType): string {
    switch (type) {
      case 'INBOUND':
        return 'Ingreso por Abastecimiento';
      case 'ORDER_OUT':
        return 'Salida por Pedido';
      case 'MANUAL_ADD':
        return 'Ajuste Manual - Suma';
      case 'MANUAL_SUBTRACT':
        return 'Ajuste Manual - Resta';
      case 'ANNUL_REVERSAL':
        return 'Reversión por Anulación';
      default:
        return type;
    }
  }

  private getMovementBadgeClass(type: KardexMovementType): string {
    switch (type) {
      case 'INBOUND':
        return 'inbound';
      case 'ORDER_OUT':
        return 'order-out';
      case 'MANUAL_ADD':
        return 'manual-add';
      case 'MANUAL_SUBTRACT':
        return 'manual-subtract';
      case 'ANNUL_REVERSAL':
        return 'annul-reversal';
      default:
        return '';
    }
  }

  private formatVariation(v: any): string {
    if (!v) return '-';
    const parts: string[] = [`[${v.sku}]`];
    if (v.color) parts.push(`Color: ${v.color}`);
    if (v.size) parts.push(`Talla: ${v.size}`);
    if (v.model) parts.push(`Modelo: ${v.model}`);
    return parts.join(' - ');
  }

  colDefs: ColDef[] = [
    {
      headerName: 'Fecha y Hora',
      field: 'createdAt',
      width: 180,
      filter: false,
      floatingFilter: false,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString('es-PE', {
          timeZone: 'America/Lima',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
      headerComponent: DateRangeFilterHeaderComponent,
      headerComponentParams: {
        onFilterChanged: (from: string, to: string) =>
          this.onDateRangeFilter('createdAt', from, to),
      },
    },
    {
      headerName: 'Usuario (Empresa)',
      valueGetter: (params) => {
        const company = params.data?.company;
        return company?.username || '-';
      },
      field: 'company',
      flex: 0.5,
      minWidth: 120,
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
      flex: 0.5,
      minWidth: 120,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) => this.onTextFilter('product', value),
      },
    },
    {
      headerName: 'Variación',
      valueGetter: (params) => this.formatVariation(params.data?.variation),
      tooltipValueGetter: (params) =>
        this.formatVariation(params.data?.variation),
      field: 'sku',
      flex: 0.6,
      minWidth: 160,
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar SKU...',
        onFilterChanged: (value: string) => this.onTextFilter('sku', value),
      },
    },
    {
      headerName: 'Tipo de Movimiento',
      field: 'movement_type',
      width: 220,
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const type = params.data?.movement_type as KardexMovementType;
        if (!type) return '-';
        const label = this.getMovementTypeLabel(type);
        const cssClass = this.getMovementBadgeClass(type);
        return `<span class="movement-badge ${cssClass}">${label}</span>`;
      },
      headerComponent: SelectFilterHeaderComponent,
      headerComponentParams: {
        options: [
          { label: 'Ingreso por Abastecimiento', value: 'INBOUND' },
          { label: 'Salida por Pedido', value: 'ORDER_OUT' },
          { label: 'Ajuste Manual - Suma', value: 'MANUAL_ADD' },
          { label: 'Ajuste Manual - Resta', value: 'MANUAL_SUBTRACT' },
          { label: 'Reversión por Anulación', value: 'ANNUL_REVERSAL' },
        ],
        onFilterChanged: (value: string) =>
          this.onTextFilter('movement_type', value),
      },
    },
    {
      headerName: 'Cantidad',
      field: 'quantity',
      width: 150,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell',
      valueGetter: (params) => {
        const item = params.data as KardexItem;
        if (!item) return 0;
        const isNegative =
          item.movement_type === 'ORDER_OUT' ||
          item.movement_type === 'MANUAL_SUBTRACT' ||
          item.movement_type === 'ANNUL_REVERSAL';
        return isNegative ? -item.quantity : item.quantity;
      },
      cellRenderer: (params: any) => {
        const item = params.data as KardexItem;
        if (!item) return '-';
        const isNegative =
          item.movement_type === 'ORDER_OUT' ||
          item.movement_type === 'MANUAL_SUBTRACT' ||
          item.movement_type === 'ANNUL_REVERSAL';
        const cssClass = isNegative ? 'quantity-negative' : 'quantity-positive';
        if (isNegative) {
          return `<span class="${cssClass}">- ${item.quantity}</span>`;
        }
        return `<span class="${cssClass}">+${item.quantity}</span>`;
      },
      headerComponent: NumberRangeFilterHeaderComponent,
      headerComponentParams: {
        onFilterChanged: (from: string, to: string) =>
          this.onNumberRangeFilter('quantity', from, to),
      },
    },
    {
      headerName: 'Saldo',
      field: 'stock_after',
      width: 140,
      type: 'rightAligned',
      cellClass: 'ag-right-aligned-cell',
      headerComponent: NumberRangeFilterHeaderComponent,
      headerComponentParams: {
        onFilterChanged: (from: string, to: string) =>
          this.onNumberRangeFilter('stock_after', from, to),
      },
    },
    {
      headerName: 'Usuario',
      field: 'responsible_user',
      width: 160,
      sortable: false,
      valueGetter: (params) => {
        return params.data?.responsible_user || 'Sistema';
      },
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) =>
          this.onTextFilter('responsible_user', value),
      },
    },
    {
      headerName: 'Observación',
      field: 'observation',
      flex: 0.6,
      minWidth: 160,
      sortable: false,
      valueGetter: (params) => {
        return params.data?.observation || '-';
      },
      tooltipField: 'observation',
      headerComponent: TextFilterHeaderComponent,
      headerComponentParams: {
        placeholder: 'Buscar...',
        onFilterChanged: (value: string) =>
          this.onTextFilter('observation', value),
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

  private registerSortListener(): void {
    if (!this.listenerRegistered && this.gridApi) {
      this.gridApi.addEventListener('sortChanged', this.handleGridSortChanged);
      this.listenerRegistered = true;
    }
  }

  onCellClicked(event: CellClickedEvent): void {}

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
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

  onDateRangeFilter(colId: string, from: string, to: string): void {
    if (from) {
      this.activeFilters['date_from'] = from;
    } else {
      delete this.activeFilters['date_from'];
    }
    if (to) {
      this.activeFilters['date_to'] = to;
    } else {
      delete this.activeFilters['date_to'];
    }
    this.columnFilterChanged.emit({ ...this.activeFilters });
  }
}
