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
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  CellClickedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { User } from '../../models/user.model';
import { courierGridTheme } from '../../theme/user-grid.theme';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, AgGridAngular],
  template: `
    <div class="table-toolbar">
      <div class="search-box">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar por código, usuario, email, empresa, rol..."
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

    <ag-grid-angular
      class="user-grid"
      [theme]="courierGridTheme"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef"
      [localeText]="localeText"
      [pagination]="true"
      [paginationPageSize]="20"
      [animateRows]="true"
      [domLayout]="'autoHeight'"
      (gridReady)="onGridReady($event)"
      (cellClicked)="onCellClicked($event)"
      (sortChanged)="onSortChanged($event)"
    />
  `,
  styles: [
    `
      .table-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .search-box {
        display: flex;
        align-items: center;
        flex: 1;
        max-width: 400px;
        background: #fff;
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        padding: 0 12px;
        transition: border-color 0.2s;
      }
      .search-box:focus-within {
        border-color: #f97c06;
        box-shadow: 0 0 0 2px rgba(249, 124, 6, 0.15);
      }
      .search-icon {
        color: #999;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .search-input {
        border: none;
        outline: none;
        padding: 8px;
        font-size: 13px;
        flex: 1;
        background: transparent;
        font-family: 'Inter', sans-serif;
      }
      .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        color: #999;
      }
      .clear-btn:hover {
        color: #f97c06;
      }
      .user-grid {
        width: 100%;
      }
      :host ::ng-deep .actions-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      :host ::ng-deep .actions-btn {
        cursor: pointer;
        padding: 4px 8px;
        border: none;
        background: #f0f0f0;
        color: #555;
        border-radius: 6px;
        font-size: 18px;
        line-height: 1;
        transition: background-color 0.15s, color 0.15s;
      }
      :host ::ng-deep .actions-btn:hover {
        background-color: rgba(249, 124, 6, 0.15);
        color: #f97c06;
      }
    `,
  ],
})
export class UserTableComponent implements OnInit, OnChanges {
  @Input() rowData: User[] = [];
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>();

  readonly courierGridTheme = courierGridTheme;
  private gridApi!: GridApi;
  searchValue = '';
  private searchTimeout: any;

  localeText: Record<string, string> = {
    // Paginación - labels del selector
    pageSizeSelectorLabel: 'Filas por página:',
    ariaPageSizeSelectorLabel: 'Filas por página',
    // Paginación - texto de navegación
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
    // Estados
    loadingOoo: 'Cargando...',
    noRowsToShow: 'No hay registros',
    // Textos generales
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
    // Filtros
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
    // Filtro de texto
    textFilter: 'Filtro de texto',
    textFilterPlaceholder: 'Ingrese texto...',
    // Filtro de número
    numberFilter: 'Filtro de número',
    numberFilterPlaceholder: 'Ingrese número...',
    // Filtro de fecha
    dateFilter: 'Filtro de fecha',
    dateFilterPlaceholder: 'Ingrese fecha...',
    // Filtro de conjunto
    setFilter: 'Filtro de conjunto',
    setFilterPlaceholder: 'Buscar...',
    // Ordenamiento
    sortAscending: 'Orden ascendente',
    sortDescending: 'Orden descendente',
    unsort: 'Quitar orden',
    // Grupo de columnas
    group: 'Agrupar',
    groupHeader: 'Cabecera de grupo',
    groupEmpty: 'Vacío',
    // Valores de celda
    loading: 'Cargando',
    invalidDate: 'Fecha inválida',
    invalidNumber: 'Número inválido',
    invalidText: 'Texto inválido',
    invalidValue: 'Valor inválido',
    // Exportación
    export: 'Exportar',
    csvExport: 'Exportar CSV',
    excelExport: 'Exportar Excel',
    // Menú de columna
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
    // Arrastrar y soltar
    rowDrag: 'Arrastrar fila',
    // Tool panel
    columns: 'Columnas',
    rowGroupColumns: 'Columnas de agrupación',
    rowGroupColumnsEmptyMessage: 'Arrastre columnas aquí para agrupar',
    valueColumns: 'Columnas de valores',
    pivotMode: 'Modo pivote',
    groups: 'Grupos',
    values: 'Valores',
    pivots: 'Pivotes',
    toolPanel: 'Panel de herramientas',
    // Charts
    pivotChartAndPivotMode: 'Gráfico pivote y modo pivote',
    pivotChart: 'Gráfico pivote',
    chartRange: 'Rango de gráfico',
  };

  colDefs: ColDef[] = [
    {
      field: 'code',
      headerName: 'Código',
      width: 100,
    },
    {
      field: 'username',
      headerName: 'Usuario',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 160,
      valueFormatter: (params) => this.formatRole(params.value),
    },
    {
      field: 'business_name',
      headerName: 'Empresa',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => params.value || '-',
    },
    {
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const user = params.data;
        const eGui = document.createElement('div');
        eGui.classList.add('actions-cell');
        eGui.innerHTML = `
          <button class="actions-btn" data-action="menu" title="Acciones">⋮</button>
        `;
        const btn = eGui.querySelector('.actions-btn') as HTMLElement;
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openContextMenu(event, user, params.api);
        });
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

  onSortChanged(event: SortChangedEvent): void {
    const columnState = event.api.getColumnState();
    const sortedCol = columnState.find((col) => col.sort);
    if (sortedCol) {
      this.sortChanged.emit({
        field: sortedCol.colId,
        direction: sortedCol.sort!.toUpperCase() as 'ASC' | 'DESC',
      });
    } else {
      this.sortChanged.emit({ field: 'code', direction: 'ASC' });
    }
  }

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

  formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      RECEPCIONISTA: 'Recepcionista',
      MOTORIZADO: 'Motorizado',
      EMPRESA: 'Empresa',
      EMPRESA_DISTRIBUIDOR: 'Empresa Distribuidor',
    };
    return roleMap[role] || role || '-';
  }

  openContextMenu(event: MouseEvent, user: User, api: GridApi): void {
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
      { icon: 'edit', label: 'Editar', action: 'edit', danger: false },
      { icon: 'delete', label: 'Eliminar', action: 'delete', danger: true },
    ];

    items.forEach((item, index) => {
      if (index > 0) {
        const sep = document.createElement('div');
        Object.assign(sep.style, {
          height: '1px',
          background: '#e0e0e0',
          margin: '4px 0',
        });
        contextMenu.appendChild(sep);
      }

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
    const menuHeight = 80;
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
        if (action === 'edit') {
          this.editUser.emit(user);
        } else if (action === 'delete') {
          this.deleteUser.emit(user);
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
