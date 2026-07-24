import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

interface TextFilterHeaderParams extends IHeaderParams {
  placeholder?: string;
  onFilterChanged?: (value: string) => void;
}

@Component({
  selector: 'app-text-filter-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="text-filter-header">
      <div
        class="header-label"
        [class.sorted]="sortState !== ''"
        (click)="onSortClicked($event)"
      >
        <span class="sort-icon">
          @if (sortState === 'asc') { ▲ } @else if (sortState === 'desc') { ▼ }
        </span>
        <span class="header-text">{{ displayName }}</span>
      </div>
      <div class="filter-input-wrapper">
        <input
          #filterInput
          type="text"
          class="filter-input"
          [placeholder]="placeholder"
          [value]="filterValue"
          (input)="onFilterInput($event)"
          (click)="$event.stopPropagation()"
        />
        @if (filterValue) {
        <button class="clear-btn" (click)="clearFilter($event)">✕</button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .text-filter-header {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 2px;
        box-sizing: border-box;
      }
      .header-label {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        padding: 2px 0 2px 0;
        user-select: none;
      }
      .header-label:hover .header-text {
        color: #fcd5a0;
      }
      .sort-icon {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        width: 10px;
        flex-shrink: 0;
      }
      .header-text {
        font-size: 13px;
        font-weight: 600;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.15s;
      }
      .filter-input-wrapper {
        position: relative;
        padding-bottom: 2px;
      }
      .filter-input {
        width: 100%;
        padding: 4px 20px 4px 4px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 3px;
        font-size: 12px;
        font-family: 'Inter', sans-serif;
        outline: none;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        transition: border-color 0.15s;
      }
      .filter-input:focus {
        border-color: #f97c06;
        box-shadow: 0 0 0 1px rgba(249, 124, 6, 0.3);
      }
      .filter-input::placeholder {
        color: #999;
        font-size: 11px;
      }
      .clear-btn {
        position: absolute;
        right: 3px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
        font-size: 11px;
        padding: 0 3px;
        line-height: 1;
        display: flex;
        align-items: center;
      }
      .clear-btn:hover {
        color: #f97c06;
      }
    `,
  ],
})
export class TextFilterHeaderComponent
  implements IHeaderAngularComp, OnDestroy
{
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  params!: TextFilterHeaderParams;
  displayName = '';
  sortState: 'asc' | 'desc' | '' = '';
  filterValue = '';
  placeholder = 'Filtrar...';

  private filterTimeout: any;

  agInit(params: TextFilterHeaderParams): void {
    this.params = params;
    this.displayName = params.displayName || '';
    this.placeholder = params.placeholder || 'Filtrar...';

    const col = params.column;
    col.addEventListener('sortChanged', this.onSortChanged.bind(this));
    this.onSortChanged();
  }

  ngOnDestroy(): void {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
  }

  refresh(params: TextFilterHeaderParams): boolean {
    this.params = params;
    this.displayName = params.displayName || '';
    return true;
  }

  onSortClicked(event: MouseEvent): void {
    this.params.progressSort(event.shiftKey);
  }

  private onSortChanged(): void {
    const sortDef = this.params.column.getSortDef();
    this.sortState = sortDef?.direction || '';
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.params.onFilterChanged?.(value);
    }, 400);
  }

  clearFilter(event: MouseEvent): void {
    event.stopPropagation();
    this.filterValue = '';
    this.params.onFilterChanged?.('');
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
    }
  }
}
