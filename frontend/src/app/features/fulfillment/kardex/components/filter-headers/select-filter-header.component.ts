import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

interface SelectFilterOption {
  label: string;
  value: string;
}

interface SelectFilterHeaderParams extends IHeaderParams {
  options?: SelectFilterOption[];
  onFilterChanged?: (value: string) => void;
}

@Component({
  selector: 'app-select-filter-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="select-filter-header">
      <div
        class="header-label"
        [class.sorted]="sortState !== ''"
        (click)="onSortClicked($event)"
      >
        <span class="sort-icon">
          @if (sortState === 'asc') { ▲ } @else if (sortState === 'desc') { ▼ }
        </span>
        <span class="header-text">{{ displayName }}</span>
        <button
          class="filter-icon-btn"
          [class.active]="hasFilter || showPopup"
          (click)="togglePopup($event)"
          title="Filtrar por tipo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </button>
      </div>
      @if (hasFilter) {
      <div class="filter-summary">{{ getFilterLabel() }}</div>
      }
      @if (showPopup) {
      <div
        class="filter-popup ag-custom-component-popup"
        [style.top.px]="popupTop"
        [style.left.px]="popupLeft"
        (click)="$event.stopPropagation()"
      >
        <div class="popup-title">Filtrar tipo de movimiento</div>
        <div class="popup-options">
          <label class="option-row">
            <input
              type="radio"
              name="movementType"
              value=""
              [(ngModel)]="selectedValue"
              (change)="applyFilter()"
            />
            <span class="option-label">Todos</span>
          </label>
          @for (opt of options; track opt.value) {
          <label class="option-row">
            <input
              type="radio"
              name="movementType"
              [value]="opt.value"
              [(ngModel)]="selectedValue"
              (change)="applyFilter()"
            />
            <span class="option-label">{{ opt.label }}</span>
          </label>
          }
        </div>
        <div class="popup-actions">
          <button class="btn-clear" (click)="clearFilter()">Limpiar</button>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; width: 100%; }
      .select-filter-header {
        position: relative; width: 100%; padding: 0 2px; box-sizing: border-box;
      }
      .header-label {
        display: flex; align-items: center; gap: 4px;
        cursor: pointer; padding: 6px 0 2px 0; user-select: none;
      }
      .header-label:hover .header-text { color: #fcd5a0; }
      .sort-icon { font-size: 11px; color: rgba(255,255,255,0.7); width: 10px; flex-shrink: 0; }
      .header-text {
        font-size: 13px; font-weight: 600; color: #ffffff;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
        transition: color 0.15s;
      }
      .filter-icon-btn {
        background: none; border: 1px solid transparent; border-radius: 4px;
        cursor: pointer; padding: 2px 4px; display: flex; align-items: center;
        color: rgba(255,255,255,0.8); transition: all 0.15s; flex-shrink: 0;
      }
      .filter-icon-btn:hover { color: #ffffff; background: rgba(255,255,255,0.15); }
      .filter-icon-btn.active { color: #f97c06; border-color: rgba(249,124,6,0.4); background: rgba(249,124,6,0.15); }
      .filter-summary {
        font-size: 11px; color: #f97c06; font-weight: 500;
        text-align: center; white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis; padding: 1px 0 2px 0;
      }
      .filter-popup {
        position: fixed; z-index: 9999; min-width: 220px;
        background: var(--ag-menu-background-color, #f8f9fa);
        border: var(--ag-borders, solid 1px) var(--ag-menu-border-color, rgba(24,29,31,0.2));
        border-radius: var(--ag-border-radius, 4px);
        box-shadow: var(--ag-popup-shadow, 0 0 16px 0 rgba(0,0,0,0.15));
        padding: 12px; font-family: var(--ag-font-family, 'Inter', sans-serif);
        font-size: var(--ag-font-size, 12px);
      }
      .popup-title { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 8px; }
      .popup-options { display: flex; flex-direction: column; gap: 2px; }
      .option-row {
        display: flex; align-items: center; gap: 8px;
        padding: 5px 8px; border-radius: 4px; cursor: pointer;
        transition: background 0.1s;
      }
      .option-row:hover { background: rgba(249,124,6,0.06); }
      .option-row input[type="radio"] {
        accent-color: #f97c06; margin: 0; cursor: pointer;
      }
      .option-label { font-size: 12px; color: #333; }
      .popup-actions {
        display: flex; justify-content: flex-end; gap: 6px;
        margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0;
      }
      .btn-clear {
        padding: 4px 10px; border: 1px solid #d0d5dd; border-radius: 4px;
        background: #fff; color: #666; font-size: 11px;
        font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s;
      }
      .btn-clear:hover { border-color: #999; color: #333; }
    `,
  ],
})
export class SelectFilterHeaderComponent implements IHeaderAngularComp, OnDestroy {
  params!: SelectFilterHeaderParams;
  displayName = '';
  sortState: 'asc' | 'desc' | '' = '';
  showPopup = false;
  hasFilter = false;
  selectedValue = '';
  options: SelectFilterOption[] = [];
  popupTop = 0;
  popupLeft = 0;

  agInit(params: SelectFilterHeaderParams): void {
    this.params = params;
    this.displayName = params.displayName || '';
    this.options = params.options || [];
    const col = params.column;
    col.addEventListener('sortChanged', this.onSortChanged.bind(this));
    this.onSortChanged();
  }

  ngOnDestroy(): void {}

  refresh(params: SelectFilterHeaderParams): boolean {
    this.params = params;
    this.displayName = params.displayName || '';
    this.options = params.options || [];
    return true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showPopup) {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-popup') && !target.closest('.filter-icon-btn')) {
        this.showPopup = false;
      }
    }
  }

  onSortClicked(event: MouseEvent): void {
    this.params.progressSort(event.shiftKey);
  }

  togglePopup(event: MouseEvent): void {
    event.stopPropagation();
    this.showPopup = !this.showPopup;
    if (this.showPopup) {
      const btn = (event.target as HTMLElement).closest('.filter-icon-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const popupWidth = 230;
        const gap = 4;
        let left = rect.left;
        if (left + popupWidth > window.innerWidth - 16) {
          left = rect.right - popupWidth;
        }
        if (left < 8) left = 8;
        this.popupTop = rect.bottom + gap;
        this.popupLeft = left;
      }
    }
  }

  applyFilter(): void {
    this.hasFilter = this.selectedValue !== '';
    this.showPopup = false;
    this.params.onFilterChanged?.(this.selectedValue);
  }

  clearFilter(): void {
    this.selectedValue = '';
    this.hasFilter = false;
    this.showPopup = false;
    this.params.onFilterChanged?.('');
  }

  getFilterLabel(): string {
    const opt = this.options.find((o) => o.value === this.selectedValue);
    return opt ? opt.label : '';
  }

  private onSortChanged(): void {
    const sortDef = this.params.column.getSortDef();
    this.sortState = sortDef?.direction || '';
  }
}
