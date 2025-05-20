import { Component, inject, input, signal } from '@angular/core';
import { WidgetHeaderComponent } from './widget-header/widget-header.component';
import { WidgetOptionsComponent } from './widget-options/widget-options.component';
import { NgComponentOutlet } from '@angular/common';
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { Widget } from '../dashboard.model';
import { DashboardStore } from '../dashboard.store';

@Component({
  selector: 'app-widget',
  imports: [
    WidgetHeaderComponent,
    WidgetOptionsComponent,
    NgComponentOutlet,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  template: `
    <div
      class="h-full p-7! relative mat-elevation-z3 overflow-hidden box-border rounded-[inherit]"
      cdkDrag
      cdkDragPreviewContainer="parent"
      [style.background-color]="
        data().backgroundColor ?? 'var(--mat-sys-surface-bright)'
      "
      [style.color]="data().color ?? 'inherit'"
    >
      <app-widget-header [data]="data()" [(showOptions)]="showOptions" />

      <ng-container [ngComponentOutlet]="data().content" />

      @if (showOptions()) {
      <app-widget-options [data]="data()" [(showOptions)]="showOptions" />
      }
      <div *cdkDragPlaceholder></div>
    </div>
  `,
  host: {
    '[style.grid-area]':
      '"span " + (data().rows ?? 1) + "/ span " + (data().columns ?? 1)',
    class: 'block rounded-2xl',
  },
})
export class WidgetComponent {
  data = input.required<Widget>();

  store = inject(DashboardStore);

  showOptions = signal(false);
}
