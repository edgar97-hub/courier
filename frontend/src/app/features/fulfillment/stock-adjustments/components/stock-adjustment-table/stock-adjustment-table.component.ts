import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import {
  themeQuartz,
  colorSchemeLight,
  iconSetMaterial,
} from 'ag-grid-community';
import { StockAdjustment } from '../../models/stock-adjustment.model';

const courierGridTheme = themeQuartz
  .withPart(colorSchemeLight)
  .withPart(iconSetMaterial)
  .withParams({
    headerBackgroundColor: '#012147',
    headerTextColor: '#ffffff',
    headerFontWeight: '600',
    headerFontSize: 11,
    headerHeight: 32,
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
  selector: 'app-stock-adjustment-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    AgGridAngular,
  ],
  template: `
    <ag-grid-angular
      class="adjustment-grid"
      [theme]="gridTheme"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [pagination]="true"
      [paginationPageSize]="pageSize"
      [paginationPageSizeSelector]="pageSizeSelector"
      [localeText]="localeText"
      (gridReady)="onGridReady($event)"
      (cellClicked)="onCellClicked($event)"
      (sortChanged)="onSortChanged($event)"
      domLayout="autoHeight"
    >
    </ag-grid-angular>
  `,
  styles: [
    `
      .adjustment-grid {
        width: 100%;
      }
      .actions-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .actions-btn {
        background: none;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 2px 8px;
        color: #555;
        transition: all 0.15s;
      }
      .actions-btn:hover {
        background: #f5f5f5;
        border-color: #f97c06;
        color: #f97c06;
      }
      .type-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .type-badge.inbound {
        background: #e3f2fd;
        color: #1565c0;
      }
      .type-badge.add {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .type-badge.subtract {
        background: #fbe9e7;
        color: #c62828;
      }
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .status-badge.registered {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-badge.annulled {
        background: #f5f5f5;
        color: #999;
        text-decoration: line-through;
      }
    `,
  ],
})
export class StockAdjustmentTableComponent implements OnInit, OnChanges {
  @Input() rowData: StockAdjustment[] = [];
  @Input() pageSize = 20;
  @Output() annulAdjustment = new EventEmitter<StockAdjustment>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>();

  readonly gridTheme = courierGridTheme;
  private gridApi!: GridApi;
  searchValue = '';
  private searchTimeout: any;

  // Hide the page size selector since pagination is server-side
  readonly pageSizeSelector: number[] | boolean = false;

  localeText: Record<string, string> = {
    pageSizeSelectorLabel: 'Filas por página:',
    ariaPageSizeSelectorLabel: 'Filas por página',
    page: 'Página',
    more: 'Más',
    to: 'a',
    of: 'de',
    next: 'Siguiente',
    last: 'Último',
    first: 'Primero',
    previous: 'Anterior',
    firstPage: 'Primera página',
    previousPage: 'Página anterior',
    nextPage: 'Siguiente página',
    lastPage: 'Última página',
    loadingOoo: 'Cargando...',
    noRowsToShow: 'No hay movimientos registrados',
    apply: 'Aplicar',
    cancel: 'Cancelar',
    clear: 'Limpiar',
    copy: 'Copiar',
    copyToClipboard: 'Copiar al portapapeles',
    reset: 'Reiniciar',
    true: 'Verdadero',
    false: 'Falso',
    empty: 'Vacío',
    search: 'Buscar',
    searchOoo: 'Buscar...',
    blank: 'En blanco',
    blanks: 'En blanco',
    selectAll: 'Seleccionar Todo',
    rowCount: 'Conteo de filas',
    noMatches: 'Sin coincidencias',
    filter: 'Filtrar',
    filterOoo: 'Filtrar...',
    filterButton: 'Filtrar',
    clearFilter: 'Limpiar filtro',
    resetFilter: 'Reiniciar filtro',
    andCondition: 'Y',
    orCondition: 'O',
    equals: 'Igual a',
    notEqual: 'Diferente de',
    lessThan: 'Menor que',
    greaterThan: 'Mayor que',
    lessThanOrEqual: 'Menor o igual que',
    greaterThanOrEqual: 'Mayor o igual que',
    inRange: 'Entre',
    inRangeStart: 'Desde',
    inRangeEnd: 'Hasta',
    contains: 'Contiene',
    notContains: 'No contiene',
    startsWith: 'Empieza con',
    endsWith: 'Termina con',
    textFilter: 'Filtro de texto',
    textFilterPlaceholder: 'Ingrese texto...',
    numberFilter: 'Filtro de número',
    numberFilterPlaceholder: 'Ingrese número...',
    dateFilter: 'Filtro de fecha',
    dateFilterPlaceholder: 'Ingrese fecha...',
    setFilter: 'Filtro de conjunto',
    setFilterPlaceholder: 'Buscar...',
    sortAscending: 'Orden ascendente',
    sortDescending: 'Orden descendente',
    unsort: 'Quitar orden',
    group: 'Agrupar',
    groupHeader: 'Cabecera de grupo',
    groupEmpty: 'Vacío',
    loading: 'Cargando',
    invalidDate: 'Fecha inválida',
    invalidNumber: 'Número inválido',
    invalidText: 'Texto inválido',
    invalidValue: 'Valor inválido',
    export: 'Exportar',
    csvExport: 'Exportar CSV',
    excelExport: 'Exportar Excel',
    pinColumn: 'Fijar columna',
    pinLeft: 'Fijar izquierda',
    pinRight: 'Fijar derecha',
    noPin: 'No fijar',
    valueAggregation: 'Agregación',
    autosizeThiscolumn: 'Autoajustar esta columna',
    autosizeAllColumns: 'Autoajustar todas las columnas',
    groupBy: 'Agrupar por',
    ungroupBy: 'Desagrupar por',
    addToValues: 'Agregar a valores',
    removeFromValues: 'Remover de valores',
    addToLabels: 'Agregar a etiquetas',
    removeFromLabels: 'Remover de etiquetas',
    resetColumns: 'Reiniciar columnas',
    expandAll: 'Expandir todo',
    collapseAll: 'Colapsar todo',
    rowDrag: 'Arrastrar fila',
    columns: 'Columnas',
    rowGroupColumns: 'Columnas de agrupación',
    rowGroupColumnsEmptyMessage: 'Arrastre columnas aquí para agrupar',
    valueColumns: 'Columnas de valores',
    pivotMode: 'Modo pivote',
    groups: 'Grupos',
    values: 'Valores',
    pivots: 'Pivotes',
    toolPanel: 'Panel de herramientas',
    pivotChartAndPivotMode: 'Gráfico pivote y modo pivote',
    pivotChart: 'Gráfico pivote',
    chartRange: 'Rango de gráfico',
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Código',
      field: 'code',
      width: 100,
    },
    {
      headerName: 'Fecha',
      field: 'createdAt',
      width: 170,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      headerName: 'Empresa',
      valueGetter: (params) => {
        const company = params.data?.company;
        return company?.username || '-';
      },
      flex: 0.5,
      minWidth: 100,
    },
    {
      headerName: 'Producto',
      valueGetter: (params) => {
        const product = params.data?.product;
        return product?.name || '-';
      },
      flex: 0.5,
      minWidth: 100,
    },
    {
      headerName: 'SKU',
      valueGetter: (params) => {
        const variation = params.data?.variation;
        return variation?.sku || '-';
      },
      width: 130,
    },
    {
      headerName: 'Tipo',
      field: 'adjustment_type',
      width: 200,
      cellRenderer: (params: any) => {
        const type = params.value;
        let label = type;
        let cssClass = '';
        switch (type) {
          case 'INBOUND':
            label = 'Ingreso por Abastecimiento';
            cssClass = 'inbound';
            break;
          case 'MANUAL_ADD':
            label = 'Ajuste Manual - Suma';
            cssClass = 'add';
            break;
          case 'MANUAL_SUBTRACT':
            label = 'Ajuste Manual - Resta';
            cssClass = 'subtract';
            break;
        }
        return `<span class="type-badge ${cssClass}">${label}</span>`;
      },
    },
    {
      headerName: 'Cantidad',
      field: 'quantity',
      width: 100,
      type: 'rightAligned',
    },
    {
      headerName: 'Observación',
      field: 'observation',
      flex: 0.5,
      minWidth: 100,
    },
    {
      headerName: 'Estado',
      field: 'status',
      width: 100,
      cellRenderer: (params: any) => {
        const status = params.value;
        const isRegistered = status === 'REGISTERED';
        const bgColor = isRegistered ? '#e8f5e9' : '#f5f5f5';
        const textColor = isRegistered ? '#2e7d32' : '#999';
        const decoration = isRegistered ? 'none' : 'line-through';
        return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${bgColor};color:${textColor};text-decoration:${decoration}">${isRegistered ? 'Registrado' : 'Anulado'}</span>`;
      },
    },
    {
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const adjustment = params.data;
        const eGui = document.createElement('div');
        eGui.classList.add('actions-cell');

        if (adjustment.status === 'REGISTERED') {
          eGui.innerHTML = `
            <button class="actions-btn" data-action="menu" title="Acciones">⋮</button>
          `;
          const btn = eGui.querySelector('.actions-btn') as HTMLElement;
          btn.addEventListener('click', (event) => {
            event.stopPropagation();
            this.openContextMenu(event, adjustment, params.api);
          });
        } else {
          eGui.innerHTML = `<span style="color:#999;font-size:11px;">—</span>`;
        }
        return eGui;
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
  };

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowData'] && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onCellClicked(event: CellClickedEvent): void {}

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchChanged.emit(this.searchValue);
    }, 300);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchChanged.emit('');
  }

  onSortChanged(event: SortChangedEvent): void {
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
  }

  openContextMenu(
    event: MouseEvent,
    adjustment: StockAdjustment,
    api: GridApi,
  ): void {
    const existingMenu = document.querySelector('.custom-context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'custom-context-menu';

    Object.assign(contextMenu.style, {
      position: 'fixed',
      zIndex: '9999',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.16)',
      border: '1px solid #e0e0e0',
      padding: '4px 0',
      minWidth: '160px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '14px',
    });

    const items = [
      { icon: 'cancel', label: 'Anular', action: 'annul', danger: true },
    ];

    items.forEach((item) => {
      const el = document.createElement('div');
      el.setAttribute('data-action', item.action);
      Object.assign(el.style, {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        cursor: 'pointer',
        gap: '10px',
        color: item.danger ? '#d32f2f' : '#333',
        transition: 'background-color 0.15s',
      });
      el.innerHTML = `
        <span class="material-icons" style="font-size:18px">${item.icon}</span>
        <span>${item.label}</span>
      `;
      el.addEventListener('mouseenter', () => {
        el.style.backgroundColor = item.danger
          ? 'rgba(211, 47, 47, 0.08)'
          : '#f5f5f5';
      });
      el.addEventListener('mouseleave', () => {
        el.style.backgroundColor = 'transparent';
      });
      contextMenu.appendChild(el);
    });

    document.body.appendChild(contextMenu);

    const x = event.clientX;
    const y = event.clientY;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;

    const menuWidth = 160;
    const menuHeight = 50;
    if (x + menuWidth > window.innerWidth) {
      contextMenu.style.left = `${x - menuWidth}px`;
    }
    if (y + menuHeight > window.innerHeight) {
      contextMenu.style.top = `${y - menuHeight}px`;
    }

    contextMenu.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('[data-action]');
      if (target) {
        const action = target.getAttribute('data-action');
        if (action === 'annul') {
          this.annulAdjustment.emit(adjustment);
        }
      }
      contextMenu.remove();
    });

    const closeMenu = (e: MouseEvent) => {
      if (!contextMenu.contains(e.target as Node)) {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }
}
