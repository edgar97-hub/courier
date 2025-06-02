import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { DashboardStore } from '../dashboard.store';

@Component({
  selector: 'app-widgets-panel',
  imports: [MatListModule, MatIcon, CdkDrag, CdkDragPlaceholder],
  template: `
    <div class="flex flex-col gap-2 p-4 rounded-lg">
      <div class="flex gap-2 items-center mb-2">
        <mat-icon>drag_indicator</mat-icon>
        Widgets
      </div>
      @for (widget of store.widgetsToAdd(); track widget.id) {
      <div
        cdkDrag
        class="text-sm text-center rounded-2xl bg-surface-container 
        text-inverse-surface cursor-move px-4 py-2 
        hover:bg-surface-container-high mat-elevation-z2"
        [cdkDragData]="widget.id"
      >
        {{ widget.label }}
        <div *cdkDragPlaceholder></div>
      </div>
      } @empty { Drag widgets here to remove }
    </div>
  `,
  host: {
    class:
      '[view-transition-name:widgets-panel] bg-primary-container text-on-primary-container absolute right-[10px] top-[80px] w-[200px] z-2 rounded-2xl',
  },
})
export class WidgetsPanelComponent {
  store = inject(DashboardStore);
}
